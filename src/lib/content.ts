'use client'
import { useEffect, useState } from 'react'
import { defaultContent, type Content } from '@/data/content'
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/supabase'

let remote: Promise<Content> | undefined // one fetch per page load, shared by every component

// The saved row comes over the network: take a key only when it has the right shape, otherwise keep the default.
const merge = (v?: Partial<Content> | null): Content => ({
  photos: Array.isArray(v?.photos) && v.photos.length ? v.photos : defaultContent.photos,
  tracks: Array.isArray(v?.tracks) ? v.tracks : defaultContent.tracks,
  slots: { ...defaultContent.slots, ...v?.slots },
  portraits: { ...v?.portraits },
})

const load = () =>
  (remote ??= !SUPABASE_ANON_KEY
    ? Promise.resolve(defaultContent) // no key (local dev without env): nothing to ask
    : fetch(`${SUPABASE_URL}/rest/v1/site_content?key=eq.site&select=value`, {
        headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
      })
        .then((r) => (r.ok ? r.json() : []))
        .then((rows: { value?: Partial<Content> }[]) => merge(rows[0]?.value))
        .catch(() => defaultContent)) // any failure keeps the built-in content, silently

/** Site content: the built-in defaults on the server and first render, then whatever the admin saved (top-level keys replace the defaults). */
export function useContent(): Content {
  const [content, setContent] = useState(defaultContent)
  useEffect(() => {
    let live = true
    load().then((c) => live && setContent(c))
    return () => {
      live = false
    }
  }, [])
  return content
}
