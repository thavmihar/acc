// app/(protected)/layout.tsx
// Auth guard — verifies Firebase session before rendering any protected page
// Reads claims from headers set by middleware

import { redirect }   from 'next/navigation'
import { headers }    from 'next/headers'
import Sidebar        from '@/components/layout/Sidebar'
import BottomNav      from '@/components/layout/BottomNav'
import TopBar         from '@/components/layout/TopBar'
import FCMProvider    from '@/components/providers/FCMProvider'  // ← new
import type { Role }  from '@/lib/types'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList  = await headers()
  const commanderUid = headersList.get('x-commander-uid')
  const role         = headersList.get('x-commander-role') as Role | null
  const allianceId   = headersList.get('x-alliance-id') || null

  if (!commanderUid || !role) {
    redirect('/login')
  }

  const { createAdminClient } = await import('@/lib/supabase/admin')
  const supabase = createAdminClient()

  const { data: commander } = await supabase
    .from('commanders')
    .select('name, id, alliance_id')   // ← added id
    .eq('uid', commanderUid)
    .single()

  let allianceTag: string | null = null
  if (allianceId) {
    const { data: alliance } = await supabase
      .from('alliances')
      .select('tag')
      .eq('id', allianceId)
      .single()
    allianceTag = alliance?.tag ?? null
  }

  const commanderName = commander?.name ?? commanderUid
  const commanderId   = commander?.id   ?? null   // ← needed by FCMProvider

  return (
    <div className="min-h-screen bg-surface-base">

      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          role={role}
          allianceId={allianceId}
          commanderName={commanderName}
          allianceTag={allianceTag}
        />
      </div>

      {/* Mobile top bar */}
      <div className="lg:hidden">
        <TopBar
          role={role}
          commanderName={commanderName}
          allianceTag={allianceTag}
        />
      </div>

      {/* Main content — wrapped with FCMProvider for push notifications */}
      <main className="lg:pl-64 min-h-screen">
        <div className="p-6 lg:p-8 pb-24 lg:pb-8 max-w-5xl mx-auto">
          {commanderId ? (
            <FCMProvider commanderId={commanderId}>
              {children}
            </FCMProvider>
          ) : (
            children
          )}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <div className="lg:hidden">
        <BottomNav
          role={role}
          allianceId={allianceId}
        />
      </div>
    </div>
  )
}