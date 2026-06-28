// components/layout/BottomNav.tsx
'use client'
import Link            from 'next/link'
import { usePathname } from 'next/navigation'
import type { Role }   from '@/lib/types'

interface Props {
  role:          Role
  allianceId:    string | null
  commanderName?: string
  allianceTag?:   string | null
}

const NAV = [
  { label: 'Home',     href: '/dashboard',             icon: '⬡', roles: ['r1','r2','r3','r4','r5','supreme'] },
  { label: 'Duel',     href: '/alliance/[id]/duel',    icon: '◎', roles: ['r1','r2','r3','r4','r5','supreme'] },
  { label: 'DSB',      href: '/alliance/[id]/dsb',     icon: '◆', roles: ['r1','r2','r3','r4','r5','supreme'] },
  { label: 'Canyon',   href: '/alliance/[id]/canyon',  icon: '◇', roles: ['r1','r2','r3','r4','r5','supreme'] },
  { label: 'Members',  href: '/alliance/[id]/members', icon: '◉', roles: ['r1','r2','r3','r4','r5','supreme'] },
  { label: 'Transfers',href: '/transfers',              icon: '⇄', roles: ['r1','r2','r3','r4','r5','supreme'] },
  { label: 'Admin',    href: '/admin',                  icon: '⬟', roles: ['supreme'] },
]

export default function BottomNav({ role, allianceId }: Props) {
  const pathname = usePathname()

  const resolve = (href: string) =>
    allianceId ? href.replace('[id]', allianceId) : href

  const isActive = (href: string) => {
    const r = resolve(href)
    if (r === '/dashboard') return pathname === '/dashboard'
    return pathname === r || pathname.startsWith(r + '/')
  }

  const visible = NAV
    .filter(n => n.roles.includes(role))
    .slice(0, 5) // max 5 on mobile bar

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 glass-sidebar border-t border-white/40">
      <div className="flex items-center justify-around px-2 py-2">
        {visible.map(item => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={resolve(item.href)}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-150
                ${active
                  ? 'text-accent-deep bg-accent-light'
                  : 'text-tactical-400 hover:text-tactical-700'
                }`}
            >
              <span className="text-xl leading-none">{item.icon}</span>
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}