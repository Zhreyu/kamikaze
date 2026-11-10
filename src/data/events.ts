export type Event = {
  slug: string
  rite: number
  date: string // 'YYYY-MM-DD', India time
  name?: string
  city?: string
  venue?: string
  lineup?: string[] // artist slugs
  ticketUrl?: string
  recap?: { line: string; lineHot: string; story: string }
}

// Newest first. A field left unset is sealed (not announced yet): never fill one in with a guess.
export const events: Event[] = [
  { slug: 'rite-002', rite: 2, date: '2026-12-31' },
  {
    slug: 'override',
    rite: 1,
    name: 'OVERRIDE',
    date: '2026-09-05',
    city: 'Trivandrum',
    lineup: ['siren', 'ibliiiz', 'anshe', 'junvon'],
    recap: {
      line: 'Planned for 250.',
      lineHot: '500 came.',
      story:
        'We built OVERRIDE for 250 people. 500 of you came through the door. A dome in Trivandrum, one room, no VIP. The response was immaculate, and we are still not over it. This is what it looked like from inside.',
    },
  },
]

/** Countdown target: the first minute of the day in India. */
export const startsAt = (e: Event) => Date.parse(`${e.date}T00:00:00+05:30`)

/** Computed from the date, never set by hand. Call it in the browser for anything that must flip without a rebuild. */
export const isPast = (e: Event, now = Date.now()) => now > Date.parse(`${e.date}T23:59:59+05:30`)

/** The soonest event that has not happened yet. */
export const nextEvent = () => events.filter((e) => !isPast(e)).sort((a, b) => a.date.localeCompare(b.date))[0] as Event | undefined

/** Finished events, most recent first. */
export const pastEvents = () => events.filter((e) => isPast(e)).sort((a, b) => b.date.localeCompare(a.date))

export const getEvent = (slug: string) => events.find((e) => e.slug === slug)

export const riteLabel = (e: Event) => `Rite ${String(e.rite).padStart(3, '0')}`

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** '2026-12-31' -> 'Thu 31 Dec 2026' (CSS uppercases it). Pure arithmetic on the calendar date: no locale, no time zone drift. */
export function fmtDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return `${DAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]} ${String(d).padStart(2, '0')} ${MONTHS[m - 1]} ${y}`
}
