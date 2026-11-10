'use client'
// src/components/sigil/SigilCanvas.tsx — mounted once in src/app/layout.tsx. Imports no three: the scene is a lazy chunk.
import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

export function SigilCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)
  const pathname = usePathname()

  useEffect(() => { window.dispatchEvent(new Event('sigil:measure')) }, [pathname])   // new route, new stations

  useEffect(() => {
    const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number }
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || nav.connection?.saveData || (nav.deviceMemory ?? 8) < 4) return
    let dispose: (() => void) | undefined, dead = false, timer = 0
    const boot = async () => {
      // Probe first: without WebGL2 (three r164 needs it) nothing is downloaded and nothing is logged. The still stays.
      const gl = document.createElement('canvas').getContext('webgl2')
      if (!gl) return
      gl.getExtension('WEBGL_lose_context')?.loseContext()
      try {
        const { mountSigil } = await import('./scene')
        if (dead || !ref.current) return
        const d = await mountSigil(ref.current)
        if (dead) d(); else dispose = d
      } catch (err) {
        console.warn('[sigil] 3D unavailable, keeping the still', err)
      }
    }
    // After load, then idle: three + the model never compete with first paint or the LCP image.
    const idle = () => { timer = window.setTimeout(() => ('requestIdleCallback' in window ? requestIdleCallback(boot, { timeout: 2000 }) : boot()), 200) }
    if (document.readyState === 'complete') idle(); else window.addEventListener('load', idle, { once: true })
    return () => { dead = true; clearTimeout(timer); window.removeEventListener('load', idle); dispose?.() }
  }, [])

  return <canvas ref={ref} id="sigil-gl" aria-hidden="true" className="pointer-events-none fixed left-0 top-0 z-0 h-screen w-full" />
}
