import type { Metadata } from 'next'
import Link from 'next/link'
import { PastCard, UpNext } from '@/components/EventCards'
import PastWide from '@/components/home/PastWide'
import { fmtDate, nextEvent, pastEvents, riteLabel } from '@/data/events'

const next = nextEvent()
const past = pastEvents()
const last = past[0]

export const metadata: Metadata = {
  title: 'Events',
  description: next
    ? `Up next: ${riteLabel(next)}, ${fmtDate(next.date)}. City and venue sealed.${last ? ` Before it: ${last.name}, ${fmtDate(last.date)}, ${last.city}. ${last.recap?.line} ${last.recap?.lineHot}` : ''}`
    : 'Every Kamikaze event so far, with photos and who played. No new date is announced yet.',
  alternates: { canonical: '/events/' },
}

export default function Events() {
  return (
    <>
      <section className="wrap flex flex-col gap-[18px] pb-9 pt-4 md:gap-6 md:pb-[72px] md:pt-6">
        {/* the canvas 92px is cut off at 390: 21vw keeps the whole word inside the gutters */}
        <h1 className="rit text-[min(21vw,92px)] md:text-[min(11vw,160px)]">Events</h1>
        <h2 className="mono hot">Upcoming</h2>
        {next ? (
          <UpNext event={next} variant="events" />
        ) : (
          <p>
            No date announced yet.{' '}
            <Link href="/pass/" className="link inline-flex min-h-[44px] items-center">
              Take the pass
            </Link>
          </p>
        )}
      </section>

      {past.length > 0 && (
        <section className="wrap flex flex-col gap-[18px] pb-5 md:gap-6 md:pb-24">
          <h2 className="mono hot">Past</h2>
          {past.map((e) => (
            // the id keeps the old /events#kamikaze-override link landing here at both widths
            <div key={e.slug} id={`kamikaze-${e.slug}`} className="scroll-mt-[calc(var(--nav-h)+16px)]">
              {e.recap ? (
                <>
                  <PastCard event={e} variant="events" className="md:hidden" />
                  <PastWide event={e} />
                </>
              ) : (
                <div className="frame flex flex-col gap-3">
                  <h3 className="rit text-[min(15.4vw,68px)]">{e.name ?? riteLabel(e)}</h3>
                  <p className="mono">
                    <span className="hot">{riteLabel(e)}</span> / {fmtDate(e.date)}
                    {e.city && ` / ${e.city}`}
                  </p>
                  <p className="dim">No recap yet. The photos go up here when they are ready.</p>
                </div>
              )}
            </div>
          ))}
        </section>
      )}
    </>
  )
}
