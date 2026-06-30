'use client'
// app/(supreme)/supreme-alliances/page.tsx
import { useEffect, useState } from 'react'

interface Alliance {
  id:               string
  tag:              string
  name:             string
  status:           string
  created_by_supreme: string
  created_at:       string
}

type ModalMode = 'create' | 'edit' | null

export default function SupremeAlliancesPage() {
  const [alliances,   setAlliances]   = useState<Alliance[]>([])
  const [loading,     setLoading]     = useState(true)
  const [modalMode,   setModalMode]   = useState<ModalMode>(null)
  const [selected,    setSelected]    = useState<Alliance | null>(null)
  const [saving,      setSaving]      = useState(false)
  const [error,       setError]       = useState('')

  // Form state
  const [tag,    setTag]    = useState('')
  const [name,   setName]   = useState('')
  const [status, setStatus] = useState('active')

  const load = async () => {
    setLoading(true)
    const res  = await fetch('/api/supreme/alliances')
    const data = await res.json()
    setAlliances(data.alliances ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setTag(''); setName(''); setStatus('active')
    setSelected(null); setError('')
    setModalMode('create')
  }

  const openEdit = (a: Alliance) => {
    setTag(a.tag); setName(a.name); setStatus(a.status)
    setSelected(a); setError('')
    setModalMode('edit')
  }

  const closeModal = () => { setModalMode(null); setSelected(null); setError('') }

  const handleSave = async () => {
    if (!tag.trim() || !name.trim()) { setError('Tag and Name are required.'); return }
    setSaving(true); setError('')
    try {
      const res = await fetch('/api/supreme/alliances', {
        method:  modalMode === 'create' ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(
          modalMode === 'create'
            ? { tag: tag.trim().toUpperCase(), name: name.trim(), status }
            : { id: selected!.id, status }
        ),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed'); return }
      closeModal()
      await load()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-5 animate-fade-in">

      {/* Header */}
      <div className="glass-card p-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-tactical-900">Alliances</h1>
          <p className="text-xs text-tactical-500 mt-0.5">{alliances.length} total</p>
        </div>
        <button onClick={openCreate} className="btn-primary text-sm">
          + New Alliance
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="glass-card p-8 text-center">
          <p className="text-sm text-tactical-400">Loading…</p>
        </div>
      ) : alliances.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <p className="text-sm text-tactical-400">No alliances yet. Create one above.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {alliances.map(a => (
            <div key={a.id} className="glass-card p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-accent-light flex items-center justify-center shrink-0">
                  <span className="font-bold text-accent-deep text-xs">[{a.tag}]</span>
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-tactical-900 text-sm truncate">{a.name}</p>
                  <p className="text-xs text-tactical-500">Created by: {a.created_by_supreme}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`badge ${a.status === 'active' ? 'badge-active' : 'badge-inactive'}`}>
                  {a.status}
                </span>
                <button
                  onClick={() => openEdit(a)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-overlay
                             text-tactical-700 hover:bg-tactical-100 transition-colors"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
             style={{ background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)' }}>
          <div className="glass-card-raised w-full max-w-sm p-6 flex flex-col gap-4">
            <h2 className="font-semibold text-tactical-900">
              {modalMode === 'create' ? 'Create Alliance' : `Edit [${selected?.tag}]`}
            </h2>

            {modalMode === 'create' && (
              <>
                <div>
                  <label className="text-xs font-medium text-tactical-600 mb-1 block">
                    Alliance Tag <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={tag}
                    onChange={e => setTag(e.target.value.toUpperCase())}
                    maxLength={6}
                    placeholder="e.g. 1307"
                    className="w-full px-3 py-2 rounded-xl border border-tactical-200 text-sm
                               bg-white text-tactical-900 focus:outline-none focus:border-accent
                               font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-tactical-600 mb-1 block">
                    Alliance Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Last War 1307"
                    className="w-full px-3 py-2 rounded-xl border border-tactical-200 text-sm
                               bg-white text-tactical-900 focus:outline-none focus:border-accent"
                  />
                </div>
              </>
            )}

            <div>
              <label className="text-xs font-medium text-tactical-600 mb-1 block">Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-tactical-200 text-sm
                           bg-white text-tactical-900 focus:outline-none focus:border-accent"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                <p className="text-xs text-red-700">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={closeModal} disabled={saving}
                      className="flex-1 px-4 py-2 rounded-xl border border-tactical-200
                                 text-sm font-medium text-tactical-600 hover:bg-tactical-50">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                      className="flex-1 btn-primary text-sm">
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
