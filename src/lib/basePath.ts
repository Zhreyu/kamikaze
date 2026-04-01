// Base path for assets - must match next.config.js basePath
// GitHub Pages (staging) needs /kamikaze prefix, Vercel (prod) is at root
const isVercel = process.env.VERCEL === '1'
export const basePath = process.env.NODE_ENV === 'production' && !isVercel ? '/kamikaze' : ''

export function getAssetPath(path: string): string {
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${basePath}${normalizedPath}`
}
