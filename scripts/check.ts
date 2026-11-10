// One runnable check for the shared logic: bun scripts/check.ts
import assert from 'node:assert/strict'
import { defaultContent, mediaUrl } from '@/data/content'
import { events, fmtDate, isPast, riteLabel, startsAt } from '@/data/events'
import { basePath } from '@/lib/basePath'

const at = (iso: string) => Date.parse(iso)
const [rite002, override] = events

assert.equal(fmtDate('2026-12-31'), 'Thu 31 Dec 2026')
assert.equal(fmtDate('2026-09-05'), 'Sat 05 Sep 2026')
assert.equal(riteLabel(rite002), 'Rite 002')
assert.equal(riteLabel(override), 'Rite 001')

// past or upcoming is computed from the date, in India time
assert.equal(isPast(override, at('2026-11-10T12:00:00+05:30')), true)
assert.equal(isPast(rite002, at('2026-11-10T12:00:00+05:30')), false)
assert.equal(isPast(rite002, at('2026-12-31T23:00:00+05:30')), false) // still the night itself
assert.equal(isPast(rite002, at('2027-01-01T00:00:00+05:30')), true)
assert.equal(startsAt(rite002), at('2026-12-30T18:30:00Z'))

// absolute URLs pass through, site paths get the base path
assert.equal(mediaUrl('https://x.supabase.co/storage/v1/object/public/site-media/photos/a.webp'), 'https://x.supabase.co/storage/v1/object/public/site-media/photos/a.webp')
assert.equal(mediaUrl('/artists/siren-1600.webp'), `${basePath}/artists/siren-1600.webp`)

// content defaults hang together: 24 photos, 12 in the grid, every slot points at a real photo
assert.equal(defaultContent.photos.length, 24)
assert.equal(defaultContent.photos.filter((p) => p.grid).length, 12)
for (const id of Object.values(defaultContent.slots)) assert.ok(defaultContent.photos.some((p) => p.id === id), `slot photo ${id} missing`)

console.log('check: ok')
