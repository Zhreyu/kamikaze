import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { events, fmtDate, getEvent, riteLabel } from '@/data/events'

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
  if (!event) notFound()
  return (
    <div className="wrap">
      <h1 className="rit">{event.name}</h1>
    </div>
  )
}
