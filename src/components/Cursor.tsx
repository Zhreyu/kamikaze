'use client'
import { useEffect, useRef } from 'react'
import { getAssetPath } from '@/lib/basePath'

/** The small sigil mark that trails a mouse and swells over controls. Mouse only; nothing happens on touch or under reduced motion. */
export default function Cursor() {
  const ref = useRef<HTMLImageElement>(null)
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
    <img
      ref={ref}
      src={getAssetPath('/logo-sigil-96.webp')}
      alt=""
      aria-hidden="true"
      draggable={false}
      className="pointer-events-none fixed left-0 top-0 z-20 -ml-[15px] -mt-[15px] hidden h-[30px] w-[30px] object-contain opacity-0 drop-shadow-[0_0_6px_rgba(255,59,48,.5)] [transition:translate_.22s_cubic-bezier(.22,.61,.36,1),scale_.3s_cubic-bezier(.22,.61,.36,1),opacity_.2s] [@media(pointer:fine)]:block"
    />
  )
}
