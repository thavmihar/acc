'use client'
// app/(supreme)/supreme-commanders/page.tsx
import { useEffect, useState } from 'react'

interface Commander {
  uid:                 string
  name:                string
  role:                string
  status:              string
  verification_status: string
  alliance_id:         string | null
  alliance_tag?:       string | null
  linked_google_uid?:  string | null
}

export default function SupremeCommandersPage() {
  const [commanders, setCommanders] = useState<Commander[]>([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [removing,   setRemoving]   = useState<string | null>(null)
  const [confirmUid, setConfirmUid] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    const res  = await fetch('/api/supreme/commanders')
    const data = await res.json()
    setCommanders(data.commanders ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleRemove = async (uid: string) => {
    setRemoving(uid)
    try {
      const res = await fetch('/api/supreme/commanders', {
        method:  'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ uid }),
      })
      if (res.ok) {
        setCommanders(prev => prev.filter(c => c.uid !== uid))
      }
    } finally {
      setRemoving(null)
      setConfirmUid(null)
    }
  }

  const filtered = commanders.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.uid.toLowerCase().includes(search.toLowerCase()) ||
    (c.alliance_tag ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const ROLE_COLOR: Record<string, string> = {
    supreme: 'badge-active',
    r5:      'badge-active',
    r4:      'badge-warning',
    r3:      'badge-warning',
    r2:      'badge-inactive',
    r1:      'badge-inactive',
  }

  const VERIFY_COLOR: Record<string, string> = {
    linked:    'badge-active',
    verified:  'badge-warning',
    code_sent: 'badge-warning',
    pending:   'badge-inactive',
  }

  return (
    <div className="flex flex-col gap-5 animate-fade-in">

      {/* Header */}
      <div className="glass-card p-5">
        <h1 className="text-xl font-semibold text-tactical-900">Commanders</h1>
        <p className="text-xs text-tactical-500 mt-0.5">
          {commanders.length} total · {commanders.filter(c => c.verification_status === 'linked').length} linked
        </p>
      </div>

      {/* Search */}
      <div className="glass-card p-3">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, UID or alliance tag…"
          className="w-full px-3 py-2 rounded-xl border border-tactical-200 text-sm
                     bg-white text-tactical-900 focus:outline-none focus:border-accent"
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="glass-card p-8 text-center">
          <p className="text-sm text-tactical-400">Loading…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <p className="text-sm text-tactical-400">No commanders found.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map(c => (
            <div key={c.uid} className="glass-card p-4">
              <div className="flex items-center justify-between gap-3">
                {/* Avatar + info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-accent-light flex items-center
                                  justify-center shrink-0">
                    <span className="text-sm font-bold text-accent-deep">
                      {c.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-tactical-900 text-sm truncate">{c.name}</p>
                    <p className="text-xs text-tactical-500 font-mono truncate">{c.uid}</p>
                  </div>
                </div>

                {/* Remove button */}
                {confirmUid === c.uid ? (
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-red-600 font-medium">Remove?</span>
                    <button
                      onClick={() => handleRemove(c.uid)}
                      disabled={removing === c.uid}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-600
                                 text-white hover:bg-red-700 transition-colors"
                    >
                      {removing === c.uid ? '…' : 'Yes'}
                    </button>
                    <button
                      onClick={() => setConfirmUid(null)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-overlay
                                 text-tactical-700 hover:bg-tactical-100 transition-colors"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmUid(c.uid)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium border border-red-200
                               text-red-600 hover:bg-red-50 transition-colors shrink-0"
                  >
                    Remove
                  </button>
                )}
              </div>

              {/* Badges row */}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className={`badge ${ROLE_COLOR[c.role] ?? 'badge-inactive'}`}>
                  {c.role}
                </span>
                <span className={`badge ${VERIFY_COLOR[c.verification_status] ?? 'badge-inactive'}`}>
                  {c.verification_status}
                </span>
                {c.alliance_tag && (
                  <span className="badge badge-inactive font-mono">[{c.alliance_tag}]</span>
                )}
                {c.linked_google_uid && (
                  <span className="text-xs text-tactical-400">
                    🔗 Google linked
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
