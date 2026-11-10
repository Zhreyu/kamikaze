import { getAssetPath } from '@/lib/basePath'

// Everything the admin (/kaizen/) can change. These are the built-in defaults; src/lib/content.ts merges the saved copy over them.
export type Photo = { id: string; src: string; thumb: string; alt: string; span?: 'big' | 'tall'; grid?: boolean } // src 2000w, thumb 800w
export type Track = { id: string; title: string; note?: string; url: string; cover?: string; artist?: string } // artist = slug
export type Content = {
  photos: Photo[] // OVERRIDE set, in play order
  tracks: Track[]
  slots: { card: string; top: string; about: string } // photo ids: event card (home + events), recap player poster, about page photo
  portraits: Record<string, string> // artist slug -> image URL override
}

const photo = (id: string, alt: string, span?: Photo['span'], grid = true): Photo => ({
  id,
  src: `/events/override/dsc${id}-2000.webp`,
  thumb: `/events/override/dsc${id}-800.webp`,
  alt,
  ...(span && { span }),
  grid,
})

export const defaultContent: Content = {
  photos: [
    // the grid, in canvas order. 08454 is the 12th cell: desktop only (hide it below md).
    photo('09405', 'The full dome seen from behind the DJ booth', 'big'),
    photo('08583', 'A raised fist in silhouette against the stage lights'),
    photo('08616', 'Dancers close up in red light'),
    photo('09996', 'A dancer from behind under a red spotlight', 'tall'),
    photo('09297', 'Hands up in the haze'),
    photo('08194', 'The stage from the floor, beams fanning out'),
    photo('08350', 'Crossed light beams over the crowd', 'big'),
    photo('08700', 'Red beams fanning out from the stage'),
    photo('08141', 'A DJ at the decks in red light', 'tall'),
    photo('09087', 'A dancer in a bandana, in profile'),
    photo('08952', 'A DJ from behind, facing the crowd', 'big'),
    photo('08454', 'The decks in the foreground, the whole crowd beyond'),
    // player only
    photo('08798', 'The stage glowing red at the far end of the room, the crowd in silhouette', undefined, false),
    photo('07969', 'The bright dome with the floor nearly empty, a DJ in silhouette, one arm raised', undefined, false),
    photo('08081', 'A DJ from behind under blue and magenta light, facing the crowd', undefined, false),
    photo('08122', 'A DJ in headphones from behind, the crowd lit red', undefined, false),
    photo('08282', 'Hands on the mixer, close up', undefined, false),
    photo('08324', 'Two people cheek to cheek in red light', undefined, false),
    photo('09057', 'A dancer in dark glasses, in profile, one hand raised in red light', undefined, false),
    photo('09389', 'A DJ in profile at the decks, in black and white', undefined, false),
    photo('09500', "The Kamikaze sigil on the booth's LED wall, red beams above", undefined, false),
    photo('09646', 'A group in silhouette under the lighting truss, the dome overhead, in black and white', undefined, false),
    photo('09710', 'Red beams crossing in an X above the stage, the crowd in silhouette', undefined, false),
    photo('09825', 'A dancer with both hands clasped at the forehead, in red light', undefined, false),
  ],
  tracks: [
    {
      id: 'impact-001',
      title: 'Kamikaze x Ibliiiz: Impact 001',
      note: 'this for the ones who never belonged',
      url: 'https://soundcloud.com/ibliiiz/kamikaze-x-ibliiiz-impact-001',
      cover: '/artists/ibliiiz-impact-001.webp',
      artist: 'ibliiiz',
    },
  ],
  slots: { card: '09405', top: '08454', about: '08952' },
  portraits: {},
}

/** Absolute URLs (admin uploads) pass through; site paths get the base path. Use it for every content image, cover and portrait. */
export const mediaUrl = (src: string) => (/^(https?:|data:|blob:)/.test(src) ? src : getAssetPath(src))

/** The photo a slot points at; falls back to the first photo if the admin removed it. */
export const slotPhoto = (c: Content, slot: keyof Content['slots']) => c.photos.find((p) => p.id === c.slots[slot]) ?? c.photos[0]

/** srcset for a photo: 800w thumb + 2000w full. */
export const photoSrcSet = (p: Photo) => `${mediaUrl(p.thumb)} 800w, ${mediaUrl(p.src)} 2000w`
