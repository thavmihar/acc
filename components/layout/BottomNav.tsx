// components/layout/BottomNav.tsx
'use client'
import Link            from 'next/link'
import { usePathname } from 'next/navigation'
import type { Role }   from '@/lib/types'

interface NavItem {
  label: string
  href:  string
  icon:  string
  roles: Role[]
}

const NAV: NavItem[] = [
  { label: 'Home',         href: '/dashboard',                  icon: '⬡',  roles: ['r1','r2','r3','r4','r5','supreme'] },
  { label: 'Alliance',     href: '/alliance/[id]',              icon: '◈',  roles: ['r1','r2','r3','r4','r5','supreme'] },
  { label: 'Duel',         href: '/alliance/[id]/duel',         icon: '◎',  roles: ['r1','r2','r3','r4','r5','supreme'] },
  { label: 'DSB',          href: '/alliance/[id]/dsb',          icon: '◆',  roles: ['r1','r2','r3','r4','r5','supreme'] },
  { label: 'Verify',       href: '/alliance/[id]/verification', icon: '✅', roles: ['r4','r5','supreme'] },
  { label: 'Audit',        href: '/audit',                      icon: '≡',  roles: ['supreme'] },
  { label: 'Admin',        href: '/admin',                      icon: '⬟',  roles: ['supreme'] },
]

interface Props {
  role:       Role
  allianceId: string | null
}

export default function BottomNav({ role, allianceId }: Props) {
  const pathname = usePathname()

  const resolve = (href: string) =>
    allianceId ? href.replace('[id]', allianceId) : href

  const isActive = (href: string) => {
    const resolved = resolve(href)
    if (resolved === '/dashboard') return pathname === '/dashboard'
    return pathname === resolved || pathname.startsWith(resolved + '/')
  }

  // Only show items the role can access — cap at 4 visible
  const visible = NAV.filter(n => n.roles.includes(role)).slice(0, 4)

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 lg:hidden
                    bg-white/95 backdrop-blur-md border-t border-tactical-100
                    px-1 py-1 flex items-center justify-around safe-area-bottom">
      {visible.map(item => {
        const href   = resolve(item.href)
        const active = isActive(item.href)
        return (
          <Link
            key={item.href}
            href={href}
            className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl
                        transition-colors duration-150 min-w-[56px]
                        ${active ? 'text-accent-deep' : 'text-tactical-400 hover:text-tactical-600'}`}
          >
            <span className={`text-lg leading-none ${active ? 'scale-110' : ''} transition-transform`}>
              {item.icon}
            </span>
            <span className={`text-[10px] font-medium leading-tight
                              ${active ? 'text-accent-deep' : 'text-tactical-400'}`}>
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
