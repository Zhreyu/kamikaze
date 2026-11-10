import type { Metadata } from 'next'
import { fmtDate, nextEvent } from '@/data/events'

const next = nextEvent()

export const metadata: Metadata = {
  title: 'Take the pass',
  description: next
    ? `Sign up and you get a numbered soul pass. The venue for ${fmtDate(next.date)} reaches you first, and your link counts everyone you bring.`
    : 'Sign up and you get a numbered soul pass. Your link counts everyone you bring.',
  alternates: { canonical: '/pass/' },
}

export default function Pass() {
  return (
    <div className="wrap">
      <h1 className="rit">Take the pass</h1>
    </div>
  )
}
