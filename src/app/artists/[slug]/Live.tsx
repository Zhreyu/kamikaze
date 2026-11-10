'use client'
import { portraitSrcSet, type Artist } from '@/data/artists'
import { mediaUrl } from '@/data/content'
import Arrow from '@/components/Arrow'
import { useContent } from '@/lib/content'

// The two parts of a profile the admin can change: the portrait and the artist's tracks.

export function Portrait({ artist }: { artist: Artist }) {
  const src = useContent().portraits[artist.slug] ?? artist.photo
  return (
    <img
      src={mediaUrl(src)}
      srcSet={portraitSrcSet(src)}
      sizes="(min-width: 900px) 520px, 100vw"
      alt={artist.styled}
      fetchPriority="high"
      decoding="async"
      className="cover"
      style={{ objectPosition: artist.focus }}
    />
  )
}

export function Mix({ slug }: { slug: string }) {
  const tracks = useContent().tracks.filter((t) => t.artist === slug)
  if (!tracks.length) return null
  return (
    <section className="flex flex-col gap-5 pb-7 md:pb-10">
      <h2 className="mono hot">{tracks.length > 1 ? 'Mixes' : 'The mix'}</h2>
      {tracks.map((t) => (
        <div key={t.id} className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            {t.cover && (
              <img
                src={mediaUrl(t.cover)}
                alt={`Cover art for ${t.title}`}
                width={112}
                height={112}
                loading="lazy"
                decoding="async"
                className="size-[112px] flex-none border border-hair object-cover md:size-[140px]"
              />
            )}
            <div className="flex min-w-0 flex-col gap-2">
              <h3 className="num text-[20px] [overflow-wrap:anywhere] md:text-[24px]">{t.title}</h3>
              {t.note && <p className="dim">{t.note}</p>}
            </div>
          </div>
          <a className="ghost mono md:self-start" href={t.url} target="_blank" rel="noopener noreferrer">
            Play on SoundCloud
            <Arrow />
          </a>
        </div>
      ))}
    </section>
  )
}
