'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Arrow from './Arrow'

/** Phone-only sign-up button pinned to the bottom. It slides in once you are past the first screen and no other red button is on screen. */
export default function Dock() {
  const pathname = usePathname()
  const off = /^\/(pass|kaizen)\//.test(pathname)
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (off) return
    const seen = new Set<Element>()
    let far = false
    const sync = () => setShow(far && seen.size === 0)
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? seen.add(e.target) : seen.delete(e.target)))
      sync()
    })
    // ponytail: the page's CTAs are read once per route; add a MutationObserver if a page starts adding .cta elements after it renders
    document.querySelectorAll('main .cta').forEach((cta) => io.observe(cta))
    const onScroll = () => {
      const now = scrollY > innerHeight * 0.7
      if (now !== far) {
        far = now
        sync()
      }
    }
    onScroll()
    addEventListener('scroll', onScroll, { passive: true })
    return () => {
      io.disconnect()
      removeEventListener('scroll', onScroll)
      setShow(false)
    }
  }, [pathname, off])

  if (off) return null
  return (
    <Link
      id="dock"
      href="/pass/"
      data-kick
      className={`cta mono fixed inset-x-3 bottom-[calc(12px+env(safe-area-inset-bottom,0px))] z-[9] md:hidden ${
        show ? 'visible translate-y-0 [transition:transform_.5s_var(--ease)]' : 'invisible translate-y-[160%] [transition:transform_.5s_var(--ease),visibility_0s_.5s]'
      }`}
    >
      Get the venue first
      <Arrow />
    </Link>
  )
}
