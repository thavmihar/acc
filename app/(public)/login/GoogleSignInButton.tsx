// app/(public)/login/GoogleSignInButton.tsx
// CLIENT COMPONENT — isolated here so the page shell stays server-rendered
// Contains: useSearchParams, Firebase auth, loading state, error handling
'use client'
import { useState }                       from 'react'
import { useRouter, useSearchParams }     from 'next/navigation'
import { signInWithGoogle, createSession } from '@/lib/firebase/client'

export default function GoogleSignInButton() {
  const router     = useRouter()
  const params     = useSearchParams()
  const redirect   = params.get('redirect') ?? '/dashboard'
  const errorParam = params.get('error')

  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(
    errorParam === 'access_denied'  ? 'You do not have permission to access that page.' :
    errorParam === 'wrong_alliance' ? 'You cannot access another alliance.' :
    errorParam === 'disabled'       ? 'Your account has been disabled. Contact your Supreme.' :
    ''
  )

  const handleSignIn = async () => {
    setLoading(true)
    setError('')
    try {
      const user   = await signInWithGoogle()
      const result = await createSession(user)

      if (!result.success) {
        setError(result.error ?? 'Sign-in failed. Please try again.')
        return
      }

      if (result.needs_verify) {
        router.push('/register')
      } else {
        router.push(redirect)
      }
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user') {
        // User closed popup — not an error, do nothing
      } else if (err?.code === 'auth/account-exists-with-different-credential') {
        setError('This Google account is linked to a different commander.')
      } else if (err?.code === 'auth/popup-blocked') {
        setError('Popup was blocked. Please allow popups for this site and try again.')
      } else {
        setError('Sign-in failed. Please try again.')
        console.error('[LOGIN]', err)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Error message */}
      {error && (
        <div style={{
          padding: '10px 14px', borderRadius: 10,
          background: '#FEF2F2', border: '1px solid #FECACA',
        }}>
          <p style={{ fontSize: 12, color: '#DC2626', margin: 0 }}>{error}</p>
        </div>
      )}

      {/* Google button */}
      <button
        onClick={handleSignIn}
        disabled={loading}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: 12,
          padding: '12px 20px', borderRadius: 12,
          background: 'white', border: '1px solid #E2E8F0',
          color: '#1E293B', fontWeight: 500, fontSize: 14,
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1,
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          transition: 'all 150ms ease',
        }}
        onMouseEnter={e => {
          if (!loading) {
            (e.target as HTMLElement).style.background = '#F9FAFB'
            ;(e.target as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)'
          }
        }}
        onMouseLeave={e => {
          ;(e.target as HTMLElement).style.background = 'white'
          ;(e.target as HTMLElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)'
        }}
      >
        {loading ? (
          <svg
            style={{ width: 20, height: 20, color: '#94A3B8' }}
            className="animate-spin"
            viewBox="0 0 24 24" fill="none"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10"
              stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8v8z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, flexShrink: 0 }}>
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
        )}
        {loading ? 'Signing in...' : 'Continue with Google'}
      </button>
    </div>
  )
}