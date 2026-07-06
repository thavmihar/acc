// app/(public)/login/page.tsx
// SERVER COMPONENT — renders instantly, no hydration wait
// Static shell: logo, title, layout chrome
// Only the sign-in button is client-rendered via Suspense

import { Suspense }        from 'react'
import GoogleSignInButton  from './GoogleSignInButton'

// Fallback shown while GoogleSignInButton hydrates
function ButtonSkeleton() {
  return (
    <div
      style={{
        width: '100%', height: 48,
        borderRadius: 12,
        background: 'rgba(255,255,255,0.8)',
        border: '1px solid #E2E8F0',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 12, cursor: 'not-allowed',
      }}
    >
      <div style={{
        width: 20, height: 20, borderRadius: '50%',
        background: '#F1F5F9', flexShrink: 0,
      }} />
      <div style={{
        width: 140, height: 14, borderRadius: 6,
        background: '#F1F5F9',
      }} />
    </div>
  )
}

export default function LoginPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
        background: 'linear-gradient(135deg, #F8FAFC 0%, #EEF2F7 100%)',
      }}
    >
      {/* Tactical grid background */}
      <div
        style={{
          position: 'fixed', inset: 0, pointerEvents: 'none', opacity: 0.025,
          backgroundImage:
            'linear-gradient(#22C55E 1px, transparent 1px), linear-gradient(90deg, #22C55E 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div
        style={{
          position: 'relative', width: '100%', maxWidth: 384,
          display: 'flex', flexDirection: 'column', gap: 24,
        }}
        className="animate-fade-in"
      >
        {/* ── STATIC SHELL — server rendered instantly ── */}

        {/* Brand header */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 64, height: 64, borderRadius: 16,
              background: '#22C55E', marginBottom: 16,
              boxShadow: '0 0 0 1px rgba(34,197,94,0.2), 0 8px 32px rgba(34,197,94,0.15)',
            }}
          >
            <span style={{ color: 'white', fontSize: 24, fontWeight: 700 }}>◈</span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: '#0F172A', margin: 0 }}>
            Command Center
          </h1>
          <p style={{ fontSize: 14, color: '#64748B', marginTop: 4, marginBottom: 2 }}>
            1307 Alliance Command Center #7C
          </p>
          <p style={{ fontSize: 12, color: '#94A3B8', fontFamily: 'monospace' }}>
            Last War: Survival
          </p>
        </div>

        {/* Login card */}
        <div className="glass-card-raised" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <p style={{ fontSize: 16, fontWeight: 600, color: '#0F172A', margin: 0 }}>
              Welcome back, Commander
            </p>
            <p style={{ fontSize: 14, color: '#64748B', marginTop: 6 }}>
              Sign in with your linked Google account to access the platform.
            </p>
          </div>

          {/* ── CLIENT COMPONENT — hydrates after shell renders ── */}
          <Suspense fallback={<ButtonSkeleton />}>
            <GoogleSignInButton />
          </Suspense>

          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 12, color: '#94A3B8' }}>
              Not registered?{' '}
              <a
                href="/register"
                style={{ color: '#16A34A', fontWeight: 500, textDecoration: 'none' }}
              >
                Verify your commander
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p style={{ textAlign: 'center', fontSize: 12, color: '#94A3B8' }}>
          Access restricted to verified commanders only.
          <br />Contact your Supreme for registration assistance.
        </p>
      </div>
    </div>
  )
}