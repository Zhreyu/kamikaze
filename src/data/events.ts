export interface Event {
  id: string
  name: string
  date: string
  venue: string
  city: string
  lineup: string[]
  ticketUrl?: string
  isPast: boolean
  description?: string
  isSecretLocation?: boolean
  isFullyRedacted?: boolean
  isDateHidden?: boolean
  tbdFields?: ('venue' | 'lineup' | 'date')[]
}

export const events: Event[] = [
  {
    id: 'kamikaze-override',
    name: 'KAMIKAZE OVERRIDE',
    date: '2026-09-04',
    venue: 'Undisclosed',
    city: 'Trivandrum',
    lineup: ['KAMIKAZE COLLECTIVE', 'LOCAL FREQUENCIES', 'TBA'],
    ticketUrl: 'https://ra.co/events/kamikaze-override',
    isPast: false,
    description: 'A Kamikaze techno night. Venue, lineup, and tickets coming soon.',
    isSecretLocation: true,
    tbdFields: ['venue', 'lineup'],
  },
  {
    id: 'redacted-session-01',
    name: '[REDACTED SESSION]',
    date: '2025-05-17',
    venue: 'UNKNOWN',
    city: 'UNKNOWN',
    lineup: ['█████████', '███████', '██████'],
    isPast: false,
    description: 'You are not authorized to view this transmission. Clearance required. Signal locked until further notice.',
    isFullyRedacted: true,
  },
]

export function getUpcomingEvents(): Event[] {
  return events.filter((e) => !e.isPast)
}

export function getPastEvents(): Event[] {
  return events.filter((e) => e.isPast)
}

export function getEventById(id: string): Event | undefined {
  return events.find((e) => e.id === id)
}

export function formatEventDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).replace(/\//g, '.')
}

/** Day redacted — month and year only (e.g. XX.09.2026) */
export function formatEventDatePartial(dateStr: string): string {
  const date = new Date(dateStr)
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const year = date.getUTCFullYear()
  return `XX.${month}.${year}`
}

export function formatEventMonthYear(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}
