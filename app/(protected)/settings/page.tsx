// app/(protected)/settings/page.tsx
//
// Account-level settings. Deliberately minimal — only surfaces things
// that are actually real and backed by the app today (linked Google
// account, session, sign out). No notification/theme toggles are shown
// since there's no backend for them yet; adding fake switches here would
// just be UI that lies about what the app can do.

import { headers }           from 'next/headers'
import { redirect }          from 'next/navigation'
import Link                  from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import SignOutButton          from '@/components/settings/SignOutButton'

export default async function SettingsPage() {
  const headersList  = await headers()
  const commanderUid = headersList.get('x-commander-uid')

  if (!commanderUid) redirect('/login')

  const supabase = createAdminClient()
  const { data: commander } = await supabase
    .from('commanders')
    .select('name, linked_google_uid, created_at')
    .eq('uid', commanderUid)
    .single()

  if (!commander) redirect('/dashboard')

  return (
    <div className="flex flex-col gap-5 animate-fade-in max-w-lg mx-auto">

      <div>
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Account and session</p>
      </div>

      {/* Linked account */}
      <div className="glass-card p-5">
        <p className="text-xs font-medium text-tactical-500 uppercase tracking-wide mb-3">Linked Account</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-tactical-900">Google Account</p>
            <p className="text-xs text-tactical-500 mt-0.5">
              {commander.linked_google_uid ? 'Connected' : 'Not linked'}
            </p>
          </div>
          <span className={`text-xs px-3 py-1 rounded-full font-medium ${
            commander.linked_google_uid
              ? 'bg-accent-light text-accent-deep border border-accent/30'
              : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}>
            {commander.linked_google_uid ? '✓ Linked' : 'Unlinked'}
          </span>
        </div>
        <p className="text-xs text-tactical-400 mt-3">
          To change your linked Google account, contact your R4/R5 or Supreme —
          this isn't self-service since it changes your sign-in identity.
        </p>
      </div>

      {/* Profile shortcut */}
      <div className="glass-card p-5">
        <p className="text-xs font-medium text-tactical-500 uppercase tracking-wide mb-3">Profile</p>
        <div className="flex items-center justify-between">
          <p className="text-sm text-tactical-700">
            View your rank, alliance, and verification status
          </p>
          <Link href="/profile" className="btn-ghost text-sm shrink-0">
            View Profile →
          </Link>
        </div>
      </div>

      {/* Session */}
      <div className="glass-card p-5">
        <p className="text-xs font-medium text-tactical-500 uppercase tracking-wide mb-3">Session</p>
        <p className="text-sm text-tactical-600 mb-4">
          Signing out will end your session on this device. You'll need to sign in again with Google.
        </p>
        <SignOutButton />
      </div>

    </div>
  )
}