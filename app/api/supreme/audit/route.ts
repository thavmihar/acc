// app/api/supreme/audit/route.ts
import { NextResponse }       from 'next/server'
import { headers }            from 'next/headers'
import { createAdminClient }  from '@/lib/supabase/admin'

async function isSupreme() {
  const h = await headers()
  return h.get('x-commander-role') === 'supreme'
}

export async function GET() {
  if (!await isSupreme()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('audit_log')
    .select(`
      id, action, performed_by, performed_by_role,
      performed_by_display, target_commander_uid,
      target_alliance_id, metadata, created_at,
      alliances ( tag )
    `)
    .order('created_at', { ascending: false })
    .limit(500)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const mapped = (data ?? []).map((e: any) => ({
    ...e,
    alliance_tag: e.alliances?.tag ?? null,
    alliances:    undefined,
  }))

  return NextResponse.json({ entries: mapped })
}
