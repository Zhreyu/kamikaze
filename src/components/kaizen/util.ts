import type { SupabaseClient } from '@supabase/supabase-js'
import type { Content } from '@/data/content'

export type Db = SupabaseClient
/** What the Tracks and Images tabs get: the working copy and one way to change it. */
export type Editing = { content: Content; edit: (fn: (c: Content) => Content) => void }

export const pad4 = (n: number) => String(n).padStart(4, '0')
export const newId = () => crypto.randomUUID().slice(0, 8)

/** Swap item i with its neighbour (dir -1 up, 1 down). Out of range returns the list unchanged. */
export function move<T>(list: T[], i: number, dir: -1 | 1): T[] {
  const j = i + dir
  if (j < 0 || j >= list.length) return list
  const next = [...list]
  ;[next[i], next[j]] = [next[j], next[i]]
  return next
}

/**
 * RFC 4180 CSV. Email and city are typed by strangers and WhatsApp starts with +, so any cell a spreadsheet
 * would run as a formula (starts with = + - @, or a tab / carriage return that hides one) gets a leading apostrophe.
 */
export function toCsv(rows: (string | number | null | undefined)[][]): string {
  const cell = (v: string | number | null | undefined) => {
    let s = v == null ? '' : String(v)
    if (typeof v === 'string' && /^[=+\-@\t\r]/.test(s)) s = `'${s}`
    return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  return rows.map((r) => r.map(cell).join(',')).join('\r\n')
}

/** Scale an image down to `width` (never up) and encode it as WebP, or JPEG where the browser cannot write WebP. */
export async function resize(file: Blob, width: number): Promise<Blob> {
  const bmp = await createImageBitmap(file)
  const scale = Math.min(1, width / bmp.width)
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bmp.width * scale)
  canvas.height = Math.round(bmp.height * scale)
  canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height)
  bmp.close()
  const encode = (type: string) => new Promise<Blob | null>((done) => canvas.toBlob(done, type, 0.82))
  let blob = await encode('image/webp')
  if (blob?.type !== 'image/webp') blob = await encode('image/jpeg') // older Safari hands back a PNG when asked for WebP
  if (!blob) throw new Error('ENCODE')
  return blob
}

/** Resize, upload to the site-media bucket at `<path>.<webp|jpg>`, return the public URL. The bucket takes images up to 10 MB only, so nothing goes up unresized. */
export async function upload(db: Db, file: Blob, path: string, width: number): Promise<string> {
  const blob = await resize(file, width)
  const full = `${path}.${blob.type === 'image/webp' ? 'webp' : 'jpg'}`
  const bucket = db.storage.from('site-media')
  const { error } = await bucket.upload(full, blob, { contentType: blob.type, cacheControl: '31536000', upsert: true }) // paths carry a random id, so a year of caching is safe
  if (error) throw error
  return bucket.getPublicUrl(full).data.publicUrl
}
