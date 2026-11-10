import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Arrow from '@/components/Arrow'
import { artists, getArtist } from '@/data/artists'
import { events, fmtDate } from '@/data/events'
import { Mix, Portrait } from './Live'

type Props = { params: Promise<{ slug: string }> }

export const generateStaticParams = () => artists.map((a) => ({ slug: a.slug }))

// Search and share descriptions (copy deck). The "Played" part is built from the event data.
const about: Record<string, [lead: string, tail: string]> = {
  siren: ['SIREN333. Hard groove and techno, from India, now based in Belgium.', ', {city}.'],
  ibliiiz: ['IBLIIIZ is the Kamikaze resident. Hard techno and schranz, built on speed.', '. Hear the mix, Impact 001.'],
  anshe: ["AN'SHE plays hard techno with acid edges and industrial weight. From India.", ', {city}.'],
  junvon: ['JUNVON plays hypnotic, peak-time techno out of Trivandrum.', ', in his own city.'],
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const artist = getArtist((await params).slug)
  if (!artist) return {}
  const played = events.find((e) => e.recap && e.lineup?.includes(artist.slug))
  const [lead, tail] = about[artist.slug] ?? [`${artist.styled}. ${artist.genre}.`, '.']
  return {
    title: artist.name.toUpperCase(),
    description: played ? `${lead} Played ${played.name}, ${fmtDate(played.date)}${tail.replace('{city}', played.city ?? '')}` : lead,
    alternates: { canonical: `/artists/${artist.slug}/` },
  }
}

// Phone size for the name: the vw value at which it spans the content width (89.7vw at 390px).
// ponytail: estimated from letter count (i and l are about half as wide in the display face), not measured; measure with canvas if a name ever clips
const fit = (name: string) => `${(89.7 / [...name].reduce((em, c) => em + (/[il]/i.test(c) ? 0.37 : 0.75), 0)).toFixed(1)}vw`
const row = 'rowlink group transition-opacity active:opacity-60'
const arrow = <Arrow className="transition-transform duration-300 group-hover:translate-x-1" />

export default async function ArtistPage({ params }: Props) {
  const artist = getArtist((await params).slug)
  if (!artist) notFound()
  const next = artists[(artists.indexOf(artist) + 1) % artists.length]
  const played = events.filter((e) => e.name && e.lineup?.includes(artist.slug))
  const links = [
    ['Instagram', artist.instagram],
    ['SoundCloud', artist.soundcloud],
  ].filter((l): l is [string, string] => !!l[1])
  return (
    // phone: full-bleed portrait with the name over its scrim. md+: portrait (sticky) beside the name and text.
    <article
      data-sigil="off"
      className="relative md:grid md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:grid-rows-[auto_1fr] md:gap-x-[clamp(40px,6vw,96px)] md:px-[var(--gutter)] md:pt-12"
    >
      {/* capped at 520px: the smallest portrait file is 723px wide and must not be blown up */}
      <div className="relative h-[460px] overflow-hidden bg-black md:sticky md:top-[calc(var(--nav-h)+24px)] md:row-span-2 md:aspect-[4/5] md:h-auto md:max-h-[calc(100svh-var(--nav-h)-48px)] md:w-full md:max-w-[520px] md:self-start md:border md:border-hair">
        <Portrait artist={artist} />
        <span className="scrim md:hidden" />
      </div>
      {/* --fit keeps the whole name inside the gutters on a phone, whatever its length. The J in this face hangs 0.3em left of its origin: push it back on screen. */}
      <h1
        className={`rit absolute left-5 top-[442px] -translate-y-full whitespace-nowrap text-[min(var(--fit),104px)] md:static md:translate-y-0 md:pb-10 md:text-[min(11vw,160px)] ${/^j/i.test(artist.name) ? 'ml-[0.3em] md:ml-0' : ''}`}
        style={{ '--fit': fit(artist.name) } as React.CSSProperties}
      >
        {artist.name}
      </h1>
      <div className="px-5 pt-5 md:px-0 md:pt-0">
        <dl className="mb-[22px] flex flex-col md:mb-8">
          <div className="rowlink justify-start">
            <dt className="mono dim w-[84px] flex-none">Origin</dt>
            <dd className="mono">{artist.origin}</dd>
          </div>
          <div className="rowlink justify-start border-b border-hair">
            <dt className="mono dim w-[84px] flex-none">Genre</dt>
            <dd className="mono">{artist.genre}</dd>
          </div>
        </dl>
        <div className="flex max-w-[65ch] flex-col gap-[14px] pb-6 md:pb-8">
          {artist.bio.map((p, i) => (
            <p key={i} className={i ? 'dim' : undefined}>
              {p}
            </p>
          ))}
        </div>
        {links.length > 0 && (
          <ul className="flex flex-col border-b border-hair">
            {links.map(([label, href]) => (
              <li key={label}>
                <a className={row} href={href} target="_blank" rel="noopener noreferrer">
                  {label}
                  {arrow}
                </a>
              </li>
            ))}
          </ul>
        )}
        <div className="pt-6 md:pt-10">
          <Mix slug={artist.slug} />
          {played.length > 0 && (
            <section>
              <h2 className="mono hot mb-3">Played</h2>
              <ul>
                {played.map((e) => {
                  const inner = (
                    <>
                      <span className="rit text-[34px]">{e.name}</span>
                      <span className="mono dim text-right">{fmtDate(e.date)}</span>
                    </>
                  )
                  return (
                    <li key={e.slug}>
                      {e.recap ? (
                        <Link href={`/events/${e.slug}/`} className={`${row} min-h-[64px]`}>
                          {inner}
                        </Link>
                      ) : (
                        <div className="rowlink min-h-[64px]">{inner}</div>
                      )}
                    </li>
                  )
                })}
              </ul>
            </section>
          )}
          <Link href={`/artists/${next.slug}/`} className={`${row} mono min-h-[60px] border-b border-hair`}>
            Next artist: {next.name}
            {arrow}
          </Link>
        </div>
      </div>
    </article>
  )
}
