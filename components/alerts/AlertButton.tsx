// components/alerts/AlertButton.tsx
'use client'

import type { AlertPreset } from '@/lib/alerts/presets'

interface AlertButtonProps {
  preset: AlertPreset
  selected: boolean
  disabled: boolean
  onSelect: (key: AlertPreset['key']) => void
}

export default function AlertButton({ preset, selected, disabled, onSelect }: AlertButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect(preset.key)}
      className={`flex flex-col items-start gap-1 p-4 rounded-2xl border text-left transition-all duration-150
        active:scale-[0.97]
        ${disabled ? 'opacity-40 cursor-not-allowed border-tactical-200' : ''}
        ${!disabled && selected
          ? 'border-accent bg-accent-light/60 shadow-sm'
          : !disabled
            ? 'border-tactical-200 bg-white/70 hover:border-accent-muted hover:bg-accent-light/30'
            : 'bg-white/50'}`}
    >
      <span className="text-2xl leading-none">{preset.icon}</span>
      <span className="text-sm font-semibold text-tactical-900 mt-1">{preset.title}</span>
      <span className="text-xs text-tactical-500 leading-snug">{preset.description}</span>
    </button>
  )
}