'use client'
import { defaultContent, mediaUrl, photoSrcSet, slotPhoto } from '@/data/content'
import { useContent } from '@/lib/content'

/** The admin's `about` slot photo. Client-side only because the slot can be changed from /kaizen/. */
export default function AboutPhoto({ className = '' }: { className?: string }) {
  const content = useContent()
  const photo = slotPhoto(content, 'about')
  // the approved alt names the event; it is only true while the built-in photo is in the slot
  const alt = photo.id === defaultContent.slots.about ? 'A DJ from behind, facing the OVERRIDE crowd' : photo.alt
  return (
    <img
      src={mediaUrl(photo.thumb)}
      srcSet={photoSrcSet(photo)}
      sizes="(min-width: 900px) 58vw, 100vw"
      alt={alt}
      decoding="async"
      className={`cover bg-black ${className}`}
    />
  )
}
