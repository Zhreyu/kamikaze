import type { Metadata } from 'next'
import Link from 'next/link'
import Arrow from '@/components/Arrow'
import Reveal from '@/components/Reveal'
import AboutPhoto from './AboutPhoto'

export const metadata: Metadata = {
  title: 'About',
  description: 'Kamikaze started with a complaint: bottle service creeping in, lineups built for photos. In 2026 we started running the room we wanted to be in.',
  alternates: { canonical: '/about/' },
}

const h2 = 'rit text-[38px] md:text-[min(5vw,64px)]'

export default function About() {
  return (
    <div data-sigil="off">
      <div className="md:wrap md:grid md:grid-cols-12 md:items-stretch md:gap-x-10 md:pb-24">
        {/* md+: title at the top of the left column, the opening pinned to its foot, the photo filling the right */}
        <section className="wrap flex flex-col gap-[14px] pb-7 pt-4 md:col-span-6 md:justify-between md:gap-16 md:px-0 md:pb-0 md:pt-10">
          <h1 className="rit text-[min(26.6vw,104px)] md:text-[min(11vw,160px)]">About</h1>
          <div className="mt-[14px] flex flex-col gap-[14px] md:mt-0">
            <h2 className={h2}>We started with a complaint</h2>
            <p className="max-w-[65ch] md:mt-3">
              Kamikaze began the way most underground scenes do. A few people in the same rooms, tired of the same problems. Bottle service creeping in. Lineups built for photos, not
              the music. Nights that felt more like networking than dancing.
            </p>
            <p className="dim max-w-[65ch]">In 2026 we stopped waiting for someone else to fix it and started running the room we wanted to be in.</p>
          </div>
        </section>
        <AboutPhoto className="h-[260px] md:col-span-6 md:mt-10 md:h-auto md:min-h-[min(42vw,580px)]" />
      </div>

      <section className="wrap flex flex-col gap-[14px] pb-7 pt-8 md:grid md:grid-cols-12 md:gap-x-10 md:gap-y-0 md:pb-24 md:pt-0">
        <div className="flex flex-col gap-[14px] md:col-span-5 md:gap-5">
          <Reveal className={h2}>What we do</Reveal>
          <p className="max-w-[65ch]">
            We produce independent techno experiences. Focused rooms, intentional programming, and sound treated as the priority. We book on merit, take demos through the site, and keep
            lineups tight enough that the crowd can actually move.
          </p>
        </div>
        <div className="mt-[18px] flex flex-col gap-[14px] md:col-span-6 md:col-start-7 md:mt-0 md:gap-5">
          <Reveal className={h2}>What we will not do</Reveal>
          <p className="max-w-[65ch]">
            We don&apos;t sell hierarchy at the door. No VIP tables, no bottle-service tiers, no second-class access to the room you already paid for. One ticket means one room.
          </p>
          <p className="dim max-w-[65ch]">We don&apos;t pad lineups for reach or take sponsorship that changes how the night runs.</p>
        </div>
        <p className="num mt-[18px] text-[26px] leading-[1.1] md:col-span-12 md:mt-24 md:max-w-[22ch] md:text-[min(5.4vw,78px)] md:leading-[1.02]">
          Underground isn&apos;t an aesthetic. <span className="hot">It&apos;s how people are treated once they&apos;re inside.</span>
        </p>
      </section>

      <section className="wrap flex flex-col gap-[14px] pt-2 md:flex-row md:items-center md:justify-between md:pb-10 md:pt-0">
        <p className="md:num md:text-[28px]">Think you fit the room?</p>
        <Link href="/contact/" data-kick className="cta mono md:w-[360px]">
          Submit your music
          <Arrow />
        </Link>
      </section>
    </div>
  )
}
