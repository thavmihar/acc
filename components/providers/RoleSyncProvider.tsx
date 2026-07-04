'use client'
// components/providers/RoleSyncProvider.tsx
//
// Listens for changes to the logged-in commander's own row in `commanders`.
// If Supreme changes their role or alliance_id, this:
//   1. Forces the Firebase client SDK to fetch a fresh ID token (which now
//      carries the updated custom claims, since the PATCH route already
//      synced them server-side).
//   2. Re-POSTs that token to /api/auth/session to reissue the session
//      cookie with the new claims baked in.
//   3. Calls router.refresh() so server components (which read role/alliance
//      from middleware-set headers) re-render with the new values.
// No logout, no full page reload — the commander just sees it update.

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getIdToken } from '@/lib/firebase/client'

interface Props {
  commanderUid:      string
  currentRole:       string
  currentAllianceId: string | null
  children:          React.ReactNode
}

export default function RoleSyncProvider({
  commanderUid,
  currentRole,
  currentAllianceId,
  children,
}: Props) {
  const router   = useRouter()
  const syncing  = useRef(false)

  useEffect(() => {
    if (!commanderUid) return

    const supabase = createClient()

    const channel = supabase
      .channel(`commander_self_${commanderUid}`)
      .on(
        'postgres_changes',
        {
          event:  'UPDATE',
          schema: 'public',
          table:  'commanders',
          filter: `uid=eq.${commanderUid}`,
        },
        async (payload) => {
          const next = payload.new as { role?: string; alliance_id?: string | null }
          const roleChanged     = next.role !== undefined && next.role !== currentRole
          const allianceChanged = next.alliance_id !== undefined && next.alliance_id !== currentAllianceId

          if (!roleChanged && !allianceChanged) return
          if (syncing.current) return
          syncing.current = true

          try {
            const idToken = await getIdToken(true) // force refresh — picks up new custom claims
            if (idToken) {
              await fetch('/api/auth/session', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ idToken }),
              })
            }
            router.refresh()
          } catch (err) {
            console.error('[ROLE SYNC] failed to refresh session:', err)
          } finally {
            syncing.current = false
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [commanderUid, currentRole, currentAllianceId, router])

  return <>{children}</>
}
