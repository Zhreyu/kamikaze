import { mediaUrl } from '@/data/content'

export type Artist = {
  slug: string
  name: string // Title case; CSS uppercases display type
  styled: string // as the artist writes it: running text and the portrait alt
  photo: string // the 1600w portrait; an 800w file sits beside it (see portraitSrcSet)
  focus?: string // CSS object-position
  origin: string // profile + home rows
  tag: string // artists grid tile
  genre: string
  bio: string[] // paragraphs
  instagram?: string
  soundcloud?: string
}

// Everyone who has played a Kamikaze room, in billing order. Real bookings only: no placeholders.
export const artists: Artist[] = [
  {
    slug: 'siren',
    name: 'Siren',
    styled: 'SIREN',
    photo: '/artists/siren-1600.webp',
    focus: 'center 18%',
    origin: 'India to Belgium',
    tag: 'Belgium',
    genre: 'Hard groove / techno',
    bio: [
      'SIREN333 is a rising force in the global hard-groove wave, originally from India, now based in Belgium. Fast, percussive techno with a hypnotic low-end signature: tension, release, and zero soft exits.',
      'She has shared decks with names like Charlotte de Witte, Ben Klock, Indira Paganotto and Lily Palmer, hitting stages including Awakenings, Decibel Outdoor and DGTL India, with sets broadcast on HÖR Berlin and Rinse FM. Releases include the Throttle and Error EPs.',
    ],
    instagram: 'https://instagram.com/siren333_',
    soundcloud: 'https://soundcloud.com/siren333-music',
  },
  {
    slug: 'ibliiiz',
    name: 'Ibliiiz',
    styled: 'IBLIIIZ',
    photo: '/artists/ibliiiz-1600.webp',
    origin: 'Kamikaze resident',
    tag: 'Resident',
    genre: 'Hard techno / schranz',
    bio: [
      'IBLIIIZ is our resident, playing hard techno and schranz. The sound keeps changing. The speed does not.',
      'They have been immersed in sound at every stage of life. Every selection is picked with care and played without letting up. It is the pace we mean when we say Kamikaze. Their mix for us is Impact 001.',
    ],
    instagram: 'https://instagram.com/ibliiiz',
    soundcloud: 'https://soundcloud.com/ibliiiz',
  },
  {
    slug: 'anshe',
    name: 'Anshe',
    styled: "AN'SHE",
    photo: '/artists/anshe-1600.webp',
    focus: 'center 30%',
    origin: 'India',
    tag: 'India',
    genre: 'Hard techno',
    bio: [
      "AN'SHE plays hard techno built for peak pressure. Precise and unsentimental, locked to the floor.",
      'Her sets favour relentless pacing over soft landings. Acid edges and industrial weight, with selections that keep bodies committed past the point of polite exit.',
    ],
    instagram: 'https://instagram.com/anshemusic',
    soundcloud: 'https://soundcloud.com/anshemusic',
  },
  {
    slug: 'junvon',
    name: 'Junvon',
    styled: 'JUNVON',
    photo: '/artists/junvon-1600.webp',
    focus: 'center 25%',
    origin: 'Trivandrum',
    tag: 'Trivandrum',
    genre: 'Peak-time techno',
    bio: [
      'JUNVON plays hypnotic, peak-time techno out of Trivandrum. OVERRIDE was in his own city.',
      'He reads the room: every shift in energy, and the moment to take control. Deep grooves and driving rhythms, with selections timed to catch a crowd off guard.',
    ],
    instagram: 'https://www.instagram.com/junvon_/',
  },
]

export const getArtist = (slug: string) => artists.find((a) => a.slug === slug)

/** srcset for a built-in portrait ('/artists/<slug>-1600.webp' has an -800 sibling). undefined for anything else: an admin upload is one file. */
export const portraitSrcSet = (src: string) =>
  /^\/artists\/[\w-]+-1600\.webp$/.test(src) ? `${mediaUrl(src.replace('-1600.', '-800.'))} 800w, ${mediaUrl(src)} 1600w` : undefined
