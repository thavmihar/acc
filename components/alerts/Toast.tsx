// components/alerts/Toast.tsx
'use client'

import { useEffect } from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'

interface ToastProps {
  message: string
  detail?: string
  variant?: 'success' | 'error'
  onDismiss: () => void
  durationMs?: number
}

export default function Toast({ message, detail, variant = 'success', onDismiss, durationMs = 4000 }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onDismiss, durationMs)
    return () => clearTimeout(t)
  }, [onDismiss, durationMs])

  const isSuccess = variant === 'success'

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-lg border
        animate-[slideUp_0.25s_ease-out]
        ${isSuccess ? 'bg-white border-accent-muted' : 'bg-white border-red-200'}`}
      role="status"
    >
      {isSuccess
        ? <CheckCircle2 className="w-5 h-5 text-accent-mid shrink-0" />
        : <XCircle className="w-5 h-5 text-red-500 shrink-0" />}
      <div>
        <p className="text-sm font-semibold text-tactical-900">{message}</p>
        {detail && <p className="text-xs text-tactical-500 mt-0.5">{detail}</p>}
      </div>
    </div>
  )
}