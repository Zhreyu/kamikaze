'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import Arrow from '@/components/Arrow'
import ArtistTile from '@/components/ArtistTile'
import Reveal from '@/components/Reveal'
import { artists } from '@/data/artists'
import { mediaUrl } from '@/data/content'
import { useContent } from '@/lib/content'
import s from './home.module.css'

/**
 * Phone: a swipeable strip of portrait tiles, then a row to the full list.
 * md+: four big name rows; with a mouse the hovered artist's portrait follows the pointer and the other names dim.
 */
export default function WhoPlayed() {
  const { portraits } = useContent()
  const peek = useRef<HTMLDivElement>(null)
  const move = useRef<((e: React.MouseEvent) => void) | null>(null) // set only where a mouse exists and motion is allowed
  const [src, setSrc] = useState('')

  useEffect(() => {
    const mm = gsap.matchMedia()
    mm.add('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
      const el = peek.current!
      const x = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3' })
      const y = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3' })
      const at = (e: React.MouseEvent) =>
        [Math.min(innerWidth - 330, Math.max(innerWidth * 0.45, e.clientX + 60)), Math.max(20, Math.min(innerHeight - 420, e.clientY - 200))] as const
      move.current = (e) => {
        const [px, py] = at(e)
        if (e.type === 'mouseenter') { x(px, px); y(py, py) } // start where the pointer is, not where it last was
        else { x(px); y(py) }
      }
      const hide = () => gsap.to(el.firstElementChild, { autoAlpha: 0, duration: 0.2, overwrite: true })
      addEventListener('scroll', hide, { passive: true })
      return () => {
        move.current = null
        removeEventListener('scroll', hide)
      }
    })
    return () => mm.revert()
  }, [])

  const show = (e: React.MouseEvent, img: string) => {
    if (!move.current) return
    setSrc(img)
    move.current(e)
    gsap.fromTo(peek.current!.firstElementChild, { clipPath: 'inset(50% 0 50% 0)' }, { autoAlpha: 1, clipPath: 'inset(0% 0 0% 0)', duration: 0.5, ease: 'expo.out', overwrite: true })
  }
  const hide = () => move.current && gsap.to(peek.current!.firstElementChild, { autoAlpha: 0, duration: 0.25, overwrite: true })

  return (
    <section data-sigil="artists" className="flex flex-col gap-5 pb-14 md:gap-8 md:pb-24">
      <Reveal className="rit px-[var(--gutter)] text-[min(14.8vw,58px)] md:text-[min(10vw,140px)]">Who played</Reveal>

      <div className="flex snap-x snap-mandatory scroll-px-[var(--gutter)] gap-3 overflow-x-auto overscroll-x-contain px-[var(--gutter)] [scrollbar-width:none] md:hidden [&::-webkit-scrollbar]:hidden">
        {artists.map((a) => (
          <ArtistTile key={a.slug} artist={a} variant="carousel" className="snap-start" />
        ))}
      </div>
      <Link href="/artists/" className="rowlink mono mx-[var(--gutter)] border-b border-hair md:hidden">
        All artists
        <Arrow />
      </Link>

      <div className={`${s.rows} mx-[var(--gutter)] hidden md:block`} onMouseLeave={hide}>
        {artists.map((a, i) => (
          <Link
            key={a.slug}
            href={`/artists/${a.slug}/`}
            className={`rowlink ${s.row} py-[10px] ${i === artists.length - 1 ? 'border-b border-hair' : ''}`}
            onMouseEnter={(e) => show(e, mediaUrl((portraits[a.slug] ?? a.photo).replace('-1600.', '-800.')))}
            onMouseMove={(e) => move.current?.(e)}
          >
            <span className={`rit ${s.nm} text-[min(9vw,120px)]`}>{a.name}</span>
            <span className="mono text-right">
              {a.genre}
              <br />
              <span className="dim">{a.origin}</span>
            </span>
          </Link>
        ))}
      </div>
      <div ref={peek} className={`${s.peek} hidden md:block`} aria-hidden="true">
        <div className={s.peekIn}>{src && <img src={src} alt="" className="cover" />}</div>
      </div>
    </section>
  )
}
