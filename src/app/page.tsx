import type { Metadata } from 'next'
import { fmtDate, nextEvent, riteLabel } from '@/data/events'

export const metadata: Metadata = { alternates: { canonical: '/' } }

// Placeholder: the home agent replaces this. It shows the three type voices of the hero so the fonts can be checked.
export default function Home() {
  const next = nextEvent()
  return (
    <div data-sigil="hero" className="wrap flex min-h-[calc(100svh-var(--nav-h))] flex-col justify-between pb-7">
      <div>
        <h1 className="rit mt-2 whitespace-nowrap text-center text-[60px] md:text-[min(15.5vw,240px)]">Kamikaze</h1>
        <p className="mono mx-auto mt-[14px] table bg-void/75 px-[10px] py-1 tracking-[.3em]">The room is the headliner</p>
      </div>
      {next && (
        <div>
          <p className="num hot text-[38px] md:text-[64px]">{fmtDate(next.date)}</p>
          <p className="mono mt-2">{riteLabel(next)} / sealed</p>
        </div>
      )}
    </div>
  )
}
