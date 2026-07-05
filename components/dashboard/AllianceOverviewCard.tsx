'use client'
// components/dashboard/AllianceOverviewCard.tsx
//
// Members + Gift Level, editable in place for R4/R5/Supreme — no more
// having to leave the dashboard to hit /alliance/settings just to bump
// the gift level. Alliance Rank and Status boxes were dropped entirely
// per request (Rank was hardcoded/unused, Status was redundant).

import { useState } from 'react'

interface Props {
  allianceId:       string
  activeCount:      number
  initialGiftLevel: number | null
  canEdit:          boolean
}

export default function AllianceOverviewCard({
  allianceId,
  activeCount,
  initialGiftLevel,
  canEdit,
}: Props) {
  const [editing,    setEditing]    = useState(false)
  const [giftLevel,  setGiftLevel]  = useState(initialGiftLevel ?? 1)
  const [saved,      setSaved]      = useState(giftLevel)
  const [saving,     setSaving]     = useState(false)
  const [error,      setError]      = useState('')

  const startEdit = () => {
    setGiftLevel(saved)
    setError('')
    setEditing(true)
  }

  const cancel = () => {
    setGiftLevel(saved)
    setError('')
    setEditing(false)
  }

  const save = async () => {
    setSaving(true)
    setError('')
    try {
      const res  = await fetch('/api/alliance/settings', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ alliance_id: allianceId, gift_level: giftLevel }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed to save'); return }
      setSaved(giftLevel)
      setEditing(false)
    } catch {
      setError('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-tactical-500">Alliance Overview</p>
          <p className="font-semibold text-tactical-900">Command Center</p>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && !editing && (
            <button
              onClick={startEdit}
              className="text-xs px-2.5 py-1 rounded-lg border border-tactical-200 text-tactical-500 hover:border-accent hover:text-accent transition-colors"
            >
              ✏ Edit
            </button>
          )}
          <span className="text-3xl">🏰</span>
        </div>
      </div>

      {error && <p className="text-xs text-red-600 mb-3">{error}</p>}

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-surface-overlay p-3 text-center">
          <p className="text-xs text-tactical-500">Members</p>
          <p className="text-xl font-semibold text-tactical-900">
            {activeCount}/100
          </p>
        </div>

        <div className="rounded-xl bg-surface-overlay p-3 text-center">
          <p className="text-xs text-tactical-500 mb-1">Gift Level</p>
          {editing ? (
            <input
              type="number"
              min={1}
              className="w-full text-center text-xl font-semibold text-tactical-900 bg-white rounded-lg border border-accent/40 py-0.5"
              value={giftLevel}
              onChange={e => setGiftLevel(Number(e.target.value))}
            />
          ) : (
            <p className="text-xl font-semibold text-tactical-900">{saved}</p>
          )}
        </div>
      </div>

      {editing && (
        <div className="flex gap-2 justify-end mt-3">
          <button onClick={cancel} disabled={saving} className="btn-secondary text-xs py-1.5 px-3">
            Cancel
          </button>
          <button onClick={save} disabled={saving} className="btn-primary text-xs py-1.5 px-3">
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      )}
    </div>
  )
}
