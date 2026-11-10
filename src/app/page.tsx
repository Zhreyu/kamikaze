import type { Metadata } from 'next'
import Link from 'next/link'
import Arrow from '@/components/Arrow'
import { PastCard, UpNext } from '@/components/EventCards'
import Reveal from '@/components/Reveal'
import Readout from '@/components/home/Readout'
import Slam from '@/components/home/Slam'
import WhoPlayed from '@/components/home/WhoPlayed'
import s from '@/components/home/home.module.css'
import { fmtDate, nextEvent, pastEvents, riteLabel, startsAt } from '@/data/events'
import { getAssetPath } from '@/lib/basePath'

export const metadata: Metadata = {
  title: { absolute: 'Kamikaze / The room is the headliner' },
  alternates: { canonical: '/' },
}

const i = (n: number) => ({ '--i': n }) as React.CSSProperties // entrance order

/** A fact of the next event, or the sealed bar while it is not announced. */
const Fact = ({ label, value, width }: { label: string; value?: string; width: number }) => (
  <>
    <dt className="dim">{label}</dt>
    <dd>
      {value ?? (
        <span className="bar" style={{ width }}>
          <span className="sr-only">Not announced yet</span>
        </span>
      )}
    </dd>
  </>
)

export default function Home() {
  const next = nextEvent()
  const last = pastEvents().find((e) => e.recap)
  return (
    <>
      {/* --s is the sigil still's box: it shrinks on short screens so it never sits under the date */}
      <section
        data-sigil="hero"
        className="wrap relative flex min-h-[calc(100svh-var(--nav-h)-env(safe-area-inset-top,0px))] flex-col justify-between gap-8 pb-7 [--s:min(300px,77vw,calc(100svh-500px))] md:pb-10 md:pt-2 md:[--s:min(480px,calc(100svh-340px))]"
      >
        <div aria-hidden="true" className="absolute left-1/2 top-16 ml-[calc(var(--s)/-2)] h-[var(--s)] w-[var(--s)] md:top-[110px]">
          <div data-sigil-hide className="absolute -inset-5 rounded-full border border-[rgba(255,59,48,.45)] md:-inset-10" />
          <img
            data-sigil-still
            src={getAssetPath('/logo-sigil-384.webp')}
            srcSet={`${getAssetPath('/logo-sigil-384.webp')} 384w, ${getAssetPath('/logo-sigil.webp')} 512w`}
            sizes="(min-width: 900px) 480px, 300px"
            width={512}
            height={512}
            alt=""
            className="h-full w-full object-contain"
          />
        </div>

        <div className="relative">
          <h1 className={`${s.wm} rit mt-2 whitespace-nowrap text-center text-[min(15.4vw,60px)] md:mt-0 md:text-[min(15.5vw,240px)]`}>
            <span className="sr-only">Kamikaze</span>
            {[...'Kamikaze'].map((ch, n) => (
              <span key={n} aria-hidden="true" style={i(n)}>
                {ch}
              </span>
            ))}
          </h1>
          <p className={`${s.rise} mono mx-auto mt-[14px] table bg-void/75 px-[10px] py-1 tracking-[.3em] md:mt-[18px] md:px-3 md:py-[5px]`} style={i(0)}>
            The room is the headliner
          </p>
        </div>

        <div className="relative flex flex-wrap items-end justify-between gap-7">
          <div className="w-full md:w-auto md:max-w-[520px]">
            <p className={`${s.rise} num hot text-[38px] md:text-[64px]`} style={i(1)}>
              {next ? fmtDate(next.date) : 'No date yet'}
            </p>
            {next && (
              <>
                <p className={`${s.rise} mono mt-2 md:mt-[10px]`} style={i(2)}>
                  {riteLabel(next)}
                  {next.name ? ` / ${next.name}` : ' / sealed'}
                </p>
                <dl className={`${s.rise} mono mb-[10px] mt-[18px] grid grid-cols-[70px_auto] items-center justify-start gap-x-3 gap-y-[10px] md:mt-5 md:grid-cols-[76px_auto] md:gap-x-[14px]`} style={i(3)}>
                  <Fact label="City" value={next.city} width={130} />
                  <Fact label="Venue" value={next.venue} width={220} />
                </dl>
                <p className={`${s.rise} dim mb-4 md:mb-[18px]`} style={i(4)}>
                  Venue drops to the list first.
                </p>
              </>
            )}
            <Link href="/pass/" data-kick className={`${s.rise} cta mono md:inline-flex ${next ? '' : 'mt-4'}`} style={i(5)}>
              Get the venue first
              <Arrow />
            </Link>
          </div>
          {next && <Readout to={startsAt(next)} label={`Time until ${fmtDate(next.date)}`} zeroLabel={`${riteLabel(next)} is today`} />}
        </div>
      </section>

      <Slam />

      <section data-sigil="up" className="wrap flex flex-col gap-4 pb-14 pt-10 md:gap-7 md:pb-24">
        <Reveal className="rit text-[min(21vw,88px)] md:text-[min(10vw,140px)]">Events</Reveal>
        <div className="mt-2 grid gap-4 md:mt-0 md:grid-cols-2 md:gap-6">
          {next ? <UpNext event={next} variant="home" /> : <p className="dim">No date announced yet.</p>}
          {last && <PastCard event={last} variant="home" />}
        </div>
      </section>

      <WhoPlayed />

      <section data-sigil="pass" className="wrap flex flex-col gap-4 pb-5 md:flex-row md:flex-wrap md:items-end md:justify-between md:gap-6 md:border-t md:border-hair md:pb-10 md:pt-[72px]">
        <Reveal className="rit text-[min(16.4vw,64px)] md:text-[min(10vw,140px)]">Take the pass</Reveal>
        <p className="dim md:hidden">A numbered soul pass. The venue reaches you first, and your link counts everyone you bring.</p>
        <Link href="/pass/" data-kick className="cta mono">
          Seal my pass
          <Arrow />
        </Link>
      </section>
    </>
  )
}
