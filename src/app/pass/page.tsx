import type { Metadata } from 'next'
import Pass from '@/components/pass/Pass'
import { fmtDate, nextEvent, riteLabel } from '@/data/events'

// Fixed at build time on a static export: rebuild after an event passes.
const next = nextEvent()

export const metadata: Metadata = {
  title: 'Take the pass',
  description: next
    ? `Sign up and you get a numbered soul pass. The venue for ${fmtDate(next.date)} reaches you first, and your link counts everyone you bring.`
    : 'Sign up and you get a numbered soul pass. Your link counts everyone you bring.',
  alternates: { canonical: '/pass/' },
}

export default function PassPage() {
  return <Pass rite={next && riteLabel(next)} date={next && fmtDate(next.date)} />
}
