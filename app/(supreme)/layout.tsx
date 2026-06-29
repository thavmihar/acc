// app/(supreme)/layout.tsx
// Auth guard — Supreme-only layout. Completely separate from (protected).
// No R1–R5 share any code path here, so role-confusion bugs (JWT cache,
// stale claims, etc.) can never leak Supreme-only UI to lower roles.

import { redirect }    from 'next/navigation'
import { headers }     from 'next/headers'
import SupremeSidebar  from '@/components/layout/SupremeSidebar'
import SupremeBottomNav from '@/components/layout/SupremeBottomNav'
import SupremeTopBar   from '@/components/layout/SupremeTopBar'
import FCMProvider     from '@/components/providers/FCMProvider'

export default async function SupremeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList  = await headers()
  const commanderUid = headersList.get('x-commander-uid')
  const role         = headersList.get('x-commander-role')

  // Hard gate: only 'supreme' may render anything under this route group.
  // Anyone else — including r5 — gets bounced to the normal dashboard.
  if (!commanderUid || !role) {
    redirect('/login')
  }

  if (role !== 'supreme') {
    redirect('/dashboard')
  }

  const { createAdminClient } = await import('@/lib/supabase/admin')
  const supabase = createAdminClient()

  const { data: commander } = await supabase
    .from('commanders')
    .select('name, id, alliance_id')
    .eq('uid', commanderUid)
    .single()

  const commanderName = commander?.name ?? commanderUid
  const commanderId   = commander?.id   ?? null

  return (
    <div className="min-h-screen bg-surface-base">

      {/* Desktop sidebar — Supreme-specific links only */}
      <div className="hidden lg:block">
        <SupremeSidebar commanderName={commanderName} />
      </div>

      {/* Mobile top bar */}
      <div className="lg:hidden">
        <SupremeTopBar commanderName={commanderName} />
      </div>

      {/* Main content */}
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

      {/* Mobile bottom nav — Supreme-specific, no role-gating logic needed */}
      <div className="lg:hidden">
        <SupremeBottomNav />
      </div>
    </div>
  )
}