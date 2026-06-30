// app/api/supreme/alliances/route.ts
import { NextResponse }       from 'next/server'
import { headers }            from 'next/headers'
import { createAdminClient }  from '@/lib/supabase/admin'
import { writeAuditLog }      from '@/lib/utils/audit'

function isSupreme() {
  // middleware sets x-commander-role on every request
  return headers().then(h => h.get('x-commander-role') === 'supreme')
}

export async function GET() {
  if (!await isSupreme()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('alliances')
    .select('id, tag, name, status, created_by_supreme, created_at')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ alliances: data })
}

export async function POST(req: Request) {
  if (!await isSupreme()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const headersList  = await headers()
  const commanderUid = headersList.get('x-commander-uid') ?? 'supreme'

  const { tag, name, status = 'active' } = await req.json()
  if (!tag || !name) return NextResponse.json({ error: 'tag and name required' }, { status: 400 })

  const supabase = createAdminClient()

  // Check tag is unique
  const { data: existing } = await supabase.from('alliances').select('id').eq('tag', tag).single()
  if (existing) return NextResponse.json({ error: 'Alliance tag already exists' }, { status: 409 })

  const { data, error } = await supabase
    .from('alliances')
    .insert({ tag, name, status, created_by_supreme: commanderUid })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await writeAuditLog({
    action:               'alliance_created',
    performed_by:         commanderUid,
    performed_by_role:    'supreme',
    performed_by_display: 'Supreme',
    target_alliance_id:   data.id,
    metadata:             { tag, name },
  })

  return NextResponse.json({ alliance: data })
}

export async function PATCH(req: Request) {
  if (!await isSupreme()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const headersList  = await headers()
  const commanderUid = headersList.get('x-commander-uid') ?? 'supreme'

  const { id, status } = await req.json()
  if (!id || !status) return NextResponse.json({ error: 'id and status required' }, { status: 400 })

  const supabase = createAdminClient()
  const { error } = await supabase.from('alliances').update({ status }).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await writeAuditLog({
    action:               'alliance_updated',
    performed_by:         commanderUid,
    performed_by_role:    'supreme',
    performed_by_display: 'Supreme',
    target_alliance_id:   id,
    metadata:             { new_status: status },
  })

  return NextResponse.json({ success: true })
}
