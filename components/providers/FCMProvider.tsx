'use client'

// components/providers/FCMProvider.tsx
// ACC #7C — Thin client wrapper that runs useFCM
// Receives commanderId from the server layout as a prop

import { useFCM, type FCMPayload } from '@/hooks/useFCM'

interface FCMProviderProps {
  commanderId: string
  children:    React.ReactNode
}

export default function FCMProvider({ commanderId, children }: FCMProviderProps) {
  useFCM({
    commanderId,
    onNotification: (payload: FCMPayload) => {
      // Foreground notification handler
      // Replace with your toast system if you have one
      // e.g. toast({ title: payload.title, description: payload.body })
      console.log('[FCM] Foreground notification:', payload)
    },
  })

  return <>{children}</>
}