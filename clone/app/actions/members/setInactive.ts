// app/actions/members/setInactive.ts
'use server'

import { createAdminClient }     from '@/lib/supabase/admin'
import { requireAllianceAccess } from '@/lib/firebase/serverAuth'
import { writeAuditLog }         from '@/lib/utils/audit'
import { revalidatePath }        from 'next/cache'

export async function setMemberInactive(commanderUid: string, allianceId: string) {
  const auth = await requireAllianceAccess(allianceId, 'r4')
  if (!auth) return { error: 'Unauthorized' }

  if (commanderUid === auth.commander_uid) return { error: 'Cannot flag yourself as inactive' }

  const supabase = createAdminClient()

  const { data: member } = await supabase
    .from('commanders')
    .select('uid, name, inactive_flagged')
    .eq('uid', commanderUid)
    .eq('alliance_id', allianceId)
    .single()

  if (!member) return { error: 'Commander not found' }
  if (member.inactive_flagged) return { error: 'Already flagged inactive' }

  const { error } = await supabase
    .from('commanders')
    .update({ inactive_flagged: true })
    .eq('uid', commanderUid)

  if (error) return { error: error.message }

  await writeAuditLog({
    action:               'inactive_flagged',
    performed_by:         auth.commander_uid,
    performed_by_role:    auth.role as any,
    performed_by_display: auth.commander_name,
    target_commander_uid: commanderUid,
    target_alliance_id:   allianceId,
    metadata:             { member_name: member.name },
  })

  // Fire-and-forget FCM — failure must not break the action
  fetch('/api/fcm/send', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'x-fcm-secret': process.env.FCM_INTERNAL_SECRET! },
    body: JSON.stringify({
      alliance_id: allianceId,
      title:       '⚠️ Inactive Member Flagged',
      body:        `${member.name} has been flagged as inactive`,
      data:        { type: 'inactive_flag', commander_uid: commanderUid },
    }),
  }).catch(err => console.error('[setInactive] FCM error:', err))

  revalidatePath(`/alliance/${allianceId}/members`)
  return { ok: true }
}