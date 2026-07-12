// components/alerts/NotificationPreview.tsx
'use client'

import { Bell } from 'lucide-react'

interface NotificationPreviewProps {
  title: string
  body: string
}

export default function NotificationPreview({ title, body }: NotificationPreviewProps) {
  if (!title && !body) return null

  return (
    <div className="rounded-2xl border border-tactical-200 bg-tactical-50/60 p-4">
      <p className="text-[11px] font-medium text-tactical-500 uppercase tracking-wide mb-2">Preview</p>
      <div className="flex items-start gap-3 bg-white rounded-xl border border-tactical-200 p-3 shadow-sm">
        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shrink-0">
          <Bell className="w-4 h-4 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-tactical-900 truncate">{title || 'Alert title'}</p>
          <p className="text-sm text-tactical-600 leading-snug">{body || 'Alert message'}</p>
          <p className="text-[11px] text-tactical-400 mt-1">Tap to open ACC.</p>
        </div>
      </div>
    </div>
  )
}