import type { MetadataRoute } from 'next'
import { artists } from '@/data/artists'
import { events } from '@/data/events'
import { DEPLOY_URL } from '@/lib/site'

export const dynamic = 'force-static'

// Every public route. The admin is left out on purpose.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    '/',
    '/events/',
    ...events.filter((e) => e.recap).map((e) => `/events/${e.slug}/`),
    '/artists/',
    ...artists.map((a) => `/artists/${a.slug}/`),
    '/about/',
    '/pass/',
    '/contact/',
    '/privacy/',
  ].map((path) => ({ url: DEPLOY_URL + path }))
}
