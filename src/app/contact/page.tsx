import type { Metadata } from 'next'
import { EMAIL } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Contact and demos',
  description: `Bookings and questions: ${EMAIL}. Demos go through the form with a SoundCloud link, artist name and city. We review every demo.`,
  alternates: { canonical: '/contact/' },
}

export default function Contact() {
  return (
    <div className="wrap">
      <h1 className="rit">Contact</h1>
    </div>
  )
}
