import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { artists, getArtist } from '@/data/artists'
import { events, fmtDate } from '@/data/events'

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

export default async function ArtistPage({ params }: Props) {
  const artist = getArtist((await params).slug)
  if (!artist) notFound()
  return (
    <div className="wrap">
      <h1 className="rit">{artist.name}</h1>
    </div>
  )
}
