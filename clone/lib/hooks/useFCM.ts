'use client'

// hooks/useFCM.ts
// ACC #7C — FCM permission + token registration + foreground listener

import { useEffect, useRef, useCallback } from 'react'
import { getMessaging, getToken, onMessage, MessagePayload } from 'firebase/messaging'
import { app } from '@/lib/firebase/client' // ← matches your actual export

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY!

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FCMPayload {
  title: string
  body:  string
  type:  'inactive_flag' | 'transfer_request' | 'event_update' | 'general'
  url?:  string
  data?: Record<string, string>
}

interface UseFCMOptions {
  commanderId:     string | null  // null = not logged in yet
  onNotification?: (payload: FCMPayload) => void
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useFCM({ commanderId, onNotification }: UseFCMOptions) {
  const savedTokenRef  = useRef<string | null>(null)
  const unsubscribeRef = useRef<(() => void) | null>(null)

  // ── Save token ───────────────────────────────────────────────────────────────
  const saveToken = useCallback(async (token: string) => {
    if (savedTokenRef.current === token) return

    try {
      // No Authorization header needed — session cookie is sent automatically
      const res = await fetch('/api/fcm/register', {
        method:      'POST',
        headers:     { 'Content-Type': 'application/json' },
        credentials: 'include',
        body:        JSON.stringify({ token }),
      })

      if (res.ok) {
        savedTokenRef.current = token
        console.log('[FCM] Token saved ✓')
      } else {
        console.error('[FCM] Save failed:', await res.json().catch(() => ({})))
      }
    } catch (err) {
      console.error('[FCM] Save error:', err)
    }
  }, [])

  // ── Remove token (call on logout) ────────────────────────────────────────────
  const removeToken = useCallback(async () => {
    if (!savedTokenRef.current) return
    try {
      await fetch('/api/fcm/register', {
        method:      'DELETE',
        headers:     { 'Content-Type': 'application/json' },
        credentials: 'include',
        body:        JSON.stringify({ token: savedTokenRef.current }),
      })
      savedTokenRef.current = null
    } catch (err) {
      console.error('[FCM] Remove error:', err)
    }
  }, [])

  // ── Main init effect ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!commanderId) return
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      console.warn('[FCM] Service workers not supported')
      return
    }

    let cancelled = false

    async function init() {
      try {
        // 1. Request permission
        const permission = await Notification.requestPermission()
        if (permission !== 'granted') {
          console.warn('[FCM] Permission denied')
          return
        }

        // 2. Register service worker
        const registration = await navigator.serviceWorker.register(
          '/firebase-messaging-sw.js',
          { scope: '/' }
        )
        await navigator.serviceWorker.ready
        if (cancelled) return

        // 3. Get FCM token
        const messaging = getMessaging(app)
        const token = await getToken(messaging, {
          vapidKey:                  VAPID_KEY,
          serviceWorkerRegistration: registration,
        })

        if (!token) {
          console.warn('[FCM] No token returned — check VAPID key')
          return
        }
        if (cancelled) return

        // 4. Save to Supabase via API
        await saveToken(token)

        // 5. Foreground message listener
        const unsub = onMessage(messaging, (payload: MessagePayload) => {
          const n = payload.notification
          const d = payload.data ?? {}

          onNotification?.({
            title: n?.title ?? 'ACC',
            body:  n?.body  ?? '',
            type:  (d.type as FCMPayload['type']) ?? 'general',
            url:   d.url,
            data:  d,
          })
        })

        unsubscribeRef.current = unsub
      } catch (err) {
        console.error('[FCM] Init error:', err)
      }
    }

    init()

    return () => {
      cancelled = true
      unsubscribeRef.current?.()
    }
  }, [commanderId, saveToken, onNotification])

  return { removeToken }
}