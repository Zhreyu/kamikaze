'use client'
import { useEffect, useRef, useState } from 'react'
import { defaultContent, mediaUrl, photoSrcSet, slotPhoto } from '@/data/content'
import { fmtDate, riteLabel, type Event } from '@/data/events'
import { useContent } from '@/lib/content'
import Arrow from '../Arrow'
import s from './recap.module.css'

const p2 = (n: number) => String(n).padStart(2, '0')
const GLASS_SIZES = '(min-width: 900px) 58vw, 100vw'
const MIN_GAP = 340 // ms between frame changes: never more than 3 a second, however fast someone taps
const HOLD = 2800 // ms each photo stays up while playing

/**
 * The recap player: a poster with one start button, then every photo of the night in order, 2.8s each.
 * Prev / Pause / Next, a thumbnail strip, swipe on the glass, Left/Right keys. Stops when off screen or the tab is hidden.
 */
export function Player({ event }: { event: Event }) {
  const content = useContent()
  const photos = content.photos
  const total = photos.length
  const poster = slotPhoto(content, 'top')
  const [i, setI] = useState(-1) // -1 = poster
  const [playing, setPlaying] = useState(false)
  const [live, setLive] = useState(true) // on screen and the tab is visible
  const root = useRef<HTMLDivElement>(null)
  const strip = useRef<HTMLDivElement>(null)
  const toggle = useRef<HTMLButtonElement>(null)
  const last = useRef(0)
  const downX = useRef<number | null>(null)
  const cur = i < 0 ? poster : photos[i % total]

  const go = (n: number) => {
    const now = performance.now()
    if (now - last.current < MIN_GAP) return
    last.current = now
    setI(((n % total) + total) % total)
  }
  const step = (d: 1 | -1) => go(i < 0 ? (d > 0 ? 0 : total - 1) : i + d)
  const start = () => {
    setPlaying(true)
    go(0)
    toggle.current?.focus() // the start button is about to go away
  }

  useEffect(() => {
    let inView = true
    const sync = () => setLive(inView && !document.hidden)
    const io = new IntersectionObserver(([e]) => {
      inView = e.isIntersecting
      sync()
    })
    if (root.current) io.observe(root.current)
    document.addEventListener('visibilitychange', sync)
    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', sync)
    }
  }, [])

  useEffect(() => {
    if (!playing || !live || i < 0) return
    const t = setTimeout(() => {
      last.current = performance.now()
      setI((i + 1) % total)
    }, HOLD)
    return () => clearTimeout(t)
  }, [playing, live, i, total])

  useEffect(() => {
    if (i < 0) return
    // keep the current thumbnail centred (smoothness comes from CSS, so reduced motion turns it off)
    const el = strip.current
    const t = el?.children[i] as HTMLElement | undefined
    if (el && t) el.scrollTo({ left: t.offsetLeft - el.clientWidth / 2 + t.clientWidth / 2 })
    // have the next frame ready before it is asked for
    const next = new Image()
    next.sizes = GLASS_SIZES
    next.srcset = photoSrcSet(photos[(i + 1) % total])
  }, [i, photos, total])

  return (
    <div
      ref={root}
      role="group"
      tabIndex={0}
      aria-label={`${event.name} recap, ${total} photos`}
      onKeyDown={(e) => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
        e.preventDefault()
        step(e.key === 'ArrowRight' ? 1 : -1)
      }}
    >
      <div
        className={s.glass}
        aria-live={playing ? 'off' : 'polite'}
        onPointerDown={(e) => (downX.current = e.clientX)}
        onPointerCancel={() => (downX.current = null)}
        onPointerUp={(e) => {
          const dx = downX.current === null ? 0 : e.clientX - downX.current
          downX.current = null
          if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1)
        }}
      >
        <img
          src={mediaUrl(cur.thumb)}
          srcSet={photoSrcSet(cur)}
          sizes={GLASS_SIZES}
          alt={i < 0 && poster.id === defaultContent.slots.top ? `The decks in the foreground, the whole ${event.name} crowd beyond` : cur.alt}
          draggable={false}
          fetchPriority="high"
        />
        {i >= 0 && <div key={i} className={s.noise} aria-hidden="true" />}
        <p className={`${s.osd} mono hot top-3 md:top-[18px]`} aria-hidden="true">
          {riteLabel(event)}
          {event.city && ` / ${event.city}`}
        </p>
        <p className={`${s.osd} mono bottom-3 md:bottom-[18px]`} aria-hidden="true">
          {event.name} / {fmtDate(event.date)}
        </p>
        {i < 0 && (
          <div className="absolute inset-0 z-[5] grid place-items-center">
            <button type="button" data-kick onClick={start} className="cta mono min-h-[60px] px-[30px] text-[14px]">
              <svg viewBox="0 0 14 14" aria-hidden="true" className="!h-[14px] !w-[14px]">
                <path d="M2 1l11 6-11 6z" fill="currentColor" />
              </svg>
              Watch recap
            </button>
          </div>
        )}
      </div>

      <div className="mt-[22px] flex items-center gap-[10px]">
        <button type="button" aria-label="Previous photo" onClick={() => step(-1)} className="ghost mono flex-1 px-2 md:min-w-[76px] md:flex-none md:px-4">
          Prev
        </button>
        <button ref={toggle} type="button" onClick={() => (i < 0 ? start() : setPlaying(!playing))} className="ghost mono flex-1 px-2 md:min-w-[76px] md:flex-none md:px-4">
          {playing ? 'Pause' : 'Play'}
        </button>
        <button type="button" aria-label="Next photo" onClick={() => step(1)} className="ghost mono flex-1 px-2 md:min-w-[76px] md:flex-none md:px-4">
          Next
        </button>
        <span className="mono dim ml-auto min-w-[76px] text-right tabular-nums">{i < 0 ? `${total} photos` : `${p2(i + 1)} / ${p2(total)}`}</span>
      </div>

      <div
        ref={strip}
        className="relative -mx-5 mt-[14px] flex gap-[6px] overflow-x-auto overscroll-x-contain scroll-smooth px-5 pb-1 [scrollbar-width:none] md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {photos.map((p, k) => (
          <button
            key={p.id}
            type="button"
            aria-label={`Photo ${p2(k + 1)} of ${p2(total)}`}
            aria-current={k === i}
            onClick={() => go(k)}
            className="h-[56px] w-[76px] flex-none border border-hair bg-black p-0 opacity-50 transition-[opacity,border-color] duration-200 focus-visible:outline-offset-[-2px] hover:border-hot hover:opacity-100 aria-[current=true]:border-hot aria-[current=true]:opacity-100 md:h-[64px] md:w-[92px]"
          >
            <img src={mediaUrl(p.thumb)} alt="" loading="lazy" decoding="async" draggable={false} className="cover" />
          </button>
        ))}
      </div>
    </div>
  )
}

