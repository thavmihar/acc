// app/api/alerts/status/route.ts
// Read-only status for the Alert Status Card: alliance/role/recipient count
// and current cooldown state. Never mutates last_notification_sent_at —
// polling this must not itself reset or affect the cooldown.

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth }       from '@/lib/firebase/serverAuth'
import { createAdminClient } from '@/lib/supabase/admin'
import { ALERT_COOLDOWN_SECONDS } from '@/lib/alerts/presets'

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth()
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const allianceId = req.nextUrl.searchParams.get('alliance_id')
    if (!allianceId) return NextResponse.json({ error: 'alliance_id is required' }, { status: 400 })

    if (auth.role !== 'supreme' && auth.alliance_id !== allianceId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const supabase = createAdminClient()

    const [{ data: alliance }, { count: recipients }, { data: cooldown, error: cooldownError }] = await Promise.all([
      supabase.from('alliances').select('tag, name').eq('id', allianceId).single(),
      supabase
        .from('commanders')
        .select('uid', { count: 'exact', head: true })
        .eq('alliance_id', allianceId)
        .eq('status', 'active'),
      supabase.rpc('get_alliance_alert_status', {
        p_alliance_id: allianceId,
        p_cooldown_seconds: ALERT_COOLDOWN_SECONDS,
      }),
    ])

    if (cooldownError) {
      console.error('[alerts/status] get_alliance_alert_status failed:', cooldownError.message)
      return NextResponse.json({ error: 'Could not read alert status' }, { status: 500 })
    }

    const row = Array.isArray(cooldown) ? cooldown[0] : cooldown

    return NextResponse.json({
      allianceTag:  alliance?.tag ?? null,
      allianceName: alliance?.name ?? null,
      role:         auth.role,
      recipients:   recipients ?? 0,
      ready:        row?.ready ?? true,
      secondsRemaining: row?.seconds_remaining ?? 0,
    })
  } catch (err) {
    console.error('[alerts/status GET]', err)
    return NextResponse.json({ error: 'Failed to fetch alert status' }, { status: 500 })
  }
}