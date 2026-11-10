import type { Metadata } from 'next'
import Link from 'next/link'
import Arrow from '@/components/Arrow'

export const metadata: Metadata = { title: 'Page not found', description: 'There is no page at this address.' }

const links = [
  ['Home', '/'],
  ['Events', '/events/'],
  ['OVERRIDE recap', '/events/override/'],
]

export default function NotFound() {
  return (
    <div data-sigil="off" className="wrap pb-10 pt-4 md:grid md:grid-cols-12 md:gap-x-10 md:pb-24 md:pt-10">
      <h1 className="rit text-[min(26.6vw,104px)] md:col-span-12 md:text-[min(11vw,160px)]">Wrong room</h1>
      <p className="mt-6 max-w-[65ch] md:col-span-5 md:mt-12 md:text-[20px]">There is no page here. Some old links stopped working when we rebuilt the site.</p>
      <nav aria-label="Where to go" className="mt-7 flex flex-col md:col-span-6 md:col-start-7 md:row-span-2 md:mt-12">
        {links.map(([label, href], i) => (
          <Link key={href} href={href} className={`rowlink group md:min-h-[72px] md:text-[20px] ${i === links.length - 1 ? 'border-b border-hair' : ''}`}>
            {label}
            <Arrow className="transition-transform duration-300 ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-x-1" />
          </Link>
        ))}
      </nav>
      <Link href="/pass/" data-kick className="cta mono mt-7 md:col-span-5 md:col-start-1 md:mt-8 md:w-[360px] md:self-start">
        Get the venue first
        <Arrow />
      </Link>
    </div>
  )
}
