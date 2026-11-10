'use client'
import Link from 'next/link'
import { portraitSrcSet, type Artist } from '@/data/artists'
import { mediaUrl } from '@/data/content'
import { useContent } from '@/lib/content'

/**
 * Portrait link to an artist page: photo, scrim, name, one mono line.
 * `grid`: the artists page (250px tall on phone, 3:4 from md), line = short tag.
 * `carousel`: the home strip (280x370, never shrinks), line = genre.
 * `eager` for tiles in the first viewport; the rest load lazily.
 */
export default function ArtistTile({ artist, variant, eager = false, className = '' }: { artist: Artist; variant: 'grid' | 'carousel'; eager?: boolean; className?: string }) {
  const src = useContent().portraits[artist.slug] ?? artist.photo
  const grid = variant === 'grid'
  return (
    <Link
      href={`/artists/${artist.slug}/`}
      className={`group relative block overflow-hidden border border-hair bg-black ${grid ? 'h-[250px] md:aspect-[3/4] md:h-auto' : 'h-[370px] w-[280px] flex-none'} ${className}`}
    >
      <img
        src={mediaUrl(src)}
        srcSet={portraitSrcSet(src)}
        sizes={grid ? '(min-width: 900px) 25vw, 50vw' : '280px'}
        alt={artist.styled}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        className="cover transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.04]"
        style={{ objectPosition: artist.focus }}
      />
      <span className="scrim" />
      <span className={`rit absolute ${grid ? 'bottom-9 left-3 text-[38px] md:left-4 md:text-[min(3.6vw,52px)]' : 'bottom-11 left-[14px] text-[64px]'}`}>{artist.name}</span>
      <span className={`mono absolute ${grid ? 'bottom-3 left-3 md:left-4' : 'bottom-4 left-[14px]'}`}>{grid ? artist.tag : artist.genre}</span>
    </Link>
  )
}
