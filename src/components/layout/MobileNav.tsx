'use client'

import { useEffect, useState } from 'react'
import clsx from 'clsx'

interface MobileNavProps {
  isOpen: boolean
  onClose: () => void
  links: readonly { href: string; label: string }[]
  currentPath: string
  onNavigate: (href: string) => void
}

export function MobileNav({
  isOpen,
  onClose,
  links,
  currentPath,
  onNavigate,
}: MobileNavProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      setTimeout(() => setIsAnimating(true), 50)
    } else {
      setIsAnimating(false)
      setTimeout(() => setIsVisible(false), 500)
    }
  }, [isOpen])

  const handleLinkClick = (href: string) => {
    onClose()
    setTimeout(() => {
      onNavigate(href)
    }, 300)
  }

  if (!isVisible) return null

  return (
    <div
      className={clsx(
        'fixed inset-0 z-[200] bg-void/98 backdrop-blur-sm transition-opacity duration-500',
        isAnimating ? 'opacity-100' : 'opacity-0'
      )}
      onClick={onClose}
    >
      <div
        className="h-full flex flex-col p-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))] max-w-md mx-auto w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6 px-1">
          <span className="font-mono text-[10px] text-arterial/70 tracking-[0.35em]">
            [ NAV ]
          </span>
          <button
            type="button"
            onClick={onClose}
            className="font-mono text-[10px] text-white/50 tracking-widest hover:text-arterial transition-colors min-h-[44px] px-2"
          >
            [ CLOSE ]
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-center border border-white/10 bg-black/40 relative">
          <div className="absolute top-0 left-0 w-3 h-3 border-l border-t border-arterial/50" />
          <div className="absolute top-0 right-0 w-3 h-3 border-r border-t border-arterial/50" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-l border-b border-arterial/50" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-r border-b border-arterial/50" />

          {links.map((link, index) => {
            const isActive =
              currentPath === link.href ||
              (link.href !== '/' && currentPath.startsWith(link.href))

            return (
              <button
                key={link.href}
                type="button"
                onClick={() => handleLinkClick(link.href)}
                className={clsx(
                  'w-full text-left flex items-center gap-4 py-4 px-5 min-h-[52px]',
                  'border-b border-white/10 last:border-b-0 transition-colors',
                  'border-l-2',
                  isActive
                    ? 'border-l-arterial bg-arterial/5'
                    : 'border-l-transparent hover:border-l-arterial/40 hover:bg-white/[0.03]'
                )}
                style={{
                  opacity: isAnimating ? 1 : 0,
                  transform: isAnimating ? 'translateY(0)' : 'translateY(12px)',
                  transition: `opacity 0.4s ease ${index * 0.05}s, transform 0.4s ease ${index * 0.05}s, border-color 0.2s, background-color 0.2s`,
                }}
              >
                <span className="font-mono text-[10px] text-white/35 tracking-widest w-6 shrink-0">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span
                  className={clsx(
                    'font-display text-xl tracking-wide leading-none',
                    isActive ? 'text-arterial' : 'text-white'
                  )}
                >
                  {link.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="absolute bottom-[max(2rem,env(safe-area-inset-bottom))] left-0 right-0 text-center pointer-events-none">
        <span className="font-mono text-[10px] text-white/40 tracking-widest">
          Tap outside to close
        </span>
      </div>
    </div>
  )
}
