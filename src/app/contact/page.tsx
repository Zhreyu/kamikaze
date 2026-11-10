import type { Metadata } from 'next'
import DemoForm from '@/components/DemoForm'
import { EMAIL, INSTAGRAM } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Contact and demos',
  description: `Bookings and questions: ${EMAIL}. Demos go through the form with a SoundCloud link, artist name and city. We review every demo.`,
  alternates: { canonical: '/contact/' },
}

const routes = [
  ['Bookings', EMAIL, `mailto:${EMAIL}?subject=Booking`],
  ['General', EMAIL, `mailto:${EMAIL}`],
  ['Instagram', 'kamikaze.intl', INSTAGRAM],
]

export default function Contact() {
  return (
    <div data-sigil="off" className="md:wrap md:grid md:grid-cols-12 md:gap-x-10 md:pb-16">
      <section className="wrap flex flex-col pb-9 pt-4 md:col-span-6 md:px-0 md:pt-10">
        <h1 className="rit text-[min(20.5vw,80px)] md:text-[min(11vw,160px)]">Contact</h1>
        <p className="dim mb-5 mt-3 md:mb-10 md:mt-8">Bookings, questions, collabs. Pick a route.</p>
        {routes.map(([label, value, href], i) => (
          <a key={label} href={href} className={`rowlink group min-h-[60px] md:min-h-[72px] ${i === routes.length - 1 ? 'border-b border-hair' : ''}`}>
            <span className="mono dim">{label}</span>
            <span className="underline-offset-4 group-hover:underline md:text-[20px]">{value}</span>
          </a>
        ))}
      </section>
      <section className="wrap flex flex-col gap-3 pb-7 md:frame md:col-span-5 md:col-start-8 md:mt-10 md:self-start md:p-8">
        <h2 className="rit text-[min(11.8vw,46px)] md:text-[46px]">Send a demo</h2>
        <p className="dim mb-2">We review every demo. No guarantees, just an honest listen.</p>
        <DemoForm />
      </section>
    </div>
  )
}
