'use client'
import { useEffect, useLayoutEffect, useRef, useState, type FormEvent, type PointerEvent } from 'react'
import Link from 'next/link'
import Arrow from '@/components/Arrow'
import { basePath, getAssetPath } from '@/lib/basePath'
import { EMAIL } from '@/lib/site'
import { rpc } from '@/lib/supabase'
import css from './Pass.module.css'
import { drawStory, pad, parseRef, whatsapp } from './story'

type Claim = { number: number; isNew: boolean; referrals: number }
type Top = { number: number; referrals: number }[]
type Stats = { number: number; referrals: number; top: Top } | null
type Status = { kind: 'new' | 'existing' | 'missing' | 'failed' | 'offline'; number?: number } | null

const KEY = 'kz_pass' // the only thing kept in the browser: the pass number
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/ // same rule as claim_pass
const ERR = {
  emailEmpty: 'Enter your email to get a pass.',
  emailInvalid: 'That email does not look right. Check it and try again.',
  whatsapp: 'Check that number. It needs a country code, like +91. Or leave it empty.',
}
const mail = (
  <a className="link" href={`mailto:${EMAIL}`}>
    {EMAIL}
  </a>
)
const help = 'text-[14px] leading-[1.45]'

/** The sign-up form and the numbered pass. `rite` and `date` are the next event's, unset when none is announced. */
export default function Pass({ rite, date }: { rite?: string; date?: string }) {
  const [pass, setPass] = useState<number | null>(null)
  const [count, setCount] = useState<number | null>(null)
  const [top, setTop] = useState<Top | 'failed' | null>(null)
  const [referred, setReferred] = useState<number | null>(null) // a ?ref= pass the server confirmed
  const [status, setStatus] = useState<Status>(null)
  const [errs, setErrs] = useState<{ email?: string; whatsapp?: string }>({})
  const [sending, setSending] = useState(false)
  const [tool, setTool] = useState('') // result of Save / Copy
  const [shot, setShot] = useState('') // the story image, shown on the page when it can be neither shared nor downloaded

  const ref = useRef<number | null>(null) // ?ref= from the address: memory only, never stored
  const busy = useRef(false)
  const story = useRef<Promise<Blob | null> | null>(null)
  const statusEl = useRef<HTMLDivElement>(null)
  const linkEl = useRef<HTMLParagraphElement>(null)
  const card = useRef<HTMLDivElement>(null)

  const loadStats = (n: number) => rpc<Stats>('pass_stats', { p_number: n })
  const showStats = (s: NonNullable<Stats>) => {
    setCount(s.referrals)
    setTop(Array.isArray(s.top) ? s.top : [])
  }

  // Before first paint: a returning visitor sees their pass, not the form.
  useLayoutEffect(() => {
    let live = true
    let mine: number | null = null
    try {
      mine = parseRef(localStorage.getItem(KEY))
    } catch {} // storage blocked: treat as no pass
    ref.current = parseRef(new URLSearchParams(location.search).get('ref'))
    if (mine) {
      const n = mine
      setPass(n)
      loadStats(n).then(
        (s) => {
          if (!live) return
          if (s) return showStats(s)
          // the server does not know this number (the list was reset): forget it and show the form
          try {
            localStorage.removeItem(KEY)
          } catch {}
          setPass(null)
          setStatus({ kind: 'missing', number: n })
        },
        () => live && setTop('failed'),
      )
    } else if (ref.current) {
      const r = ref.current
      loadStats(r).then((s) => live && s && setReferred(r), () => {}) // unknown or unreachable: say nothing
    }
    return () => {
      live = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Draw the story image as soon as there is a number, so the share sheet can open straight from the tap.
  useEffect(() => {
    story.current = pass ? drawStory(pass, rite, date) : null
  }, [pass, rite, date])

  // The form unmounts on success and takes focus with it: put focus (and the screen) on the result.
  useEffect(() => {
    if (status?.kind === 'new' || status?.kind === 'existing') statusEl.current?.focus()
  }, [status])

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (busy.current) return
    const form = e.currentTarget, data = new FormData(form)
    const email = String(data.get('email')).trim(), wa = whatsapp(String(data.get('whatsapp'))), city = String(data.get('city')).trim()
    const bad = { email: !email ? ERR.emailEmpty : !EMAIL_RE.test(email) ? ERR.emailInvalid : undefined, whatsapp: wa === false ? ERR.whatsapp : undefined }
    const focus = (name: string) => (form.elements.namedItem(name) as HTMLInputElement).focus()
    setErrs(bad)
    setStatus(null)
    if (bad.email) return focus('email')
    if (bad.whatsapp) return focus('whatsapp')
    if (!navigator.onLine) return setStatus({ kind: 'offline' })

    busy.current = true
    setSending(true)
    try {
      const r = await rpc<Claim>('claim_pass', { p_email: email, p_whatsapp: wa || null, p_city: city || null, p_ref: ref.current })
      // never show a number the server did not send
      if (!r || !Number.isSafeInteger(r.number) || r.number < 1) throw new Error('BAD_REPLY')
      try {
        localStorage.setItem(KEY, String(r.number))
      } catch {} // private mode: the pass still shows, it just will not be remembered here
      setPass(r.number)
      setCount(Number.isSafeInteger(r.referrals) ? r.referrals : null)
      setStatus({ kind: r.isNew ? 'new' : 'existing', number: r.number })
      window.dispatchEvent(new Event('sigil:kick'))
      loadStats(r.number).then((s) => (s ? showStats(s) : setTop('failed')), () => setTop('failed'))
    } catch (err) {
      const code = (err as Error).message
      if (code === 'INVALID_EMAIL') {
        setErrs({ email: ERR.emailInvalid })
        focus('email')
      } else if (code === 'INVALID_WHATSAPP') {
        setErrs({ whatsapp: ERR.whatsapp })
        focus('whatsapp')
      } else setStatus({ kind: navigator.onLine ? 'failed' : 'offline' })
    } finally {
      busy.current = false
      setSending(false)
    }
  }

  const link = pass ? `${location.origin}${basePath}/pass/?ref=${pass}` : ''

  async function copy() {
    try {
      await navigator.clipboard.writeText(link)
      return setTool('Link copied.')
    } catch {} // in-app browsers often refuse: fall through to selecting the text
    if (linkEl.current) getSelection()?.selectAllChildren(linkEl.current)
    try {
      if (document.execCommand('copy')) return setTool('Link copied.')
    } catch {}
    setTool('This browser blocks copying. Press and hold the link below, then choose Copy.')
  }

  async function save() {
    if (!pass) return
    const blocked = 'This browser blocks saving. Press and hold the image below, or take a screenshot.'
    const blob = await (story.current ??= drawStory(pass, rite, date)).catch(() => null)
    if (!blob) return setTool(blocked)
    const name = `kamikaze-soul-${pad(pass)}.png`
    const file = new File([blob], name, { type: 'image/png' })
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          ...(rite && date && { title: `Kamikaze / ${rite}`, text: `I am on the list for Kamikaze, ${date}. The venue drops to the list first. Get on it here: ${link}` }),
        })
        return setTool('')
      } catch (err) {
        if ((err as Error).name === 'AbortError') return // they closed the share sheet
      }
    }
    const url = URL.createObjectURL(blob)
    // ponytail: no browser reports a refused download, so the in-app browsers known to drop them are named here; extend the list when another turns up
    if (!('download' in HTMLAnchorElement.prototype) || /Instagram|FBAN|FBAV|Line\//.test(navigator.userAgent)) {
      setShot(url)
      return setTool(blocked)
    }
    Object.assign(document.createElement('a'), { href: url, download: name }).click()
    setTimeout(() => URL.revokeObjectURL(url), 30_000)
    setTool('Image downloaded. Find it in your downloads and add it to your story.')
  }

  // Desktop: the card leans toward the mouse. CSS reads the two variables and eases; it ignores them on touch and under reduced motion.
  function tilt(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== 'mouse' || !card.current) return
    const b = e.currentTarget.getBoundingClientRect()
    card.current.style.setProperty('--ry', `${((e.clientX - b.left) / b.width - 0.5) * 26}deg`)
    card.current.style.setProperty('--rx', `${-((e.clientY - b.top) / b.height - 0.5) * 20}deg`)
  }
  const level = () => card.current?.removeAttribute('style')

  const soul = pass ? `Soul ${pad(pass)}` : ''
  const promise = date ? 'The venue reaches you first, and your link counts everyone you bring.' : 'Your link counts everyone you bring.'

  return (
    <div className="wrap pb-0 pt-4 md:pb-20 md:pt-10">
      <h1 className="rit text-[min(16.4vw,64px)] md:whitespace-nowrap md:text-[min(11vw,160px)]">
        Take <br className="md:hidden" />
        the pass
      </h1>

      <div className="mt-3 md:mt-12 md:grid md:grid-cols-2 md:grid-rows-[auto_1fr] md:items-start md:gap-x-[clamp(32px,6vw,96px)]">
        <div className="flex flex-col gap-3 pb-8 md:max-w-[460px] md:pb-0">
          <p className="dim mb-2 mt-1">{pass ? `You hold ${soul}. ${promise}` : `Sign up and you get a numbered soul pass. ${promise}`}</p>

          {!pass && (
            <>
              {referred && (
                <p className="mono mb-1">
                  <span className="chip">Soul {pad(referred)}</span>sent you. Sign up and it counts for them.
                </p>
              )}
              <noscript>
                <p className="mb-1">This form needs JavaScript. Email {mail} and we will add you.</p>
              </noscript>
              <form noValidate onSubmit={submit} className="flex flex-col gap-3">
                <label className="mono" htmlFor="p-email">
                  Email
                </label>
                <input
                  className="field"
                  id="p-email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  enterKeyHint="next"
                  maxLength={254}
                  required
                  aria-invalid={!!errs.email}
                  aria-describedby={errs.email ? 'p-email-err' : undefined}
                />
                {errs.email && (
                  <p id="p-email-err" className={`${help} text-hot`}>
                    {errs.email}
                  </p>
                )}

                <label className="mono mt-[6px]" htmlFor="p-wa">
                  WhatsApp
                </label>
                <input
                  className="field"
                  id="p-wa"
                  name="whatsapp"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  enterKeyHint="next"
                  placeholder="e.g. +91 98765 43210"
                  maxLength={40}
                  aria-invalid={!!errs.whatsapp}
                  aria-describedby="p-wa-help"
                />
                <p id="p-wa-help" className={`${help} -mt-1 ${errs.whatsapp ? 'text-hot' : 'dim'}`}>
                  {errs.whatsapp ?? 'Optional. Start with the country code, like +91.'}
                </p>

                <label className="mono mt-[6px]" htmlFor="p-city">
                  City
                </label>
                <input className="field" id="p-city" name="city" type="text" autoComplete="address-level2" autoCapitalize="words" enterKeyHint="go" maxLength={80} aria-describedby="p-city-help" />
                <p id="p-city-help" className={`${help} dim -mt-1`}>
                  Optional.
                </p>

                <button type="submit" className="cta mono mt-[10px] w-full" disabled={sending} data-kick>
                  {sending ? 'Getting your number' : 'Seal my pass'}
                  <Arrow />
                </button>
              </form>
            </>
          )}

          <div ref={statusEl} role="status" tabIndex={-1} className="scroll-mt-[calc(var(--nav-h)+24px)] outline-none empty:hidden">
            {status?.kind === 'new' && <p>You are on the list. Soul {pad(status.number!)} is yours.</p>}
            {status?.kind === 'existing' && <p>This email already holds Soul {pad(status.number!)}. Here it is.</p>}
            {(status?.kind === 'new' || status?.kind === 'existing') && <p className="dim mt-1">No email is coming. Enter the same email on any device to see this pass again.</p>}
            {status?.kind === 'missing' && <p>We cannot find Soul {pad(status.number!)}. Sign up again to get a pass.</p>}
            {status?.kind === 'offline' && <p className="text-hot">You are offline. Reconnect and try again.</p>}
            {status?.kind === 'failed' && <p className="text-hot">That did not go through. Try again, or email {mail} and we will add you.</p>}
          </div>

          {!pass && (
            <p className={`${help} dim`}>
              What you enter is stored and never sold. The{' '}
              <Link className="link" href="/privacy/">
                privacy page
              </Link>{' '}
              has the details.
            </p>
          )}
        </div>

        {/* phone: card, then the two buttons full width. Wide screens: the buttons stand beside the card, on its baseline. */}
        <div className="flex flex-col items-center gap-4 md:col-start-2 md:row-span-2 md:row-start-1 lg:flex-row lg:items-end lg:justify-end lg:gap-6">
            <div className={css.stage} onPointerMove={tilt} onPointerLeave={level}>
              <div ref={card} className={css.card}>
                <div className="mono flex justify-between">
                  <span>Kamikaze</span>
                  {rite && <span className="hot">{rite}</span>}
                </div>
                <img
                  src={getAssetPath('/logo-sigil-384.webp')}
                  srcSet={`${getAssetPath('/logo-sigil-384.webp')} 384w, ${getAssetPath('/logo-sigil.webp')} 512w`}
                  sizes="(min-width: 900px) 250px, 210px"
                  alt=""
                  width={210}
                  height={210}
                  decoding="async"
                  className="h-[210px] w-[210px] self-center object-contain md:h-[250px] md:w-[250px]"
                />
                <div>
                  <p className="num text-[40px]">
                    Soul{' '}
                    <span key={pass} className={`hot block ${pass ? css.arrive : ''}`}>
                      {pad(pass ?? 0)}
                    </span>
                  </p>
                  <p className="mono mt-2">One soul. One ticket. One room.</p>
                  {date && <p className="mono dim mt-1">{date}</p>}
                </div>
              </div>
            </div>

          <div className="flex w-full flex-col gap-4 md:max-w-[340px] lg:max-w-[250px] lg:pb-7">
            <div className="flex gap-[10px] lg:flex-col">
              <button type="button" className="ghost mono flex-1 px-2" disabled={!pass} onClick={save}>
                Save to story
              </button>
              <button type="button" className="ghost mono flex-1 px-2" disabled={!pass} onClick={copy}>
                Copy my link
              </button>
            </div>
            <p role="status" className={`${help} dim empty:hidden`}>
              {pass ? tool : 'Sign up to get your number. Save and copy unlock with it.'}
            </p>
            {shot && <img src={shot} alt={`Your pass, ${soul}, as a story image`} width={1080} height={1920} className="h-auto w-full border border-hair" />}
          </div>
        </div>

        {pass && (
          <div className="mt-6 md:col-start-1 md:row-start-2 md:mt-10 md:max-w-[460px]">
            <p className="mono dim">Your link</p>
            <p ref={linkEl} className="mt-2 select-all break-all border border-hair px-[14px] py-3 font-mono text-[14px] leading-[1.5]">
              {link}
            </p>

            {top === 'failed' ? (
              <p className="mt-5">The count did not load. Your pass is fine. Reload to try again.</p>
            ) : (
              count !== null && (
                <p className="mt-5">
                  {count === 0
                    ? 'No one has signed up through your link yet. Send it to people you want in the room.'
                    : count === 1
                      ? '1 person has signed up through your link.'
                      : `${count} people have signed up through your link.`}
                </p>
              )
            )}

            {Array.isArray(top) && (
              <section aria-labelledby="top-ten" className="mt-12">
                <h2 id="top-ten" className="rit text-[44px]">
                  Top ten
                </h2>
                <p className="dim mt-3">Passes ranked by sign-ups through their link.</p>
                {top.length ? (
                  <ol className="mt-4">
                    {top.map((t) => (
                      <li key={t.number} className="rowlink mono last:border-b last:border-hair">
                        <span>
                          Soul {pad(t.number)}
                          {t.number === pass && <span className="chip ml-3 mr-0">You</span>}
                        </span>
                        <span className="num text-[20px]">{t.referrals}</span>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="mt-4">No sign-ups through a link yet. First place is open.</p>
                )}
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
