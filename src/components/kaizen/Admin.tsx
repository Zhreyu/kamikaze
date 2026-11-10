'use client'
import { useEffect, useState, type FormEvent } from 'react'
import { createClient } from '@supabase/supabase-js'
import { defaultContent, type Content } from '@/data/content'
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/supabase'
import Board from './Board'
import type { Db } from './util'

let client: Db | undefined
// Made on first use in the browser, never while prerendering. Without an anon key in the build createClient would throw,
// so a stand-in goes in: every request then fails and the screen says so.
const getDb = () => (client ??= createClient(SUPABASE_URL, SUPABASE_ANON_KEY || 'no-anon-key'))

// Same rule as src/lib/content.ts: a saved key replaces the default only when it has the right shape.
const merge = (v?: Partial<Content> | null): Content => ({
  photos: Array.isArray(v?.photos) ? v.photos : defaultContent.photos,
  tracks: Array.isArray(v?.tracks) ? v.tracks : defaultContent.tracks,
  slots: { ...defaultContent.slots, ...v?.slots },
  portraits: { ...v?.portraits },
})

type User = { id: string; email?: string }

/** /kaizen/: sign in, then the board. Who may read or write what is decided by Supabase Auth and row level security, not by this screen. */
export default function Admin() {
  const [db, setDb] = useState<Db>()
  const [user, setUser] = useState<User | null>() // undefined until the stored session has been read
  const [gate, setGate] = useState<'checking' | 'denied' | 'failed' | Content>('checking')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const db = getDb()
    setDb(db)
    // fires once with the stored session, then on every sign-in, sign-out and token refresh.
    // The user object is kept when the id is unchanged, so a refresh never reloads the board over unsaved edits.
    const { data } = db.auth.onAuthStateChange((_event, session) => setUser((prev) => (prev && prev.id === session?.user.id ? prev : (session?.user ?? null))))
    return () => data.subscription.unsubscribe()
  }, [])

  const uid = user?.id
  useEffect(() => {
    if (!db || !uid) return
    let live = true
    setGate('checking')
    ;(async () => {
      try {
        const admin = await db.rpc('is_admin')
        if (!live) return
        if (admin.error) return setGate('failed')
        if (admin.data !== true) return setGate('denied')
        const row = await db.from('site_content').select('value').eq('key', 'site').maybeSingle()
        // a failed read must not fall back to the defaults: saving them would overwrite what is live
        if (live) setGate(row.error ? 'failed' : merge(row.data?.value))
      } catch {
        if (live) setGate('failed')
      }
    })()
    return () => {
      live = false
    }
  }, [db, uid])

  const signIn = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!db || sending) return
    const form = new FormData(e.currentTarget)
    setSending(true)
    setError('')
    const failed = 'Could not sign in. Check the connection and try again.'
    try {
      const { error } = await db.auth.signInWithPassword({ email: String(form.get('email')).trim(), password: String(form.get('password')) })
      // 400 = the server answered and said no; anything else (offline, wrong project key, 5xx) is not the person's typing
      if (error) setError(error.status === 400 ? 'Wrong email or password.' : failed)
    } catch {
      setError(failed)
    }
    setSending(false)
  }

  const signOut = () => {
    // the board's unsaved-changes guard only sees links; this button asks for itself
    if (document.querySelector('[data-kz-dirty]') && !confirm('You have unsaved changes. Leave anyway?')) return
    db?.auth.signOut().catch(() => {})
  }

  return (
    <div className="wrap pb-0 pt-8 md:pt-12">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <h1 className="rit text-[44px] md:text-[64px]">Admin</h1>
        {user && (
          <div className="flex items-center gap-4">
            <p className="mono dim min-w-0 [overflow-wrap:anywhere]">Signed in as {user.email}</p>
            <button type="button" className="mono min-h-[44px] flex-none border border-hair px-3 transition-colors active:bg-bone active:text-void hover:border-line" onClick={signOut}>
              Sign out
            </button>
          </div>
        )}
      </div>

      {user === null && (
        <form onSubmit={signIn} className="mt-8 grid max-w-[420px] gap-4 pb-16" aria-labelledby="kz-signin">
          <h2 id="kz-signin" className="num text-[22px]">
            Sign in
          </h2>
          <label className="block">
            <span className="mono dim mb-1.5 block">Email</span>
            <input className="field" name="email" type="email" inputMode="email" autoComplete="username" autoCapitalize="none" spellCheck={false} enterKeyHint="next" required aria-invalid={error ? true : undefined} aria-describedby="kz-signin-status" />
          </label>
          <label className="block">
            <span className="mono dim mb-1.5 block">Password</span>
            <input className="field" name="password" type="password" autoComplete="current-password" enterKeyHint="go" required aria-invalid={error ? true : undefined} aria-describedby="kz-signin-status" />
          </label>
          <button type="submit" className="cta mono mt-1" disabled={sending}>
            {sending ? 'Signing in' : 'Sign in'}
          </button>
          <p id="kz-signin-status" role="status" className="hot min-h-[1.55em]">
            {error}
          </p>
        </form>
      )}

      {user && gate === 'checking' && <p role="status" className="sr-only">Loading</p>}
      {user && gate === 'denied' && <p className="mt-8 pb-16">This account has no admin access.</p>}
      {user && gate === 'failed' && (
        <p role="alert" className="mt-8 pb-16">
          Could not load the admin. Reload to try again.
        </p>
      )}
      {db && user && typeof gate === 'object' && <Board key={user.id} db={db} initial={gate} />}
    </div>
  )
}
