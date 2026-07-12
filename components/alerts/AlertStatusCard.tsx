// components/alerts/AlertStatusCard.tsx
'use client'

import { Users, ShieldCheck, CircleCheck, Clock } from 'lucide-react'
import CooldownTimer from './CooldownTimer'
import type { AlertStatus } from '@/hooks/useAlertStatus'

interface AlertStatusCardProps {
  status: AlertStatus | null
  loading: boolean
}

function StatCell({ label, value, icon }: { label: string; value: React.ReactNode; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-accent-light flex items-center justify-center text-accent-deep shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-tactical-500 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-semibold text-tactical-900 truncate">{value}</p>
      </div>
    </div>
  )
}

export default function AlertStatusCard({ status, loading }: AlertStatusCardProps) {
  if (loading || !status) {
    return (
      <div className="glass-card p-5 animate-pulse">
        <div className="h-4 w-32 bg-tactical-200 rounded mb-4" />
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-9 bg-tactical-100 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="glass-card p-5">
      <div className="grid grid-cols-2 gap-x-4 gap-y-5">
        <StatCell
          label="Alliance"
          value={status.allianceTag ?? status.allianceName ?? '—'}
          icon={<ShieldCheck className="w-4 h-4" />}
        />
        <StatCell
          label="Role"
          value={<span className="uppercase">{status.role}</span>}
          icon={<ShieldCheck className="w-4 h-4" />}
        />
        <StatCell
          label="Recipients"
          value={`${status.recipients} Members`}
          icon={<Users className="w-4 h-4" />}
        />
        <StatCell
          label="Status"
          value={status.ready ? 'Ready' : 'Cooling down'}
          icon={<CircleCheck className="w-4 h-4" />}
        />
      </div>

      <div className="mt-5 pt-4 border-t border-tactical-200 flex items-center justify-between">
        <span className="text-xs font-medium text-tactical-500">Cooldown</span>
        {status.ready ? (
          <span className="flex items-center gap-1.5 text-sm font-semibold text-accent-deep">
            <CircleCheck className="w-4 h-4" /> Ready to Send
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-sm font-semibold text-orange-500">
            <Clock className="w-4 h-4" />
            <CooldownTimer secondsRemaining={status.secondsRemaining} />
          </span>
        )}
      </div>
    </div>
  )
}