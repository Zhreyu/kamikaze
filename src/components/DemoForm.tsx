'use client'
import { useRef, useState, type FormEvent, type ReactNode } from 'react'
import { EMAIL } from '@/lib/site'
import { rpc } from '@/lib/supabase'
import Arrow from './Arrow'

// Same rule as the database function submit_demo: soundcloud.com or one subdomain of it (on., m., www.), with a path.
const SOUNDCLOUD = /^https?:\/\/([a-z0-9-]+\.)?soundcloud\.com\/.+/i
const EMPTY = 'Paste a SoundCloud link first.'
const INVALID = 'That is not a SoundCloud link. Paste one from soundcloud.com.'

/** Demo form: SoundCloud link (required), artist name, city. Nothing typed is lost unless the demo was received. */
export default function DemoForm({ className = '' }: { className?: string }) {
  const linkRef = useRef<HTMLInputElement>(null)
  const [linkError, setLinkError] = useState('')
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState<ReactNode>(null)

  const badLink = (message: string) => {
    setLinkError(message)
    setStatus(null)
    linkRef.current?.focus()
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (sending) return
    const form = e.currentTarget
    const data = new FormData(form)
    const text = (key: string) => String(data.get(key) ?? '').trim()

    let link = text('link')
    if (!link) return badLink(EMPTY)
    if (!/^https?:\/\//i.test(link)) link = `https://${link}` // people paste soundcloud.com/name; the database wants the scheme
    if (!SOUNDCLOUD.test(link)) return badLink(INVALID)
    setLinkError('')

    if (!navigator.onLine) return setStatus('You are offline. Reconnect and try again.')

    setSending(true)
    setStatus(null)
    try {
      await rpc('submit_demo', { p_link: link, p_name: text('name') || null, p_city: text('city') || null })
      form.reset()
      setStatus('Demo received. It gets an honest listen.')
    } catch (err) {
      if (err instanceof Error && err.message === 'INVALID_LINK') badLink(INVALID)
      else
        setStatus(
          <>
            Your demo did not send. Try again, or email the link to{' '}
            <a className="link" href={`mailto:${EMAIL}`}>
              {EMAIL}
            </a>
            .
          </>,
        )
    } finally {
      setSending(false)
    }
  }

  return (
    <form noValidate onSubmit={submit} className={`flex flex-col gap-3 ${className}`}>
      <label className="mono" htmlFor="c-link">
        SoundCloud link
      </label>
      <input
        ref={linkRef}
        className="field"
        id="c-link"
        name="link"
        type="url"
        inputMode="url"
        autoComplete="url"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="next"
        maxLength={500}
        required
        aria-invalid={linkError ? true : undefined}
        aria-describedby={linkError ? 'c-link-error' : undefined}
        onInput={() => linkError && setLinkError('')}
      />
      {linkError && (
        <p id="c-link-error" className="hot">
          {linkError}
        </p>
      )}
      <label className="mono mt-[6px]" htmlFor="c-name">
        Artist name
      </label>
      <input className="field" id="c-name" name="name" type="text" autoComplete="nickname" enterKeyHint="next" maxLength={120} />
      <label className="mono mt-[6px]" htmlFor="c-city">
        City
      </label>
      <input className="field" id="c-city" name="city" type="text" autoComplete="address-level2" enterKeyHint="send" maxLength={80} />
      <button type="submit" data-kick aria-disabled={sending} className="cta mono mt-[10px] w-full">
        {sending ? 'Sending demo' : 'Send demo'}
        <Arrow />
      </button>
      {/* always in the DOM so screen readers announce what lands in it */}
      <p role="status" className="min-h-[1.55em] empty:min-h-0">
        {status}
      </p>
      <noscript>
        <p>
          This form needs JavaScript. Email your SoundCloud link to{' '}
          <a className="link" href={`mailto:${EMAIL}`}>
            {EMAIL}
          </a>
          .
        </p>
      </noscript>
    </form>
  )
}
