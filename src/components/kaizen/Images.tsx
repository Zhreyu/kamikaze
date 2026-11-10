'use client'
import { useState } from 'react'
import { artists } from '@/data/artists'
import { mediaUrl, type Content, type Photo } from '@/data/content'
import { Field, FileButton, RowActions } from './ui'
import { move, newId, upload, type Db, type Editing } from './util'

const slots: [keyof Content['slots'], string][] = [
  ['card', 'Event card photo'],
  ['top', 'Recap poster'],
  ['about', 'About page photo'],
]
const h2 = 'num text-[22px]'

export default function Images({ db, content, edit, checked }: Editing & { db: Db; checked: boolean }) {
  const [progress, setProgress] = useState<{ i: number; total: number }>()
  const [failed, setFailed] = useState<{ where: 'photos' | 'portraits'; names: string[] }>({ where: 'photos', names: [] })
  const [portraitBusy, setPortraitBusy] = useState<string>()
  const set = (id: string, patch: Partial<Photo>) => edit((c) => ({ ...c, photos: c.photos.map((p) => (p.id === id ? { ...p, ...patch } : p)) }))

  const addPhotos = async (files: File[]) => {
    setFailed({ where: 'photos', names: [] })
    for (const [n, file] of files.entries()) {
      setProgress({ i: n + 1, total: files.length })
      const id = newId()
      try {
        const [src, thumb] = await Promise.all([upload(db, file, `photos/${id}-2000`, 2000), upload(db, file, `photos/${id}-800`, 800)])
        edit((c) => ({ ...c, photos: [...c.photos, { id, src, thumb, alt: '', grid: true }] }))
      } catch {
        setFailed((f) => ({ ...f, names: [...f.names, file.name] }))
      }
    }
    setProgress(undefined)
  }

  const replacePortrait = async (slug: string, file: File) => {
    setFailed({ where: 'portraits', names: [] })
    setPortraitBusy(slug)
    try {
      const url = await upload(db, file, `portraits/${slug}-${newId()}`, 1600)
      edit((c) => ({ ...c, portraits: { ...c.portraits, [slug]: url } }))
    } catch {
      setFailed({ where: 'portraits', names: [file.name] })
    }
    setPortraitBusy(undefined)
  }

  const errors = (where: typeof failed.where) =>
    failed.where === where &&
    failed.names.map((name) => (
      <p key={name} role="alert" className="hot mt-2">
        Upload failed: {name}. Try again.
      </p>
    ))

  return (
    <div className="grid gap-12">
      <section aria-labelledby="kz-photos">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="kz-photos" className={h2}>
            Photos
          </h2>
          <div className="flex items-center gap-3">
            <span role="status" className="mono dim">
              {progress && `Uploading ${progress.i} of ${progress.total}`}
            </span>
            <FileButton label="Upload photos" multiple disabled={!!progress} onFiles={addPhotos} />
          </div>
        </div>
        {errors('photos')}
        {/* ponytail: removing a photo here leaves its files in the bucket; add a storage sweep if the bucket ever fills up */}
        {!content.photos.length && <p className="dim mt-4 border-t border-hair py-5">No photos. Upload some.</p>}
        <ol className="mt-4">
          {content.photos.map((p, i) => (
            <li key={p.id} className="grid grid-cols-[88px_minmax(0,1fr)] items-end gap-x-4 gap-y-3 border-t border-hair py-4 last:border-b md:grid-cols-[104px_minmax(0,1fr)_auto_auto]">
              {/* phone: thumb + actions, then alt text full width, then size and grid. md: one line. */}
              <img src={mediaUrl(p.thumb)} alt="" loading="lazy" decoding="async" className="aspect-[4/3] w-full bg-black object-cover" />
              <Field label="Alt text" wrap="max-md:col-span-2 max-md:row-start-2" value={p.alt} error={checked && !p.alt.trim() && 'Add alt text before saving.'} onChange={(e) => set(p.id, { alt: e.target.value })} />
              <div className="flex items-end gap-x-4 max-md:col-span-2 max-md:row-start-3">
                <Field label="Size" wrap="w-[124px]" value={p.span ?? ''} onChange={(e) => set(p.id, { span: (e.target.value || undefined) as Photo['span'] })}>
                  <option value="">Normal</option>
                  <option value="big">Big</option>
                  <option value="tall">Tall</option>
                </Field>
                <label className="flex min-h-[54px] cursor-pointer items-center gap-2 whitespace-nowrap">
                  <input type="checkbox" className="h-5 w-5 accent-[#cc0000]" checked={p.grid !== false} onChange={(e) => set(p.id, { grid: e.target.checked })} />
                  Show in grid
                </label>
              </div>
              <div className="flex items-center max-md:col-start-2 max-md:row-start-1 max-md:justify-self-end md:min-h-[54px]">
                  <RowActions
                    what={p.alt || `photo ${i + 1}`}
                    first={i === 0}
                    last={i === content.photos.length - 1}
                    removeLabel="Delete"
                    onMove={(dir) => edit((c) => ({ ...c, photos: move(c.photos, i, dir) }))}
                    onRemove={() => edit((c) => ({ ...c, photos: c.photos.filter((x) => x.id !== p.id) }))}
                  />
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="kz-slots">
        <h2 id="kz-slots" className={h2}>
          Slots
        </h2>
        <div className="mt-4 grid gap-5 md:grid-cols-3">
          {slots.map(([key, label]) => {
            const current = content.photos.find((p) => p.id === content.slots[key])
            return (
              <div key={key} className="grid grid-cols-[88px_minmax(0,1fr)] items-end gap-3">
                {current ? <img src={mediaUrl(current.thumb)} alt="" loading="lazy" decoding="async" className="aspect-[4/3] w-full bg-black object-cover" /> : <span className="aspect-[4/3] border border-hair" />}
                <Field label={label} value={current ? current.id : ''} onChange={(e) => edit((c) => ({ ...c, slots: { ...c.slots, [key]: e.target.value } }))}>
                  {/* a slot whose photo was deleted falls back to the first photo on the site */}
                  {!current && <option value="">{content.photos.length ? 'First photo' : 'No photos'}</option>}
                  {content.photos.map((p, i) => (
                    <option key={p.id} value={p.id}>
                      {String(i + 1).padStart(2, '0')} {p.alt || p.id}
                    </option>
                  ))}
                </Field>
              </div>
            )
          })}
        </div>
      </section>

      <section aria-labelledby="kz-portraits">
        <h2 id="kz-portraits" className={h2}>
          Artist portraits
        </h2>
        {errors('portraits')}
        <ul className="mt-4 grid max-w-[920px] grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-4 md:gap-x-5">
          {artists.map((a) => (
            <li key={a.slug}>
              <img src={mediaUrl(content.portraits[a.slug] ?? a.photo)} alt="" loading="lazy" decoding="async" className="aspect-[3/4] w-full bg-black object-cover" style={{ objectPosition: a.focus }} />
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="mono min-w-0 truncate">{a.styled}</span>
                <FileButton label={portraitBusy === a.slug ? 'Uploading 1 of 1' : 'Replace'} disabled={!!portraitBusy} onFiles={(f) => replacePortrait(a.slug, f[0])} />
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
