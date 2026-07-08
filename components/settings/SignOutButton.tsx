'use client'
// components/settings/SignOutButton.tsx

import { useState }    from 'react'
import { useRouter }   from 'next/navigation'
import { signOutUser } from '@/lib/firebase/client'

export default function SignOutButton() {
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)

  const handleSignOut = async () => {
    setSigningOut(true)
    await signOutUser()
    router.push('/login')
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={signingOut}
      className="w-full rounded-xl border border-red-200 bg-red-50 text-red-600 font-semibold py-3 text-sm hover:bg-red-100 transition-colors disabled:opacity-50"
    >
      {signingOut ? 'Signing out…' : '🚪 Sign Out'}
    </button>
  )
}