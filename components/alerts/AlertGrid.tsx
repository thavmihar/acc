// components/alerts/AlertGrid.tsx
'use client'

import { ALERT_PRESETS, type AlertPresetKey } from '@/lib/alerts/presets'
import AlertButton from './AlertButton'

interface AlertGridProps {
  selected: AlertPresetKey | null
  disabled: boolean
  onSelect: (key: AlertPresetKey) => void
}

export default function AlertGrid({ selected, disabled, onSelect }: AlertGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {ALERT_PRESETS.map(preset => (
        <AlertButton
          key={preset.key}
          preset={preset}
          selected={selected === preset.key}
          disabled={disabled}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}