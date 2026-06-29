// components/layout/SupremeSidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface Props {
  commanderName: string
}

const NAV = [
  { label: 'Dashboard', href: '/supreme-dashboard', icon: '⌂' },
  { label: 'Admin',     href: '/admin',             icon: '👑' },
  { label: 'Commanders',href: '/admin/commanders',  icon: '◉' },
  { label: 'Alliances', href: '/admin/alliances',   icon: '◈' },
  { label: 'Audit Log', href: '/audit',             icon: '≡' },
]

export default function SupremeSidebar({ commanderName }: Props) {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 w-64 flex flex-col bg-surface-base border-r border-tactical-100">
      {/* Brand */}
      <div className="px-5 py-6">
        <p className="text-xs text-tactical-500 tracking-wide uppercase">
          1307 Command Center
        </p>
        <p className="font-semibold text-tactical-900 mt-1">Supreme Console</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 flex flex-col gap-1">
        {NAV.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 ${
                active
                  ? 'bg-accent-light text-accent-deep'
                  : 'text-tactical-600 hover:bg-surface-overlay hover:text-tactical-900'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer / current commander */}
      <div className="px-5 py-4 border-t border-tactical-100">
        <p className="text-xs text-tactical-500">Signed in as</p>
        <p className="text-sm font-semibold text-tactical-900 truncate">
          {commanderName}
        </p>
        <span className="badge badge-active mt-2 inline-block">SUPREME</span>
      </div>
    </aside>
  )
}