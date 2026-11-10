import { basePath } from '@/lib/basePath'

export const SITE_URL = 'https://www.kamikaze.host'
export const INSTAGRAM = 'https://instagram.com/kamikaze.intl'
export const SOUNDCLOUD = 'https://soundcloud.com/k-a-m-i-k-a-z-e-6-6-6'
export const EMAIL = 'contact@kamikaze.host'

/** Where this build is actually served: GitHub Pages when built with a base path, production otherwise.
 *  Canonical, sitemap and share-image URLs resolve against it, so each host points at files it really has. */
export const DEPLOY_URL = basePath ? `https://zhreyu.github.io${basePath}` : SITE_URL