/** One block per track the admin has listed: cover, title, note, a link out to SoundCloud. */
export function Mix() {
  const { tracks } = useContent()
  if (!tracks.length) return null
  return (
    <section className="flex flex-col">
      <h2 className="mono hot mb-3">{tracks.length > 1 ? 'Mixes' : 'The mix'}</h2>
      {tracks.map((t) => (
        <div key={t.id} className="group flex flex-col gap-4 border-t border-hair py-4 last:border-b">
          <div className="flex items-center gap-4">
            {t.cover && (
              <div className="h-[112px] w-[112px] flex-none overflow-hidden outline outline-1 outline-hair md:h-[148px] md:w-[148px]">
                <img
                  src={mediaUrl(t.cover)}
                  alt={`Cover art for ${t.title}`}
                  loading="lazy"
                  decoding="async"
                  className="cover transition-transform duration-[1200ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:rotate-[-4deg] group-hover:scale-[1.08]"
                />
              </div>
            )}
            <div className="min-w-0">
              <h3 className="num break-words text-[22px] md:text-[24px]">{t.title}</h3>
              {t.note && <p className="dim mt-2">{t.note}</p>}
            </div>
          </div>
          <a href={t.url} target="_blank" rel="noopener noreferrer" className="ghost mono md:self-start">
            Play on SoundCloud
            <Arrow />
          </a>
        </div>
      ))}
    </section>
  )
}

