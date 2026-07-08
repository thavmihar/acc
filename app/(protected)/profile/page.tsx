// app/(protected)/profile/page.tsx
//
// Personal profile page. Read-only identity summary for the signed-in
// commander — name, role, alliance, verification/account status, and
// their alliance history. Renaming/role/alliance changes are deliberately
// NOT editable here; those go through the existing Transfer/Admin/Alliance
// Settings flows, which already have the correct permission checks.

import { headers }           from 'next/headers'
import { redirect }          from 'next/navigation'
import Link                  from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Role }         from '@/lib/types'

const ROLE_LABELS: Record<string, string> = {
  r1: 'R1 — Member',
  r2: 'R2 — Member',
  r3: 'R3 — Member',
  r4: 'R4 — Officer',
  r5: 'R5 — Leader',
  supreme: 'Supreme',
}

const STATUS_STYLES: Record<string, string> = {
  active:     'bg-accent-light text-accent-deep border border-accent/30',
  inactive:   'bg-amber-50 text-amber-700 border border-amber-200',
  unassigned: 'bg-amber-50 text-amber-700 border border-amber-200',
  disabled:   'bg-red-50 text-red-700 border border-red-200',
  former:     'bg-tactical-100 text-tactical-600 border border-tactical-200',
}

const STATUS_LABELS: Record<string, string> = {
  active:     '● Active',
  inactive:   '● Inactive',
  unassigned: '● Unassigned',
  disabled:   '● Disabled',
  former:     '● Former Member',
}

const VERIFICATION_STYLES: Record<string, string> = {
  verified:  'bg-accent-light text-accent-deep border border-accent/30',
  linked:    'bg-accent-light text-accent-deep border border-accent/30',
  pending:   'bg-amber-50 text-amber-700 border border-amber-200',
  code_sent: 'bg-blue-50 text-blue-700 border border-blue-200',
}

export default async function ProfilePage() {
  const headersList  = await headers()
  const commanderUid = headersList.get('x-commander-uid')
  const role         = headersList.get('x-commander-role') as Role | null

  if (!commanderUid || !role) redirect('/login')

  const supabase = createAdminClient()

  const { data: commander } = await supabase
    .from('commanders')
    .select('uid, name, role, status, alliance_id, verification_status, created_at, inactive_flagged, inactive_flagged_at')
    .eq('uid', commanderUid)
    .single()

  if (!commander) redirect('/dashboard')

  const { data: alliance } = commander.alliance_id
    ? await supabase.from('alliances').select('tag, name, status').eq('id', commander.alliance_id).single()
    : { data: null }

  const { data: history } = await supabase
    .from('alliance_history')
    .select('alliance_tag, role, joined_at, left_at')
    .eq('commander_uid', commanderUid)
    .order('joined_at', { ascending: false })
    .limit(10)

  const joinedDate = new Date(commander.created_at).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  return (
    <div className="flex flex-col gap-5 animate-fade-in max-w-lg mx-auto">

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-accent-light border border-accent/30 flex items-center justify-center shrink-0">
          <span className="text-2xl font-bold text-accent-deep">
            {commander.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="min-w-0">
          <h1 className="page-title truncate">{commander.name}</h1>
          <p className="page-subtitle">{ROLE_LABELS[commander.role] ?? commander.role}</p>
        </div>
      </div>

      {/* Status badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-xs px-3 py-1 rounded-full font-medium ${STATUS_STYLES[commander.status] ?? STATUS_STYLES.unassigned}`}>
          {STATUS_LABELS[commander.status] ?? '● Unassigned'}
        </span>
        <span className={`text-xs px-3 py-1 rounded-full font-medium ${VERIFICATION_STYLES[commander.verification_status] ?? VERIFICATION_STYLES.pending}`}>
          {commander.verification_status === 'verified' || commander.verification_status === 'linked'
            ? '✓ Verified'
            : commander.verification_status === 'code_sent' ? 'Code Sent'
            : 'Verification Pending'}
        </span>
        {commander.inactive_flagged && (
          <span className="text-xs px-3 py-1 rounded-full font-medium bg-amber-50 text-amber-700 border border-amber-200">
            ⚠ Flagged Inactive
          </span>
        )}
      </div>

      {/* Current alliance */}
      <div className="glass-card p-5">
        <p className="text-xs font-medium text-tactical-500 uppercase tracking-wide mb-3">Current Alliance</p>
        {alliance ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-tactical-900">[{alliance.tag}] {alliance.name}</p>
              <p className="text-xs text-tactical-500 mt-0.5 capitalize">{alliance.status}</p>
            </div>
            <Link href={`/alliance/${commander.alliance_id}`} className="btn-ghost text-sm shrink-0">
              View →
            </Link>
          </div>
        ) : (
          <p className="text-sm text-tactical-400">Not currently assigned to an alliance</p>
        )}
      </div>

      {/* Account info */}
      <div className="glass-card p-5">
        <p className="text-xs font-medium text-tactical-500 uppercase tracking-wide mb-3">Account</p>
        <div className="flex flex-col gap-2.5 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-tactical-500">In-game name</span>
            <span className="font-medium text-tactical-900">{commander.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-tactical-500">Commander UID</span>
            <span className="font-mono text-xs text-tactical-700">{commander.uid}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-tactical-500">Rank</span>
            <span className="font-medium text-tactical-900 uppercase">{commander.role}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-tactical-500">Member since</span>
            <span className="font-medium text-tactical-900">{joinedDate}</span>
          </div>
        </div>
      </div>

      {/* Alliance history */}
      {(history ?? []).length > 0 && (
        <div className="glass-card p-5">
          <p className="text-xs font-medium text-tactical-500 uppercase tracking-wide mb-3">Alliance History</p>
          <div className="flex flex-col divide-y divide-tactical-100">
            {(history ?? []).map((h, i) => (
              <div key={i} className="py-2.5 flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium text-tactical-900">[{h.alliance_tag}]</span>
                  <span className="text-tactical-500 ml-2 uppercase text-xs">{h.role}</span>
                </div>
                <span className="text-xs text-tactical-400">
                  {new Date(h.joined_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                  {h.left_at
                    ? ` – ${new Date(h.left_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}`
                    : ' – Present'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-center">
        <Link href="/settings" className="text-sm text-accent-deep font-medium hover:underline">
          Account Settings →
        </Link>
      </div>

    </div>
  )
}