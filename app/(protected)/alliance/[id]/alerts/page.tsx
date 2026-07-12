'use client'
// app/(protected)/alliance/[id]/alerts/page.tsx
// Alliance Alert Center — one-tap emergency notification, not chat.
// Cooldown is alliance-wide (60s), enforced server-side; see
// app/api/alerts/send/route.ts for why this can't be a client-only check.

import { useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { useAlertStatus } from '@/hooks/useAlertStatus'
import { ALERT_PRESET_MAP, type AlertPresetKey } from '@/lib/alerts/presets'
import AlertStatusCard   from '@/components/alerts/AlertStatusCard'
import AlertGrid         from '@/components/alerts/AlertGrid'
import CustomAlertDialog from '@/components/alerts/CustomAlertDialog'
import NotificationPreview from '@/components/alerts/NotificationPreview'
import SendAlertButton   from '@/components/alerts/SendAlertButton'
import Toast             from '@/components/alerts/Toast'

export default function AlertPage() {
  const params = useParams()
  const allianceId = params.id as string

  const { status, loading, refetch } = useAlertStatus(allianceId)

  const [selected, setSelected]           = useState<AlertPresetKey | null>(null)
  const [customTitle, setCustomTitle]     = useState('')
  const [customMessage, setCustomMessage] = useState('')
  const [sending, setSending]             = useState(false)
  const [toast, setToast] = useState<{ message: string; detail?: string; variant: 'success' | 'error' } | null>(null)

  const preview = useMemo(() => {
    if (!selected) return { title: '', body: '' }
    const preset = ALERT_PRESET_MAP[selected]
    if (selected === 'custom') {
      return {
        title: customTitle ? `📢 ${customTitle}` : '',
        body:  customMessage,
      }
    }
    return { title: `${preset.icon} ${preset.title}`, body: preset.notificationBody }
  }, [selected, customTitle, customMessage])

  const canSend = useMemo(() => {
    if (!selected) return false
    if (selected === 'custom') return customTitle.trim().length > 0 && customMessage.trim().length > 0
    return true
  }, [selected, customTitle, customMessage])

  async function handleSend() {
    if (!selected || !canSend || sending) return
    setSending(true)
    try {
      const res = await fetch('/api/alerts/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          allianceId,
          alertType: selected,
          ...(selected === 'custom' ? { customTitle: customTitle.trim(), customMessage: customMessage.trim() } : {}),
        }),
      })
      const data = await res.json()

      if (res.status === 429) {
        setToast({
          message: 'Please wait before sending another alert.',
          detail: `${data.secondsRemaining ?? 0}s remaining`,
          variant: 'error',
        })
        refetch()
        return
      }
      if (!res.ok) {
        setToast({ message: 'Unable to send notification.', detail: data.error ?? 'Retry.', variant: 'error' })
        return
      }

      setToast({
        message: 'Notification sent successfully.',
        detail: `Delivered to ${data.sent} Members`,
        variant: 'success',
      })
      setSelected(null)
      setCustomTitle('')
      setCustomMessage('')
      refetch()
    } catch {
      setToast({ message: 'Unable to send notification.', detail: 'Retry.', variant: 'error' })
    } finally {
      setSending(false)
    }
  }

  const ready = status?.ready ?? true

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5 pb-28">
      <div>
        <h1 className="text-2xl font-bold text-tactical-900">Alliance Alert</h1>
        <p className="text-sm text-tactical-500 mt-1">Instantly notify every member of your alliance.</p>
      </div>

      <AlertStatusCard status={status} loading={loading} />

      <div className="glass-card p-5 space-y-4">
        <div>
          <h2 className="text-base font-semibold text-tactical-900">Send Alert</h2>
          <p className="text-xs text-tactical-500 mt-0.5">Choose an alert to instantly notify every alliance member.</p>
        </div>

        <AlertGrid selected={selected} disabled={!ready} onSelect={setSelected} />

        {selected === 'custom' && (
          <CustomAlertDialog
            title={customTitle}
            message={customMessage}
            onTitleChange={setCustomTitle}
            onMessageChange={setCustomMessage}
          />
        )}

        <NotificationPreview title={preview.title} body={preview.body} />

        <SendAlertButton
          ready={ready}
          secondsRemaining={status?.secondsRemaining ?? 0}
          sending={sending}
          disabled={!canSend}
          onClick={handleSend}
        />
      </div>

      {toast && (
        <Toast
          message={toast.message}
          detail={toast.detail}
          variant={toast.variant}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  )
}