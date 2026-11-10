'use client'
import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { defaultContent, type Content } from '@/data/content'
import Images from './Images'
import Passes from './Passes'
import Tracks, { trackTitleError, trackUrlError } from './Tracks'
import type { Db } from './util'

const tabs = ['Passes', 'Tracks', 'Images'] as const
type Tab = (typeof tabs)[number]
const LEAVE = 'You have unsaved changes. Leave anyway?'

// What goes to the database: trimmed, with empty optional fields dropped.
const clean = (c: Content): Content => ({
  ...c,
  tracks: c.tracks.map(({ note, ...t }) => ({ ...t, title: t.title.trim(), url: t.url.trim(), ...(note?.trim() && { note: note.trim() }) })),
  photos: c.photos.map((p) => ({ ...p, alt: p.alt.trim() })),
})

// The first thing that stops a save, and the tab it lives on.
const problem = (c: Content): [Tab, string] | undefined => {
  for (const t of c.tracks) {
    const e = trackTitleError(t) || trackUrlError(t)
    if (e) return ['Tracks', e]
  }
  if (c.photos.some((p) => !p.alt.trim())) return ['Images', 'Add alt text before saving.']
}

/** The signed-in admin: three tabs over one working copy of the site content, saved as a whole. */
export default function Board({ db, initial }: { db: Db; initial: Content }) {
  const [content, setContent] = useState(initial)
  const [saved, setSaved] = useState(() => JSON.stringify(initial))
  const [tab, setTab] = useState<Tab>('Passes')
  const [busy, setBusy] = useState(false)
  const [checked, setChecked] = useState(false) // field errors show after the first save attempt
  const [status, setStatus] = useState<{ text: string; bad?: boolean }>()
  const tablist = useRef<HTMLDivElement>(null)
  const dirty = JSON.stringify(content) !== saved

  const edit = (fn: (c: Content) => Content) => {
    setStatus(undefined)
    setContent(fn)
  }

  useEffect(() => {
    if (!dirty) return
    const unload = (e: BeforeUnloadEvent) => e.preventDefault()
    // ponytail: guards link taps and tab close; the browser back button on a soft navigation is not caught
    const click = (e: MouseEvent) => {
      if ((e.target as Element).closest?.('a[href]') && !confirm(LEAVE)) {
        e.preventDefault()
        e.stopPropagation()
      }
    }
    addEventListener('beforeunload', unload)
    document.addEventListener('click', click, true)
    return () => {
      removeEventListener('beforeunload', unload)
      document.removeEventListener('click', click, true)
    }
  }, [dirty])

  const save = async () => {
    setChecked(true)
    const stop = problem(content)
    if (stop) {
      setTab(stop[0])
      return setStatus({ text: stop[1], bad: true })
    }
    setBusy(true)
    const value = clean(content)
    const { error } = await db.from('site_content').upsert({ key: 'site', value }).then(
      (r) => r,
      () => ({ error: true }),
    )
    setBusy(false)
    if (error) return setStatus({ text: 'Save failed. Your changes are still here. Try again.', bad: true })
    setContent(value)
    setSaved(JSON.stringify(value))
    setChecked(false)
    setStatus({ text: 'Saved' })
  }

  const reset = async () => {
    if (!confirm('Reset to the built-in content? This removes every saved change.')) return
    setBusy(true)
    const { error } = await db.from('site_content').delete().eq('key', 'site').then(
      (r) => r,
      () => ({ error: true }),
    )
    setBusy(false)
    if (error) return setStatus({ text: 'Reset failed. Nothing was changed. Try again.', bad: true })
    setContent(defaultContent)
    setSaved(JSON.stringify(defaultContent))
    setChecked(false)
    setStatus({ text: 'Reset. The site shows the built-in content.' })
  }

  const onKey = (e: KeyboardEvent) => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key]
    if (!step) return
    e.preventDefault()
    const next = tabs[(tabs.indexOf(tab) + step + tabs.length) % tabs.length]
    setTab(next)
    tablist.current?.querySelector<HTMLElement>(`#kz-tab-${next}`)?.focus()
  }

  return (
    <>
      <div ref={tablist} role="tablist" aria-label="Admin sections" className="mt-6 flex border-b border-hair" onKeyDown={onKey}>
        {tabs.map((t) => (
          <button
            key={t}
            id={`kz-tab-${t}`}
            type="button"
            role="tab"
            aria-selected={tab === t}
            aria-controls={`kz-panel-${t}`}
            tabIndex={tab === t ? 0 : -1}
            onClick={() => setTab(t)}
            className={`mono -mb-px min-h-[48px] flex-1 border-b-2 px-4 transition-colors md:flex-none md:px-6 ${tab === t ? 'border-bone text-bone' : 'border-transparent text-dim hover:text-bone'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tabs.map((t) => (
        <div key={t} id={`kz-panel-${t}`} role="tabpanel" aria-labelledby={`kz-tab-${t}`} hidden={tab !== t} className="pb-10 pt-6">
          {t === 'Passes' ? <Passes db={db} /> : t === 'Tracks' ? <Tracks db={db} content={content} edit={edit} checked={checked} /> : <Images db={db} content={content} edit={edit} checked={checked} />}
        </div>
      ))}

      {/* one Save for the whole content object, pinned so it is in reach at any scroll position. Passes has nothing to save, so the bar stays away there unless edits are pending. */}
      <div data-kz-dirty={dirty || undefined} hidden={tab === 'Passes' && !dirty && !status && !busy} className="sticky bottom-0 z-[2] -mx-[var(--gutter)] flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line bg-void [&[hidden]]:hidden px-[var(--gutter)] pb-[calc(12px+env(safe-area-inset-bottom,0px))] pt-3">
        <p role="status" className={`min-w-0 flex-1 basis-full md:basis-0 ${status?.bad ? 'hot' : `mono ${status || dirty ? '' : 'dim'}`}`}>
          {busy ? 'Saving' : (status?.text ?? (dirty ? 'Unsaved changes' : 'No unsaved changes'))}
        </p>
        <button type="button" className="ghost mono whitespace-nowrap px-4" disabled={busy} onClick={reset}>
          Reset to built-in
        </button>
        <button type="button" className="cta mono flex-1 justify-center md:min-w-[180px] md:flex-none" disabled={busy || !dirty} onClick={save}>
          Save
        </button>
      </div>
    </>
  )
}
