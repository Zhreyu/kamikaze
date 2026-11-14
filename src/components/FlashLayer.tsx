'use client'
import { useEffect, useRef } from 'react'
import { getAssetPath } from '@/lib/basePath'

// ponytail: curated OVERRIDE stills for the flash — crowd / beam heavy, high-contrast red. Swap ids to recut the set.
const IDS = ['09405', '08350', '08616', '09297', '08952', '09825', '09710']

/**
 * One fixed image behind the whole page. Any element with [data-flash] (the hero sigil) fires it on tap, as does a
 * `kamikaze:flash` event (the slam's "One room" line). It opacity-pulses one real photo of the night, then clears to 0.
 * Under reduced motion the global rule collapses the keyframe, so nothing strobes.
 */
export default function FlashLayer() {
  const ref = useRef<HTMLImageElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const srcs = IDS.map((id) => getAssetPath(`/events/override/dsc${id}-800.webp`))
    // shuffle once per visit, then walk it so repeats are spread out
    for (let i = srcs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[srcs[i], srcs[j]] = [srcs[j], srcs[i]]
    }
    srcs.forEach((s) => { const im = new Image(); im.src = s }) // warm the cache so the first flash is instant
    let i = 0
    const fire = () => {
      el.src = srcs[i++ % srcs.length]
      el.style.animation = 'none'
      void el.offsetWidth // reflow so the keyframe restarts on every fire
      el.style.animation = 'flash 560ms ease-out'
    }
    const onTap = (e: PointerEvent) => {
      if ((e.target as Element).closest?.('[data-flash]')) {
        fire()
        dispatchEvent(new Event('sigil:kick'))
      }
    }
    addEventListener('kamikaze:flash', fire)
    document.addEventListener('pointerup', onTap)
    return () => {
      removeEventListener('kamikaze:flash', fire)
      document.removeEventListener('pointerup', onTap)
    }
  }, [])
  return <img ref={ref} aria-hidden="true" alt="" className="flash" />
}
