'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import type { Role } from '@/lib/types'

interface Props {
  role: Role
  allianceId: string | null
}

export default function BottomNav({ role, allianceId }: Props) {
  const pathname = usePathname()

  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const allianceBase = allianceId ? `/alliance/${allianceId}` : '#'

  const menuItems = [
    {
      label: 'Alliance',
      href: allianceBase,
    },
    {
      label: 'Dual',
      href: `${allianceBase}/duel`,
    },
    {
      label: 'DSB',
      href: `${allianceBase}/dsb`,
    },
    {
      label: 'Canyon',
      href: `${allianceBase}/canyon`,
    },
    {
      label: 'Members',
      href: `${allianceBase}/members`,
    },
    {
      label: 'Transfers',
      href: '/transfers',
    },
  ]

  if (role === 'supreme') {
    menuItems.push({
      label: 'Admin',
      href: '/admin',
    })
  }

  return (
    <>
      {/* Alliance Menu */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30"
            onClick={() => setMenuOpen(false)}
          />

          <div className="fixed bottom-20 left-4 right-4 z-50 rounded-3xl border border-white/30 bg-white shadow-2xl p-4">
            <div className="mb-3 text-center text-sm font-semibold text-gray-500">
              Alliance Menu
            </div>

            <div className="space-y-2">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`block rounded-xl px-4 py-3 transition ${
                    pathname === item.href
                      ? 'bg-green-100 text-green-700'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Profile Menu */}
      {profileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30"
            onClick={() => setProfileOpen(false)}
          />

          <div className="fixed bottom-20 left-4 right-4 z-50 rounded-3xl border border-white/30 bg-white shadow-2xl p-4">
            <div className="mb-3 text-center text-sm font-semibold text-gray-500">
              Profile
            </div>

            <div className="space-y-2">
              <Link
                href="/profile"
                onClick={() => setProfileOpen(false)}
                className="block rounded-xl px-4 py-3 hover:bg-gray-100"
              >
                Profile
              </Link>

              <Link
                href="/settings"
                onClick={() => setProfileOpen(false)}
                className="block rounded-xl px-4 py-3 hover:bg-gray-100"
              >
                Settings
              </Link>

              <button
                className="w-full rounded-xl px-4 py-3 text-left text-red-600 hover:bg-red-50"
                onClick={() => {
                  window.location.href = '/logout'
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/30 bg-white/95 backdrop-blur-lg">
        <div className="flex items-center justify-around py-3">
          <Link
            href="/dashboard"
            className={`flex flex-col items-center gap-1 ${
              pathname === '/dashboard'
                ? 'text-green-700'
                : 'text-gray-500'
            }`}
          >
            <span className="text-2xl">🏠</span>
            <span className="text-xs font-medium">Home</span>
          </Link>

          <button
            onClick={() => {
              setProfileOpen(false)
              setMenuOpen(!menuOpen)
            }}
            className="flex flex-col items-center gap-1 text-gray-500"
          >
            <span className="text-2xl">☰</span>
            <span className="text-xs font-medium">Menu</span>
          </button>

          <button
            onClick={() => {
              setMenuOpen(false)
              setProfileOpen(!profileOpen)
            }}
            className="flex flex-col items-center gap-1 text-gray-500"
          >
            <span className="text-2xl">👤</span>
            <span className="text-xs font-medium">Profile</span>
          </button>
        </div>
      </nav>
    </>
  )
}