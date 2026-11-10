import { getAssetPath } from '@/lib/basePath'

/** 12 -> '0012' */
export const pad = (n: number) => String(n).padStart(4, '0')

/** A pass number from a `?ref=` value or from storage: digits only, above zero. Anything else is null (the server rejects a non-number). */
export const parseRef = (raw: string | null) => (raw && /^\d{1,9}$/.test(raw) && +raw > 0 ? +raw : null)

/** WhatsApp the way the server reads it: null = nothing given (blank or just a country code), false = wrong, else the cleaned number. */
export function whatsapp(raw: string): string | null | false {
  const v = raw.replace(/[\s().-]/g, '')
  if (v === '' || /^\+\d{0,3}$/.test(v)) return null
  return /^\+[1-9]\d{7,14}$/.test(v) ? v : false
}

/** The pass as a 1080x1920 PNG for an Instagram story: the card from the page, drawn with the page's own fonts. null if the browser cannot make it. */
export async function drawStory(number: number, rite?: string, date?: string): Promise<Blob | null> {
  const css = getComputedStyle(document.documentElement)
  // next/font generates the family names, so read them from the variables it sets
  const monoFace = css.getPropertyValue('--font-mono').trim() || 'monospace'
  const numFace = css.getPropertyValue('--font-archivo').trim() || 'Arial, sans-serif'
  const mono = (px: number) => `500 ${px}px ${monoFace}`
  const num = `900 expanded 112px ${numFace}` // expanded = font-stretch 125%, same as .num
  const sigil = new Image()
  sigil.src = getAssetPath('/logo-sigil.png')
  // a face that fails to load falls back; the image is simply left out
  await Promise.allSettled([document.fonts.load(mono(33), 'A'), document.fonts.load(num, 'SOUL 0'), sigil.decode()])

  const W = 1080, H = 1920
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const c = canvas.getContext('2d')
  if (!c) return null
  const BONE = '#efefef', DIM = 'rgba(239,239,239,.7)', HOT = '#ff3b30'
  const text = (s: string, x: number, y: number, font: string, colour: string, align: CanvasTextAlign = 'left', spacing = 0) => {
    c.font = font
    c.fillStyle = colour
    c.textAlign = align
    if ('letterSpacing' in c) c.letterSpacing = `${spacing}px` // older Safari: no tracking, everything else the same
    c.fillText(s.toUpperCase(), x, y)
  }

  c.fillStyle = '#0a0a0a'
  c.fillRect(0, 0, W, H)

  // the card: 300x466 on the page, scaled 2.76x, with the same two cut corners
  const x = 126, y = 250, w = 828, h = 1288, cut = 66, p = 56
  c.beginPath()
  c.moveTo(x, y)
  c.lineTo(x + w - cut, y)
  c.lineTo(x + w, y + cut)
  c.lineTo(x + w, y + h)
  c.lineTo(x + cut, y + h)
  c.lineTo(x, y + h - cut)
  c.closePath()
  c.save()
  c.shadowColor = 'rgba(204,0,0,.5)'
  c.shadowBlur = 140
  c.shadowOffsetY = 50
  c.fillStyle = '#160606'
  c.fill()
  c.restore()
  c.lineWidth = 3
  c.strokeStyle = HOT
  c.stroke()

  text('Kamikaze', x + p, y + p + 28, mono(33), BONE, 'left', 2.6)
  if (rite) text(rite, x + w - p, y + p + 28, mono(33), HOT, 'right', 2.6)
  if (sigil.naturalWidth) c.drawImage(sigil, W / 2 - 290, 470, 580, 580)
  text('Soul', x + p, 1246, num, BONE, 'left', -1)
  text(pad(number), x + p, 1352, num, HOT, 'left', -1)
  text('One soul. One ticket. One room.', x + p, date ? 1424 : 1474, mono(33), BONE, 'left', 2.6)
  if (date) text(date, x + p, 1474, mono(33), DIM, 'left', 2.6)
  text('Venue drops to the list first. @kamikaze.intl', W / 2, 1640, mono(28), DIM, 'center', 2.2)

  return new Promise((done) => canvas.toBlob(done, 'image/png'))
}
