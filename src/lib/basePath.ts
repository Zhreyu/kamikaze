// Must match next.config.js basePath: '/kamikaze' on GitHub Pages, '' on kamikaze.host.
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

/** Prefix a site path to a file in public/. Not idempotent and not for absolute URLs: use mediaUrl() for content that may be either. */
export function getAssetPath(path: string): string {
  return `${basePath}${path.startsWith('/') ? path : `/${path}`}`
}
