'use client'
import { useEffect, useState } from 'react'

const p2 = (n: number) => String(n).padStart(2, '0')

/**
 * Live countdown to `to` (epoch ms). Shows 00 until mounted so server and client HTML match; at zero it says Today.
 * blocks: four .num numbers with Days/Hrs/Min/Sec labels. `className` replaces the phone sizing (grid-cols-4 gap-[10px] text-[44px]).
 * inline: `50d 07h 08m` as plain text; `className` goes on the span.
 * `label` / `zeroLabel`: aria-label while running / at zero.
 */
export default function Countdown({
  to,
  variant = 'blocks',
  label,
  zeroLabel,
  className,
}: {
  to: number
  variant?: 'blocks' | 'inline'
  label?: string
  zeroLabel?: string
  className?: string
}) {
  const [left, setLeft] = useState<number | null>(null) // whole seconds; null until mounted
  useEffect(() => {
    let id = 0
    const tick = () => {
      const s = Math.max(0, Math.floor((to - Date.now()) / 1000))
      setLeft(s)
      if (!s) clearInterval(id) // stops at zero
    }
    const start = () => {
      clearInterval(id)
      if (document.hidden) return // no ticking in a hidden tab
      id = window.setInterval(tick, 1000)
      tick()
    }
    start()
    document.addEventListener('visibilitychange', start)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', start)
    }
  }, [to])

  const zero = left === 0
  const s = left ?? 0
  const parts = [Math.floor(s / 86400), Math.floor((s % 86400) / 3600), Math.floor((s % 3600) / 60), s % 60].map(p2)
  const aria = zero ? (zeroLabel ?? label) : label
  if (variant === 'inline')
    return (
      <span role="timer" aria-label={aria} className={`tabular-nums ${className ?? ''}`}>
        {zero ? 'Today' : `${parts[0]}d ${parts[1]}h ${parts[2]}m`}
      </span>
    )
  return (
    <div role="timer" aria-label={aria} className={`num grid ${className ?? 'grid-cols-4 gap-[10px] text-[44px]'}`}>
      {zero ? (
        <div className="col-span-full">Today</div>
      ) : (
        ['Days', 'Hrs', 'Min', 'Sec'].map((unit, i) => (
          <div key={unit}>
            {parts[i]}
            <span className="mono dim mt-[6px] block">{unit}</span>
          </div>
        ))
      )}
    </div>
  )
}
