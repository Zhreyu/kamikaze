'use client'
import Link from 'next/link'
import Arrow from '@/components/Arrow'
import { getArtist } from '@/data/artists'
import { mediaUrl, photoSrcSet } from '@/data/content'
import { fmtDate, riteLabel, type Event } from '@/data/events'
import { useContent } from '@/lib/content'

/** Events page, md+: a finished event told the wide way. Story and who played on the left, the photo grid on the right; the grid is one link into the recap. */
export default function PastWide({ event }: { event: Event }) {
  const photos = useContent().photos.filter((p) => p.grid)
  const recap = `/events/${event.slug}/`
  return (
    <div className="hidden flex-wrap items-start gap-x-14 gap-y-10 md:flex">
      <div className="flex max-w-[480px] flex-[1_1_380px] flex-col gap-[18px]">
        {/* the canvas 116px runs under the photos; this size keeps the whole word inside the column */}
        <h3 className="rit text-[min(6.4vw,92px)]">{event.name}</h3>
        <p className="mono">
          <span className="hot">{riteLabel(event)}</span> / {fmtDate(event.date)}
          {event.city && ` / ${event.city}`}
        </p>
        {event.recap && (
          <>
            <p className="num mt-4 text-[64px]">
              {event.recap.line}
              <br />
              <span className="hot">{event.recap.lineHot}</span>
            </p>
            <p>{event.recap.story}</p>
            <p className="mono dim">Kamikaze</p>
          </>
        )}
        <div className="mt-5 flex flex-col">
          {event.lineup?.map((slug, i, all) => (
            <Link key={slug} href={`/artists/${slug}/`} className={`rowlink rit group min-h-[58px] text-[40px] ${i === all.length - 1 ? 'border-b border-hair' : ''}`}>
              {getArtist(slug)?.name ?? slug}
              <Arrow className="transition-transform duration-300 ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
        <Link href={recap} className="ghost mono mt-2 self-start">
          See the recap
          <Arrow />
        </Link>
      </div>
      <Link href={recap} aria-label={`${event.name} photos: see the recap`} className="photo-grid group min-w-0 flex-[999_1_560px] auto-rows-[190px] grid-cols-3">
        {photos.map((p) => (
          <span key={p.id} className={p.span}>
            <img
              src={mediaUrl(p.thumb)}
              srcSet={photoSrcSet(p)}
              sizes={p.span === 'big' ? '42vw' : '21vw'}
              alt={p.alt}
              loading="lazy"
              decoding="async"
              className="cover transition-opacity duration-300 group-hover:opacity-80"
            />
          </span>
        ))}
      </Link>
    </div>
  )
}
