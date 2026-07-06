// app/(protected)/admin/commanders/page.tsx
'use client'
import { useState, useEffect } from 'react'

// ── Types ─────────────────────────────────────
interface Commander {
  uid: string; name: string; role: string
  status: string; alliance_id: string | null
  verification_status: string; inactive_flagged: boolean
  linked_google_uid: string | null
}
interface Alliance { id: string; tag: string; name: string }

const ROLES    = ['r1','r2','r3','r4','r5','supreme']
const STATUSES = ['active','inactive','disabled','unassigned','former']

export default function AdminCommandersPage() {
  const [commanders, setCommanders] = useState<Commander[]>([])
  const [alliances,  setAlliances]  = useState<Alliance[]>([])
  const [loading,    setLoading]    = useState(true)
  const [showForm,   setShowForm]   = useState(false)
  const [saving,     setSaving]     = useState(false)
  const [msg,        setMsg]        = useState('')
  const [search,     setSearch]     = useState('')

  // Form state (add new commander)
  const [form, setForm] = useState({
    uid: '', name: '', role: 'r1', alliance_id: '', status: 'unassigned',
  })

  // Move / transfer state (edit existing commander's role + alliance)
  const [movingUid,  setMovingUid]  = useState<string | null>(null)
  const [moveForm,   setMoveForm]   = useState({ role: 'r1', alliance_id: '' })
  const [moving,     setMoving]     = useState(false)

  useEffect(() => { fetchData() }, [])

  // Keep alliance/commander lists fresh if the tab was created or edited
  // elsewhere (e.g. Supreme creating an alliance in another tab) while this
  // page sat open in the background.
  useEffect(() => {
    const onFocus = () => fetchData()
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/commanders')
    const data = await res.json()
    setCommanders(data.commanders ?? [])
    setAlliances(data.alliances ?? [])
    setLoading(false)
  }

  const handleSave = async () => {
    if (!form.uid.trim() || !form.name.trim()) {
      setMsg('UID and name are required'); return
    }
    setSaving(true); setMsg('')
    try {
      const res  = await fetch('/api/admin/commanders', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          uid:         form.uid.trim(),
          name:        form.name.trim(),
          role:        form.role,
          alliance_id: form.alliance_id || null,
          status:      form.alliance_id ? 'active' : 'unassigned',
        }),
      })
      const data = await res.json()
      if (!res.ok) { setMsg(data.error); return }
      setMsg('Commander added successfully')
      setShowForm(false)
      setForm({ uid: '', name: '', role: 'r1', alliance_id: '', status: 'unassigned' })
      fetchData()
    } catch { setMsg('Failed to save') }
    finally  { setSaving(false) }
  }

  const handleDisable = async (uid: string, disable: boolean) => {
    await fetch('/api/admin/commanders', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ uid, status: disable ? 'disabled' : 'active' }),
    })
    fetchData()
  }

  const handleUnlink = async (uid: string, name: string) => {
    const confirmed = window.confirm(
      `Unlink ${name}'s Google account?\n\nThis does NOT delete the commander, their history, or their stats. It only removes the Google account link so a new one can be linked via re-registration.`
    )
    if (!confirmed) return

    setMsg('')
    const res  = await fetch('/api/admin/commanders', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ uid, action: 'unlink_google' }),
    })
    const data = await res.json()
    if (!res.ok) { setMsg(data.error); return }
    setMsg(`${name}'s Google account has been unlinked`)
    fetchData()
  }

  const startMove = async (c: Commander) => {
    await fetchData() // pull fresh alliances in case one was just created elsewhere
    setMovingUid(c.uid)
    setMoveForm({ role: c.role, alliance_id: c.alliance_id ?? '' })
    setMsg('')
  }

  const cancelMove = () => {
    setMovingUid(null)
  }

  const handleMove = async (uid: string, name: string) => {
    setMoving(true); setMsg('')
    try {
      const res  = await fetch('/api/admin/commanders', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          uid,
          role:        moveForm.role,
          alliance_id: moveForm.alliance_id || null,
          status:      moveForm.alliance_id ? 'active' : 'unassigned',
        }),
      })
      const data = await res.json()
      if (!res.ok) { setMsg(data.error); return }
      const destTag = alliances.find(a => a.id === moveForm.alliance_id)?.tag
      setMsg(
        moveForm.alliance_id
          ? `${name} moved to [${destTag}] as ${moveForm.role.toUpperCase()}`
          : `${name} unassigned from their alliance`
      )
      setMovingUid(null)
      fetchData()
    } catch { setMsg('Failed to move commander') }
    finally  { setMoving(false) }
  }

  const filtered = commanders.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.uid.toLowerCase().includes(search.toLowerCase())
  )

  const getAllianceTag = (id: string | null) =>
    alliances.find(a => a.id === id)?.tag ?? '—'

  const STATUS_BADGE: Record<string, string> = {
    active: 'badge-active', inactive: 'badge-inactive',
    disabled: 'badge-disabled', unassigned: 'badge-pending', former: 'badge-former',
  }

  return (
    <div className="flex flex-col gap-5 animate-fade-in">

      <div className="flex items-center justify-between">
        <div className="page-header mb-0">
          <h1 className="page-title">Commanders</h1>
          <p className="page-subtitle">{commanders.length} total commanders</p>
        </div>
        <button
          onClick={() => {
            if (!showForm) fetchData() // pull fresh alliances in case one was just created elsewhere
            setShowForm(!showForm)
          }}
          className="btn-primary"
        >
          {showForm ? 'Cancel' : '+ Add Commander'}
        </button>
      </div>

      {/* Feedback */}
      {msg && (
        <div className={`p-3 rounded-xl text-sm border animate-fade-in ${
          msg.toLowerCase().includes('fail') || msg.toLowerCase().includes('already') || msg.toLowerCase().includes('required')
            ? 'bg-red-50 border-red-200 text-red-700'
            : 'bg-accent-light border-accent/30 text-accent-deep'
        }`}>
          {msg}
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <div className="glass-card p-5 flex flex-col gap-4 animate-slide-up">
          <p className="font-semibold text-tactical-900">Add New Commander</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-tactical-600 block mb-1">Commander UID *</label>
              <input
                className="input-base font-mono"
                placeholder="Game UID e.g. 123456789"
                value={form.uid}
                onChange={e => setForm(f => ({ ...f, uid: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-tactical-600 block mb-1">Commander Name *</label>
              <input
                className="input-base"
                placeholder="In-game name"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-tactical-600 block mb-1">Role</label>
              <select
                className="input-base"
                value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              >
                {ROLES.map(r => (
                  <option key={r} value={r}>{r.toUpperCase()}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-tactical-600 block mb-1">Alliance</label>
              <select
                className="input-base"
                value={form.alliance_id}
                onChange={e => setForm(f => ({ ...f, alliance_id: e.target.value }))}
              >
                <option value="">— No alliance —</option>
                {alliances.map(a => (
                  <option key={a.id} value={a.id}>[{a.tag}] {a.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : 'Add Commander'}
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <input
        className="input-base"
        placeholder="Search by name or UID..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <svg className="animate-spin h-6 w-6 text-accent" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-tactical-400">No commanders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-glass">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>UID</th>
                  <th>Role</th>
                  <th>Alliance</th>
                  <th>Status</th>
                  <th>Verified</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <>
                    <tr key={c.uid}>
                      <td className="font-medium text-tactical-900">{c.name}</td>
                      <td className="font-mono text-xs text-tactical-500">{c.uid}</td>
                      <td><span className="badge badge-active uppercase text-xs">{c.role}</span></td>
                      <td className="font-mono text-sm">{getAllianceTag(c.alliance_id)}</td>
                      <td>
                        <span className={`badge ${STATUS_BADGE[c.status] ?? 'badge-inactive'}`}>
                          {c.status}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${c.verification_status === 'linked' ? 'badge-active' : 'badge-pending'}`}>
                          {c.verification_status}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => movingUid === c.uid ? cancelMove() : startMove(c)}
                            className="btn-secondary text-xs py-1 px-2"
                          >
                            {movingUid === c.uid ? 'Cancel' : 'Move'}
                          </button>
                          <button
                            onClick={() => handleDisable(c.uid, c.status !== 'disabled')}
                            className={c.status === 'disabled' ? 'btn-ghost text-xs py-1 px-2' : 'btn-danger text-xs py-1 px-2'}
                          >
                            {c.status === 'disabled' ? 'Enable' : 'Disable'}
                          </button>
                          {c.linked_google_uid && (
                            <button
                              onClick={() => handleUnlink(c.uid, c.name)}
                              className="btn-secondary text-xs py-1 px-2"
                              title="Remove this commander's Google account link"
                            >
                              Unlink
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Inline move/transfer row */}
                    {movingUid === c.uid && (
                      <tr key={`${c.uid}-move`}>
                        <td colSpan={7} className="bg-surface-overlay">
                          <div className="flex flex-wrap items-end gap-3 p-3">
                            <div>
                              <label className="text-xs font-medium text-tactical-600 block mb-1">New Role</label>
                              <select
                                className="input-base"
                                value={moveForm.role}
                                onChange={e => setMoveForm(f => ({ ...f, role: e.target.value }))}
                              >
                                {ROLES.map(r => (
                                  <option key={r} value={r}>{r.toUpperCase()}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-tactical-600 block mb-1">New Alliance</label>
                              <select
                                className="input-base"
                                value={moveForm.alliance_id}
                                onChange={e => setMoveForm(f => ({ ...f, alliance_id: e.target.value }))}
                              >
                                <option value="">— Unassign (no alliance) —</option>
                                {alliances.map(a => (
                                  <option key={a.id} value={a.id}>[{a.tag}] {a.name}</option>
                                ))}
                              </select>
                            </div>
                            <button
                              onClick={() => handleMove(c.uid, c.name)}
                              disabled={moving}
                              className="btn-primary text-sm"
                            >
                              {moving ? 'Moving...' : 'Confirm Transfer'}
                            </button>
                            <p className="text-xs text-tactical-400 basis-full">
                              This bypasses the normal transfer request/approval flow — Supreme moves are immediate.
                              If this commander is linked to a Google account, their role/alliance updates live
                              on their screen without needing to log out.
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
