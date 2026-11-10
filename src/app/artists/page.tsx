import type { Metadata } from 'next'
import Link from 'next/link'
import Arrow from '@/components/Arrow'
import ArtistTile from '@/components/ArtistTile'
import { artists } from '@/data/artists'

export const metadata: Metadata = {
  title: 'Artists',
  description: "SIREN, IBLIIIZ, AN'SHE and JUNVON played the first Kamikaze room. We book on merit and take demos through the site.",
  alternates: { canonical: '/artists/' },
}

export default function Artists() {
  return (
    <div data-sigil="off" className="wrap">
      <header className="flex flex-col gap-3 pb-6 pt-4 md:flex-row md:items-end md:justify-between md:gap-10 md:pb-10 md:pt-12">
        <h1 className="rit text-[min(19vw,80px)] md:text-[min(11vw,160px)]">Artists</h1>
        <p className="dim md:pb-2 md:text-right">Everyone who has played a Kamikaze room.</p>
      </header>
      <ul className="grid grid-cols-2 gap-[10px] md:grid-cols-4 md:gap-4">
        {artists.map((a) => (
          <li key={a.slug}>
            {/* all four sit in the first viewport at both widths */}
            <ArtistTile artist={a} variant="grid" eager />
          </li>
        ))}
      </ul>
      <div className="pt-7 md:pt-12">
        <Link href="/contact/" className="rowlink group min-h-[60px] border-b border-hair transition-opacity active:opacity-60">
          Want to play the next one? Send a demo
          <Arrow className="transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  )
}
