'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import s from './home.module.css'

const LINES = ['No VIP', 'No backstage', 'One soul', 'One ticket', 'One room']

/**
 * The five-line statement. As served it is the static list from the design (four lines at half strength, the last one red).
 * With JS and motion allowed it pins for 240% of a screen and each line slams in as you scroll, pulsing the 3D sigil.
 */
export default function Slam() {
  const box = useRef<HTMLDivElement>(null)
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    ScrollTrigger.config({ ignoreMobileResize: true }) // the URL bar showing/hiding must not re-measure the pin
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const lines = gsap.utils.toArray<HTMLElement>('p', box.current)
      const tl = gsap.timeline({ scrollTrigger: { trigger: box.current, pin: true, start: 'top top', end: '+=240%', scrub: 0.4 } })
      lines.forEach((line, i) => {
        tl.fromTo(line, { opacity: 0, scale: 2.4, filter: 'blur(16px)' }, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1, ease: 'expo.out' }, i)
        tl.call(() => void window.dispatchEvent(new Event('sigil:kick')), undefined, i + 0.2)
        // the last line ("One room") fires a real OVERRIDE photo behind the word — the screenshot moment
        if (i === LINES.length - 1) tl.call(() => void window.dispatchEvent(new Event('kamikaze:flash')), undefined, i + 0.35)
        if (i) tl.to(lines[i - 1], { opacity: 0.5, duration: 0.5 }, i)
      })
      tl.to({}, { duration: 0.6 }) // hold the last line before the pin lets go
    })
    return () => mm.revert()
  }, [])

  return (
    <section data-sigil="slam">
      <div ref={box} className={`${s.slamIn} wrap py-16 md:py-[72px]`}>
        <div className="rit flex flex-col whitespace-nowrap text-[min(10.8vw,42px)] leading-[.96] md:text-[min(8vw,110px)] md:leading-[.94]">
          {LINES.map((line, i) => (
            <p key={line} className={i === LINES.length - 1 ? 'hot' : 'opacity-50'}>
              {line}
            </p>
          ))}
        </div>
      </div>
    </section>
  )
}