/** The photo grid. Each cell opens a full-screen native <dialog>: a swipeable strip of the same photos, opened at the one tapped. */
export function Photos({ name }: { name: string }) {
  const content = useContent()
  const photos = content.photos.filter((p) => p.grid)
  const total = photos.length
  const dlg = useRef<HTMLDialogElement>(null)
  const strip = useRef<HTMLDivElement>(null)
  const [at, setAt] = useState(0)

  const to = (n: number, jump = false) => {
    const el = strip.current
    if (el) el.scrollTo({ left: Math.max(0, Math.min(total - 1, n)) * el.clientWidth, behavior: jump ? 'instant' : 'auto' })
  }
  // the page behind must not scroll or render 3D while the viewer covers it
  const cover = (on: boolean) => {
    const html = document.documentElement
    html.style.overflow = on ? 'hidden' : ''
    if (on) html.dataset.sigilPause = '1'
    else delete html.dataset.sigilPause
  }
  const open = (n: number) => {
    cover(true)
    dlg.current?.showModal()
    setAt(n)
    to(n, true)
  }
  useEffect(() => () => void (dlg.current?.open && cover(false)), []) // leaving the page with the viewer open

  return (
    <section className="flex flex-col">
      <h2 className="mono hot px-5 pb-3 md:px-0">Photos</h2>
      <div className="photo-grid auto-rows-[118px] grid-cols-2 md:auto-rows-[190px] md:grid-cols-3">
        {photos.map((p, k) => (
          <button
            key={p.id}
            type="button"
            onClick={() => open(k)}
            // ponytail: the poster photo already sits in the player above, and eleven cells tile two columns with no hole; revisit if the admin reorders the grid
            className={`group cursor-zoom-in p-0 focus-visible:outline-offset-[-2px] ${p.span ?? ''} ${p.id === content.slots.top ? 'hidden md:block' : ''}`}
          >
            <img
              src={mediaUrl(p.thumb)}
              srcSet={photoSrcSet(p)}
              sizes={p.span === 'big' ? '(min-width: 900px) 42vw, 100vw' : '(min-width: 900px) 21vw, 50vw'}
              alt={p.alt}
              loading="lazy"
              decoding="async"
              className="cover transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.04]"
            />
          </button>
        ))}
      </div>

      <dialog
        ref={dlg}
        aria-label={`${name} photos`}
        onClose={() => cover(false)}
        onClick={(e) => !(e.target as HTMLElement).closest('img, button') && dlg.current?.close()}
        onKeyDown={(e) => {
          if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
          e.preventDefault()
          to(at + (e.key === 'ArrowRight' ? 1 : -1))
        }}
        className="m-0 h-full max-h-none w-full max-w-none flex-col bg-void p-0 text-bone backdrop:bg-black open:flex"
      >
        <div className="flex flex-none items-center gap-[10px] pb-2 pl-[max(20px,env(safe-area-inset-left))] pr-[max(12px,env(safe-area-inset-right))] pt-[max(8px,env(safe-area-inset-top))]">
          <p className="mono mr-auto tabular-nums" aria-live="polite">
            {p2(at + 1)} / {p2(total)}
          </p>
          <button type="button" aria-label="Previous photo" disabled={at === 0} onClick={() => to(at - 1)} className="ghost mono hidden min-h-[44px] px-4 md:flex">
            Prev
          </button>
          <button type="button" aria-label="Next photo" disabled={at === total - 1} onClick={() => to(at + 1)} className="ghost mono hidden min-h-[44px] px-4 md:flex">
            Next
          </button>
          <button type="button" onClick={() => dlg.current?.close()} className="ghost mono min-h-[44px] px-4">
            Close
          </button>
        </div>
        <div
          ref={strip}
          onScroll={(e) => setAt(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
          className="flex min-h-0 flex-1 snap-x snap-mandatory overflow-x-auto overflow-y-hidden overscroll-contain scroll-smooth pb-[env(safe-area-inset-bottom)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {photos.map((p) => (
            <div key={p.id} className="flex h-full w-full flex-none snap-center snap-always items-center justify-center md:px-10 md:pb-10">
              <img src={mediaUrl(p.thumb)} srcSet={photoSrcSet(p)} sizes="100vw" alt={p.alt} loading="lazy" decoding="async" draggable={false} className="max-h-full max-w-full object-contain" />
            </div>
          ))}
        </div>
      </dialog>
    </section>
  )
}
