import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About',
  description: 'Kamikaze started with a complaint: bottle service creeping in, lineups built for photos. In 2026 we started running the room we wanted to be in.',
  alternates: { canonical: '/about/' },
}

export default function About() {
  return (
    <div className="wrap">
      <h1 className="rit">About</h1>
    </div>
  )
}
