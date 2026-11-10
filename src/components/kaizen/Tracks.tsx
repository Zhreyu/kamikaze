'use client'
import { useState } from 'react'
import { artists } from '@/data/artists'
import { mediaUrl, type Track } from '@/data/content'
import { Field, FileButton, RowActions } from './ui'
import { move, newId, upload, type Db, type Editing } from './util'

export const trackTitleError = (t: Track) => !t.title.trim() && 'A track needs a title.'
export const trackUrlError = (t: Track) => !/^https:\/\/\S+$/.test(t.url.trim()) && 'A track needs a URL that starts with https.'

export default function Tracks({ db, content, edit, checked }: Editing & { db: Db; checked: boolean }) {
  const [busy, setBusy] = useState<string>() // id of the track whose cover is uploading
  const [failed, setFailed] = useState<{ id: string; file: string }>()
  const set = (id: string, patch: Partial<Track>) => edit((c) => ({ ...c, tracks: c.tracks.map((t) => (t.id === id ? { ...t, ...patch } : t)) }))

  const cover = async (id: string, file: File) => {
    setBusy(id)
    setFailed(undefined)
    try {
      set(id, { cover: await upload(db, file, `covers/${newId()}`, 800) })
    } catch {
      setFailed({ id, file: file.name })
    }
    setBusy(undefined)
  }

  return (
    <div className="max-w-[920px]">
      {!content.tracks.length && <p className="dim border-t border-hair py-5">No tracks. Add one.</p>}
      <ol>
        {content.tracks.map((t, i) => (
          <li key={t.id} className="border-t border-hair py-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="mono">Track {String(i + 1).padStart(2, '0')}</h2>
              <RowActions
                what={t.title || `track ${i + 1}`}
                first={i === 0}
                last={i === content.tracks.length - 1}
                removeLabel="Remove"
                onMove={(dir) => edit((c) => ({ ...c, tracks: move(c.tracks, i, dir) }))}
                onRemove={() => edit((c) => ({ ...c, tracks: c.tracks.filter((x) => x.id !== t.id) }))}
              />
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field label="Title" value={t.title} error={checked && trackTitleError(t)} onChange={(e) => set(t.id, { title: e.target.value })} />
              <Field label="Note" value={t.note ?? ''} onChange={(e) => set(t.id, { note: e.target.value })} />
              <Field label="URL" type="url" inputMode="url" autoComplete="off" autoCapitalize="none" spellCheck={false} value={t.url} error={checked && trackUrlError(t)} onChange={(e) => set(t.id, { url: e.target.value })} />
              <Field label="Artist" value={t.artist ?? ''} onChange={(e) => set(t.id, { artist: e.target.value || undefined })}>
                <option value="">No artist</option>
                {artists.map((a) => (
                  <option key={a.slug} value={a.slug}>
                    {a.styled}
                  </option>
                ))}
              </Field>
            </div>
            <div className="mt-4">
              <p className="mono dim mb-1.5">Cover image</p>
              <div className="flex items-center gap-3">
                {t.cover && <img src={mediaUrl(t.cover)} alt="" width={72} height={72} loading="lazy" decoding="async" className="h-[72px] w-[72px] flex-none bg-black object-cover" />}
                <FileButton label={t.cover ? 'Replace cover' : 'Upload cover'} disabled={busy === t.id} onFiles={(f) => cover(t.id, f[0])} />
                <span role="status" className="mono dim">
                  {busy === t.id && 'Uploading 1 of 1'}
                </span>
              </div>
              {failed?.id === t.id && (
                <p role="alert" className="hot mt-2">
                  Upload failed: {failed.file}. Try again.
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
      <button type="button" className="ghost mono mt-2 w-full md:w-auto" onClick={() => edit((c) => ({ ...c, tracks: [...c.tracks, { id: newId(), title: '', url: '' }] }))}>
        Add track
      </button>
    </div>
  )
}
