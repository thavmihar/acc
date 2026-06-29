// components/layout/SupremeTopBar.tsx
'use client'

interface Props {
  commanderName: string
}

export default function SupremeTopBar({ commanderName }: Props) {
  return (
    <header className="sticky top-0 z-30 bg-surface-base/90 backdrop-blur-md border-b border-tactical-100 px-4 py-3 flex items-center justify-between">
      <div>
        <p className="text-xs text-tactical-500 tracking-wide uppercase">
          1307 Command Center
        </p>
        <p className="font-semibold text-tactical-900 text-sm">
          Supreme Console
        </p>
      </div>

      <div className="flex items-center gap-2">
        <span className="badge badge-active">SUPREME</span>
        <div className="w-9 h-9 rounded-full bg-accent-light flex items-center justify-center">
          <span className="text-sm font-semibold text-accent-deep">
            {commanderName?.charAt(0)?.toUpperCase() ?? '👑'}
          </span>
        </div>
      </div>
    </header>
  )
}