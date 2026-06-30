// app/(supreme)/supreme-dashboard/page.tsx
import { createAdminClient } from '@/lib/supabase/admin'
import { getWeekKey }        from '@/lib/utils/utc2'

export default async function SupremeDashboardPage() {
  const supabase = createAdminClient()
  const weekKey  = getWeekKey()

  const [
    { data: alliances },
    { data: commanders },
    { data: dsbEvents },
    { data: canyonEvents },
  ] = await Promise.all([
    supabase.from('alliances').select('id, tag, name, status'),
    supabase.from('commanders').select('uid, name, role, status, alliance_id, verification_status'),
    supabase.from('dsb_events').select('alliance_id, state').eq('week_key', weekKey),
    supabase.from('canyon_events').select('alliance_id, state').eq('week_key', weekKey),
  ])

  const allianceList    = alliances    ?? []
  const commanderList   = commanders   ?? []
  const dsbList         = dsbEvents    ?? []
  const canyonList      = canyonEvents ?? []

  const totalAlliances  = allianceList.length
  const activeAlliances = allianceList.filter(a => a.status === 'active').length
  const totalCommanders = commanderList.length
  const linkedCount     = commanderList.filter(c => c.verification_status === 'linked').length

  // Per-alliance stats
  const allianceStats = allianceList.map(alliance => {
    const members      = commanderList.filter(c => c.alliance_id === alliance.id)
    const activeCount  = members.filter(m => m.status === 'active').length
    const linkedMembers= members.filter(m => m.verification_status === 'linked').length
    const dsbEvent     = dsbList.find(e => e.alliance_id === alliance.id)
    const canyonEvent  = canyonList.find(e => e.alliance_id === alliance.id)
    return {
      ...alliance,
      totalMembers:  members.length,
      activeMembers: activeCount,
      linkedMembers,
      dsbState:      dsbEvent?.state    ?? null,
      canyonState:   canyonEvent?.state ?? null,
    }
  })

  const STATE_COLOR: Record<string, string> = {
    pending:              'badge-inactive',
    registration_open:    'badge-active',
    registration_closed:  'badge-warning',
    battle:               'badge-warning',
    complete:             'badge-active',
  }
  const STATE_LABEL: Record<string, string> = {
    pending:              'Pending',
    registration_open:    'Open',
    registration_closed:  'Closed',
    battle:               'Battle',
    complete:             'Complete',
  }

  return (
    <div className="flex flex-col gap-5 animate-fade-in">

      {/* Header */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-base">👑</span>
          </div>
          <div>
            <h1 className="text-xl font-semibold text-tactical-900">Supreme Dashboard</h1>
            <p className="text-xs text-tactical-500 mt-0.5 font-mono">Week: {weekKey}</p>
          </div>
        </div>
      </div>

      {/* Global stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="stat-card">
          <span className="text-xs text-tactical-500">Total Alliances</span>
          <p className="text-2xl font-semibold text-tactical-900 mt-1">{totalAlliances}</p>
          <p className="text-xs text-tactical-500 mt-1">{activeAlliances} active</p>
        </div>
        <div className="stat-card">
          <span className="text-xs text-tactical-500">Total Commanders</span>
          <p className="text-2xl font-semibold text-tactical-900 mt-1">{totalCommanders}</p>
          <p className="text-xs text-tactical-500 mt-1">{linkedCount} linked</p>
        </div>
        <div className="stat-card">
          <span className="text-xs text-tactical-500">DSB Events</span>
          <p className="text-2xl font-semibold text-tactical-900 mt-1">{dsbList.length}</p>
          <p className="text-xs text-tactical-500 mt-1">this week</p>
        </div>
        <div className="stat-card">
          <span className="text-xs text-tactical-500">Canyon Events</span>
          <p className="text-2xl font-semibold text-tactical-900 mt-1">{canyonList.length}</p>
          <p className="text-xs text-tactical-500 mt-1">this week</p>
        </div>
      </div>

      {/* Per-alliance overview */}
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-tactical-700 px-1">Alliance Overview</p>

        {allianceStats.length === 0 && (
          <div className="glass-card p-6 text-center">
            <p className="text-sm text-tactical-400">No alliances found.</p>
          </div>
        )}

        {allianceStats.map(a => (
          <div key={a.id} className="glass-card p-4">
            {/* Alliance name row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-accent-deep text-sm">[{a.tag}]</span>
                <span className="text-sm font-medium text-tactical-900">{a.name}</span>
              </div>
              <span className={`badge ${a.status === 'active' ? 'badge-active' : 'badge-inactive'}`}>
                {a.status}
              </span>
            </div>

            {/* Members */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="p-2 rounded-lg bg-surface-overlay text-center">
                <p className="text-xs text-tactical-500">Members</p>
                <p className="font-semibold text-tactical-900 text-sm">{a.totalMembers}/100</p>
              </div>
              <div className="p-2 rounded-lg bg-surface-overlay text-center">
                <p className="text-xs text-tactical-500">Active</p>
                <p className="font-semibold text-tactical-900 text-sm">{a.activeMembers}</p>
              </div>
              <div className="p-2 rounded-lg bg-surface-overlay text-center">
                <p className="text-xs text-tactical-500">Linked</p>
                <p className="font-semibold text-tactical-900 text-sm">{a.linkedMembers}</p>
              </div>
            </div>

            {/* Event states */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-tactical-500">DSB:</span>
              <span className={`badge ${a.dsbState ? STATE_COLOR[a.dsbState] : 'badge-inactive'}`}>
                {a.dsbState ? STATE_LABEL[a.dsbState] : 'No Event'}
              </span>
              <span className="text-xs text-tactical-500 ml-2">Canyon:</span>
              <span className={`badge ${a.canyonState ? STATE_COLOR[a.canyonState] : 'badge-inactive'}`}>
                {a.canyonState ? STATE_LABEL[a.canyonState] : 'No Event'}
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}
