'use client'
import { useEffect, useState } from 'react'
import Countdown from '@/components/Countdown'
import s from './home.module.css'

/** Desktop hero readout: the live countdown and the tempo. The first label reads `When` once the countdown says Today. */
export default function Readout({ to, label, zeroLabel }: { to: number; label: string; zeroLabel: string }) {
  const [zero, setZero] = useState(false)
  useEffect(() => {
    const left = to - Date.now()
    if (left <= 0) return setZero(true)
    const id = setTimeout(() => setZero(true), Math.min(left, 2 ** 31 - 1)) // setTimeout tops out near 24.8 days; a longer wait simply never fires in one visit
    return () => clearTimeout(id)
  }, [to])
  return (
    <dl className={`${s.rise} mono hidden grid-cols-[auto_auto] gap-x-[18px] gap-y-[6px] border border-hair bg-void/55 px-4 py-[14px] md:grid`} style={{ '--i': 6 } as React.CSSProperties}>
      <dt className="dim">{zero ? 'When' : 'Until'}</dt>
      <dd>
        <Countdown to={to} variant="inline" label={label} zeroLabel={zeroLabel} />
      </dd>
      <dt className="dim">Pulse</dt>
      <dd>144 BPM</dd>
    </dl>
  )
}
