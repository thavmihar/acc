// app/(public)/login/loading.tsx
// Shown by Next.js while the login page is loading
// Matches the tactical light theme — no bare "Loading..." text

export default function LoginLoading() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
        background: 'linear-gradient(135deg, #F8FAFC 0%, #EEF2F7 100%)',
      }}
    >
      {/* Tactical grid */}
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
      >
        {/* Brand — same as real page, no layout shift */}
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

        {/* Card skeleton */}
        <div
          className="glass-card-raised"
          style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 20 }}
        >
          {/* Text skeleton */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{
              height: 20, width: '60%', borderRadius: 6,
              background: 'linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
            }} />
            <div style={{
              height: 14, width: '90%', borderRadius: 6,
              background: 'linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite 0.1s',
            }} />
            <div style={{
              height: 14, width: '75%', borderRadius: 6,
              background: 'linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite 0.2s',
            }} />
          </div>

          {/* Button skeleton */}
          <div style={{
            height: 48, borderRadius: 12,
            background: 'linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
            border: '1px solid #E2E8F0',
          }} />

          {/* Link skeleton */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{
              height: 12, width: '50%', borderRadius: 6,
              background: '#F1F5F9',
            }} />
          </div>
        </div>

        {/* Footer skeleton */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ height: 12, width: '70%', borderRadius: 6, background: '#F1F5F9' }} />
          <div style={{ height: 12, width: '55%', borderRadius: 6, background: '#F1F5F9' }} />
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  )
}