import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Arrow from '@/components/Arrow'
import { Mix, Photos, Player } from '@/components/recap/Recap'
import { getArtist } from '@/data/artists'
import { events, fmtDate, getEvent, nextEvent, riteLabel } from '@/data/events'

type Props = { params: Promise<{ slug: string }> }

// Only finished events with a recap get a page. Never empty: a static export needs at least one.
export const generateStaticParams = () => events.filter((e) => e.recap).map((e) => ({ slug: e.slug }))

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const event = getEvent((await params).slug)
  if (!event?.recap) return {}
  return {
    title: `${event.name}: photos and recap`,
    description: `${riteLabel(event)}. ${fmtDate(event.date)}, a dome in ${event.city}. ${event.recap.line} ${event.recap.lineHot} One room, no VIP. This is what it looked like from inside.`,
    alternates: { canonical: `/events/${event.slug}/` },
  }
}

export default async function EventPage({ params }: Props) {
  const event = getEvent((await params).slug)
  if (!event?.recap) notFound()
  const lineup = (event.lineup ?? []).flatMap((slug) => getArtist(slug) ?? [])
  const next = nextEvent() // fixed at build time on a static export: rebuild after an event passes

  return (
    <>
      <section data-sigil="recap" className="wrap pb-10 md:pb-24 md:pt-6">
        <Link href="/events/" className="mono dim inline-flex min-h-[44px] items-center">
          All events
        </Link>
        <div className="mt-[10px] flex flex-col gap-[14px] pb-6 md:flex-row md:flex-wrap md:items-end md:justify-between md:gap-x-10 md:pb-10">
          {/* 15.8vw keeps the whole word inside the gutters from 360 to 430px (the canvas 72px is cut off at 390) */}
          <h1 className="rit text-[min(15.8vw,72px)] md:text-[min(9vw,116px)]">{event.name}</h1>
          <p className="mono md:pb-2">
            <span className="hot">{riteLabel(event)}</span> / {fmtDate(event.date)}
            {event.city && ` / ${event.city}`}
          </p>
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)] gap-9 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:items-start md:gap-x-16">
          <Player event={event} />
          <div className="flex flex-col gap-4 md:gap-[18px]">
            <p className="num text-[50px] md:text-[min(4.4vw,64px)]">
              {event.recap.line}
              <br />
              <span className="hot">{event.recap.lineHot}</span>
            </p>
            <p className="max-w-[65ch]">{event.recap.story}</p>
            <p className="mono dim">Kamikaze</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-[minmax(0,1fr)] md:grid-cols-[minmax(0,480px)_minmax(0,1fr)] md:items-start md:gap-x-14 md:px-[var(--gutter)] md:pb-24">
        <div className="flex flex-col gap-10 px-5 pb-10 md:sticky md:top-[calc(var(--nav-h)+24px)] md:gap-14 md:px-0 md:pb-0">
          {lineup.length > 0 && (
            <section className="flex flex-col">
              <h2 className="mono hot mb-3">Who played</h2>
              {lineup.map((a) => (
                <Link key={a.slug} href={`/artists/${a.slug}/`} className="rowlink rit group min-h-[58px] text-[40px] last:border-b last:border-hair">
                  {a.name}
                  <Arrow className="transition-transform duration-300 ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-x-1" />
                </Link>
              ))}
            </section>
          )}
          <Mix />
        </div>
        <Photos name={event.name ?? riteLabel(event)} />
      </div>

      {next && (
        <section className="wrap pb-5 pt-11 md:pb-24 md:pt-0">
          <div className="flex flex-col gap-[14px] md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-x-12 md:gap-y-6 md:border-t md:border-hair md:pt-12">
            <div className="flex flex-col gap-[14px]">
              <p className="num hot text-[40px] md:text-[64px]">{fmtDate(next.date)}</p>
              {!next.venue && <p className="dim">{riteLabel(next)} is sealed. The venue drops to the list first.</p>}
            </div>
            <Link href="/pass/" data-kick className="cta mono md:min-w-[280px]">
              Get the venue first
              <Arrow />
            </Link>
          </div>
        </section>
      )}
    </>
  )
}
