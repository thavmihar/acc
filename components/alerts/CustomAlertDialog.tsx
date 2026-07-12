// components/alerts/CustomAlertDialog.tsx
'use client'

import { CUSTOM_MESSAGE_MAX_LENGTH } from '@/lib/alerts/presets'

interface CustomAlertDialogProps {
  title: string
  message: string
  onTitleChange: (v: string) => void
  onMessageChange: (v: string) => void
}

export default function CustomAlertDialog({ title, message, onTitleChange, onMessageChange }: CustomAlertDialogProps) {
  return (
    <div className="glass-card p-4 space-y-3 animate-[slideUp_0.2s_ease-out]">
      <div>
        <label className="text-xs font-medium text-tactical-600 block mb-1.5">Title</label>
        <input
          value={title}
          onChange={e => onTitleChange(e.target.value)}
          placeholder="Alliance Meeting"
          maxLength={60}
          className="w-full px-3 py-2.5 rounded-xl border border-tactical-200 bg-white/80 text-sm text-tactical-900
                     focus:outline-none focus:ring-2 focus:ring-accent-muted focus:border-accent"
        />
      </div>
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-medium text-tactical-600">Message</label>
          <span className="text-[11px] text-tactical-400">{message.length}/{CUSTOM_MESSAGE_MAX_LENGTH}</span>
        </div>
        <textarea
          value={message}
          onChange={e => onMessageChange(e.target.value.slice(0, CUSTOM_MESSAGE_MAX_LENGTH))}
          placeholder="Join voice chat now."
          rows={3}
          maxLength={CUSTOM_MESSAGE_MAX_LENGTH}
          className="w-full px-3 py-2.5 rounded-xl border border-tactical-200 bg-white/80 text-sm text-tactical-900 resize-none
                     focus:outline-none focus:ring-2 focus:ring-accent-muted focus:border-accent"
        />
      </div>
    </div>
  )
}