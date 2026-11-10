import type { Metadata } from 'next'
import { fmtDate, nextEvent, pastEvents, riteLabel } from '@/data/events'

const next = nextEvent()
const last = pastEvents()[0]

export const metadata: Metadata = {
  title: 'Events',
  description: next
    ? `Up next: ${riteLabel(next)}, ${fmtDate(next.date)}. City and venue sealed.${last ? ` Before it: ${last.name}, ${fmtDate(last.date)}, ${last.city}. ${last.recap?.line} ${last.recap?.lineHot}` : ''}`
    : 'Every Kamikaze event so far, with photos and who played. No new date is announced yet.',
  alternates: { canonical: '/events/' },
}

export default function Events() {
  return (
    <div className="wrap">
      <h1 className="rit">Events</h1>
    </div>
  )
}
