'use client'
import Link from 'next/link'
import { getArtist } from '@/data/artists'
import { mediaUrl, photoSrcSet, slotPhoto } from '@/data/content'
import { fmtDate, riteLabel, startsAt, type Event } from '@/data/events'
import { useContent } from '@/lib/content'
import Arrow from './Arrow'
import Countdown from './Countdown'

/** A fact that is not announced yet: the redacted bar, with words for screen readers. */
const Sealed = ({ width }: { width: number }) => (
  <span className="bar max-w-full" style={{ width }}>
    <span className="sr-only">Not announced yet</span>
  </span>
)

/**
 * The next event. `home`: date, countdown, one action (phone: See the event; md+: the seal line + Get the venue first).
 * `events`: phone adds the full facts list; md+ is one row of date, countdown, action.
 */
export function UpNext({ event, variant, className = '' }: { event: Event; variant: 'home' | 'events'; className?: string }) {
  const home = variant === 'home'
  const facts: [string, React.ReactNode][] = [
    ['Name', event.name ?? <Sealed width={170} />],
    ['City', event.city ?? <Sealed width={130} />],
    ['Venue', event.venue ?? <Sealed width={200} />],
    ['Lineup', event.lineup?.map((slug) => getArtist(slug)?.name ?? slug).join(', ') ?? 'To be announced'],
    ['Tickets', event.ticketUrl ? <a className="link" href={event.ticketUrl}>Get tickets</a> : 'Not on sale yet'],
  ]
  return (
    <div
      className={`frame flex min-w-0 flex-col gap-[14px] ${
        home ? 'md:justify-between md:gap-5 md:p-8' : 'md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-x-12 md:gap-y-6 md:px-8 md:py-7'
      } ${className}`}
    >
      <div className={`flex flex-col ${home ? 'gap-[14px] md:gap-5' : 'gap-[14px] md:gap-3'}`}>
        <p className="mono">
          <span className="chip">Up next</span>
          {riteLabel(event)}
          {!home && !event.name && <span className="hidden md:inline"> / sealed</span>}
        </p>
        <p className={`num hot text-[44px] ${home ? 'md:text-[72px]' : 'md:text-[64px]'}`}>{fmtDate(event.date)}</p>
      </div>
      {!home && (
        <dl className="flex flex-col md:hidden">
          {facts.map(([label, value], i) => (
            <div key={label} className={`rowlink justify-start ${i === facts.length - 1 ? 'border-b border-hair' : ''}`}>
              <dt className="mono dim w-[84px] shrink-0">{label}</dt>
              <dd className="min-w-0 flex-1">{value}</dd>
            </div>
          ))}
        </dl>
      )}
      <Countdown
        to={startsAt(event)}
        label={`Time until ${fmtDate(event.date)}`}
        zeroLabel={`${riteLabel(event)} is today`}
        className={`grid-cols-4 gap-[10px] text-[min(10.4vw,44px)] md:grid-cols-[repeat(4,auto)] md:justify-start md:gap-7 ${home ? 'md:text-[64px]' : 'md:text-[56px]'}`}
      />
      {home ? (
        <>
          <Link href="/events/" data-kick className="cta mono md:hidden">
            See the event
            <Arrow />
          </Link>
          <p className="dim hidden md:block">The seal lifts for the list a day before everyone else.</p>
          <Link href="/pass/" data-kick className="cta mono hidden self-start md:flex">
            Get the venue first
            <Arrow />
          </Link>
        </>
      ) : (
        <Link href="/pass/" data-kick className="cta mono">
          Get the venue first
          <Arrow />
        </Link>
      )}
    </div>
  )
}

/**
 * A finished event as one link to its recap: photo (the admin's `card` slot), name, rite / date / city, the turnout line.
 * Pass `id` where an old anchor has to keep landing (events page: "kamikaze-override").
 */
export function PastCard({ event, variant, id, className = '' }: { event: Event; variant: 'home' | 'events'; id?: string; className?: string }) {
  const photo = slotPhoto(useContent(), 'card')
  const home = variant === 'home'
  return (
    <Link id={id} href={`/events/${event.slug}/`} className={`frame group flex min-w-0 scroll-mt-[calc(var(--nav-h)+16px)] flex-col gap-3 p-0 pb-[10px] md:gap-[14px] md:pb-[18px] ${className}`}>
      <img
        src={mediaUrl(photo.thumb)}
        srcSet={photoSrcSet(photo)}
        sizes="(min-width: 900px) 50vw, 100vw"
        alt={photo.alt}
        loading="lazy"
        decoding="async"
        className={`cover ${home ? 'h-[220px]' : 'h-[240px]'} md:h-[300px]`}
      />
      {/* the canvas 60/68px wraps OVERRIDE inside the card at 390: 13.2vw keeps it on one line on any phone */}
      <span className="rit break-words px-[18px] text-[min(13.2vw,52px)] md:px-7 md:text-[min(5.8vw,84px)]">{event.name}</span>
      <span className="mono px-[18px] md:px-7">
        <span className="hot">{riteLabel(event)}</span> / {fmtDate(event.date)}
        {event.city && ` / ${event.city}`}
      </span>
      {event.recap && (
        <span className={`px-[18px] md:px-7 ${home ? 'md:num md:text-[34px]' : 'num text-[30px] md:text-[34px]'}`}>
          {event.recap.line} <span className={home ? 'md:hot' : 'hot'}>{event.recap.lineHot}</span>
        </span>
      )}
      <span className="mono flex min-h-[44px] items-center justify-between gap-3 px-[18px] md:justify-start md:px-7">
        See the recap
        <Arrow className="transition-transform duration-300 ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-x-1" />
      </span>
    </Link>
  )
}
