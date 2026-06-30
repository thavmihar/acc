// app/api/supreme/commanders/route.ts
import { NextResponse }       from 'next/server'
import { headers }            from 'next/headers'
import { createAdminClient }  from '@/lib/supabase/admin'
import { adminAuth }          from '@/lib/firebase/admin'
import { writeAuditLog }      from '@/lib/utils/audit'

async function isSupreme() {
  const h = await headers()
  return h.get('x-commander-role') === 'supreme'
}

// GET — list all commanders with alliance tag joined
export async function GET() {
  if (!await isSupreme()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const supabase = createAdminClient()

  const { data: commanders, error } = await supabase
    .from('commanders')
    .select(`
      uid, name, role, status, verification_status,
      alliance_id, linked_google_uid,
      alliances ( tag )
    `)
    .order('name')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const mapped = (commanders ?? []).map((c: any) => ({
    ...c,
    alliance_tag: c.alliances?.tag ?? null,
    alliances:    undefined,
  }))

  return NextResponse.json({ commanders: mapped })
}

// POST — create new commander record
export async function POST(req: Request) {
  if (!await isSupreme()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const headersList  = await headers()
  const commanderUid = headersList.get('x-commander-uid') ?? 'supreme'

  const { uid, name, role, alliance_id } = await req.json()
  if (!uid || !name || !alliance_id) {
    return NextResponse.json({ error: 'uid, name and alliance_id required' }, { status: 400 })
  }

  const supabase = createAdminClient()

  // Check UID not already taken
  const { data: existing } = await supabase.from('commanders').select('uid').eq('uid', uid).single()
  if (existing) return NextResponse.json({ error: 'Commander UID already exists' }, { status: 409 })

  const { data, error } = await supabase
    .from('commanders')
    .insert({
      uid,
      name,
      role:                role ?? 'r1',
      alliance_id,
      status:              'active',
      verification_status: 'pending',
      inactive_flagged:    false,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await writeAuditLog({
    action:               'commander_created',
    performed_by:         commanderUid,
    performed_by_role:    'supreme',
    performed_by_display: 'Supreme',
    target_commander_uid: uid,
    target_alliance_id:   alliance_id,
    metadata:             { name, role },
  })

  return NextResponse.json({ commander: data })
}

// DELETE — remove commander (unlinks Google if linked)
export async function DELETE(req: Request) {
  if (!await isSupreme()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const headersList  = await headers()
  const commanderUid = headersList.get('x-commander-uid') ?? 'supreme'

  const { uid } = await req.json()
  if (!uid) return NextResponse.json({ error: 'uid required' }, { status: 400 })

  const supabase = createAdminClient()

  // Get commander to check if linked to Firebase
  const { data: commander } = await supabase
    .from('commanders')
    .select('uid, name, alliance_id, linked_google_uid')
    .eq('uid', uid)
    .single()

  if (!commander) return NextResponse.json({ error: 'Commander not found' }, { status: 404 })

  // If linked to Firebase, remove custom claims
  if (commander.linked_google_uid) {
    await adminAuth.setCustomUserClaims(commander.linked_google_uid, {}).catch(() => null)
  }

  // Delete verification codes first (FK)
  await supabase.from('verification_codes').delete().eq('commander_uid', uid)

  // Delete commander
  const { error } = await supabase.from('commanders').delete().eq('uid', uid)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await writeAuditLog({
    action:               'commander_disabled',
    performed_by:         commanderUid,
    performed_by_role:    'supreme',
    performed_by_display: 'Supreme',
    target_commander_uid: uid,
    target_alliance_id:   commander.alliance_id,
    metadata:             { name: commander.name },
  })

  return NextResponse.json({ success: true })
}
