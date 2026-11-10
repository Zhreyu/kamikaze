'use client'
import { createElement, useEffect, useRef, useState, type ReactNode } from 'react'

/**
 * Heading that wipes in from the left the first time it scrolls into view (CSS: `.js .reveal` / `.in` in globals.css).
 * `className` goes on the element itself; the wipe runs on an inner block, because an element clipped to nothing
 * never reports as intersecting. Once the wipe has run the clip is removed, so overhanging glyphs are not cut.
 * Visible without JS and under reduced motion.
 */
export default function Reveal({ as = 'h2', className, children }: { as?: 'h1' | 'h2' | 'h3' | 'p' | 'div'; className?: string; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null)
  const [stage, setStage] = useState<'wait' | 'in' | 'done'>('wait')
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setStage('in'), io.disconnect()), { rootMargin: '0px 0px -12% 0px' })
    if (ref.current) io.observe(ref.current)
    return () => io.disconnect()
  }, [])
  return createElement(
    as,
    { ref, className },
    <span className={stage === 'done' ? 'block' : `reveal block ${stage === 'in' ? 'in' : ''}`} onTransitionEnd={(e) => e.target === e.currentTarget && setStage('done')}>
      {children}
    </span>,
  )
}
