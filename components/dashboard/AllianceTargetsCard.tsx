'use client'
// components/dashboard/AllianceTargetsCard.tsx
//
// Weekly Alliance Targets, editable in place for R4/R5/Supreme. Up to 5
// target slots, each with a text field and a "completed" checkbox. Saving
// writes all 5 in one PATCH; empty text fields are stored as null so they
// stay hidden in the read-only view (same as before).

import { useState } from 'react'

interface TargetSlot {
  text:      string
  completed: boolean
}

interface Props {
  allianceId:     string
  initialTargets: TargetSlot[] // always length 5, in order
  canEdit:        boolean
}

export default function AllianceTargetsCard({ allianceId, initialTargets, canEdit }: Props) {
  const [editing,  setEditing]  = useState(false)
  const [targets,  setTargets]  = useState<TargetSlot[]>(initialTargets)
  const [saved,    setSaved]    = useState<TargetSlot[]>(initialTargets)
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState('')

  const startEdit = () => {
    setTargets(saved)
    setError('')
    setEditing(true)
  }

  const cancel = () => {
    setTargets(saved)
    setError('')
    setEditing(false)
  }

  const updateSlot = (i: number, patch: Partial<TargetSlot>) => {
    setTargets(prev => prev.map((t, idx) => idx === i ? { ...t, ...patch } : t))
  }

  const save = async () => {
    setSaving(true)
    setError('')
    try {
      const body: Record<string, unknown> = { alliance_id: allianceId }
      targets.forEach((t, i) => {
        body[`target_${i + 1}`] = t.text.trim() || null
        body[`target_${i + 1}_completed`] = t.completed
      })

      const res  = await fetch('/api/alliance/settings', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed to save'); return }
      setSaved(targets)
      setEditing(false)
    } catch {
      setError('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const visibleTargets = saved.filter(t => t.text.trim())

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-tactical-500">Weekly Objectives</p>
          <p className="font-semibold text-tactical-900">Alliance Targets</p>
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
          <span className="text-3xl">🎯</span>
        </div>
      </div>

      {error && <p className="text-xs text-red-600 mb-3">{error}</p>}

      {editing ? (
        <div className="flex flex-col gap-2.5">
          {targets.map((t, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => updateSlot(i, { completed: !t.completed })}
                className={`shrink-0 w-5 h-5 rounded-full border flex items-center justify-center text-xs ${
                  t.completed
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-tactical-300 text-transparent'
                }`}
              >
                ✓
              </button>
              <input
                type="text"
                placeholder={`Target ${i + 1} (leave blank to hide)`}
                value={t.text}
                onChange={e => updateSlot(i, { text: e.target.value })}
                className="input-base flex-1 text-sm py-1.5"
              />
            </div>
          ))}

          <div className="flex gap-2 justify-end mt-1">
            <button onClick={cancel} disabled={saving} className="btn-secondary text-xs py-1.5 px-3">
              Cancel
            </button>
            <button onClick={save} disabled={saving} className="btn-primary text-xs py-1.5 px-3">
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {visibleTargets.length > 0 ? (
            visibleTargets.map((t, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className={t.completed ? 'text-green-500' : 'text-amber-500'}>
                  {t.completed ? '✓' : '○'}
                </span>
                <span className="text-sm text-tactical-800">{t.text}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-tactical-400">No targets set</p>
          )}
        </div>
      )}
    </div>
  )
}
