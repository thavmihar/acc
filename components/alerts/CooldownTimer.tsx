// components/alerts/CooldownTimer.tsx
// Local 1-second countdown display, driven by a seconds-remaining value
// that the parent keeps in sync with the server (this component never
// invents its own truth — it just ticks down what it was given, and the
// parent re-syncs with the server periodically to correct for drift).
'use client'

import { useEffect, useState } from 'react'

interface CooldownTimerProps {
  secondsRemaining: number
  className?: string
}

export default function CooldownTimer({ secondsRemaining, className }: CooldownTimerProps) {
  const [display, setDisplay] = useState(secondsRemaining)

  useEffect(() => {
    setDisplay(secondsRemaining)
  }, [secondsRemaining])

  useEffect(() => {
    if (display <= 0) return
    const t = setInterval(() => setDisplay(d => Math.max(0, d - 1)), 1000)
    return () => clearInterval(t)
  }, [display])

  const mm = String(Math.floor(display / 60)).padStart(2, '0')
  const ss = String(display % 60).padStart(2, '0')

  return (
    <span className={className}>{mm}:{ss}</span>
  )
}