'use client'
import { useEffect, useRef } from 'react'

/** The 26px ring that trails a mouse and swells over controls. Mouse only; nothing happens on touch or under reduced motion. */
export default function Cursor() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || !matchMedia('(pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ac = new AbortController(), on = { signal: ac.signal, passive: true }
    addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return
      el.style.opacity = '1'
      el.style.translate = `${e.clientX}px ${e.clientY}px` // the CSS transition does the trailing
    }, on)
    document.addEventListener('pointerover', (e) => {
      el.style.scale = (e.target as Element).closest?.('a, button, input, textarea, select, label, summary') ? '2.2' : '1'
    }, on)
    document.documentElement.addEventListener('pointerleave', () => { el.style.opacity = '0' }, on)
    return () => ac.abort()
  }, [])
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-20 -ml-[13px] -mt-[13px] hidden h-[26px] w-[26px] rounded-full border border-hot opacity-0 mix-blend-difference [transition:translate_.25s_cubic-bezier(.22,.61,.36,1),scale_.3s_cubic-bezier(.22,.61,.36,1),opacity_.2s] [@media(pointer:fine)]:block"
    />
  )
}
