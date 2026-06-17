'use client'

import { useTransition } from '@/providers/TransitionProvider'
import clsx from 'clsx'

interface ClientNavButtonProps {
  href: string
  children: React.ReactNode
  className?: string
}

export function ClientNavButton({ href, children, className }: ClientNavButtonProps) {
  const { navigateTo, isTransitioning } = useTransition()

  return (
    <button
      type="button"
      disabled={isTransitioning}
      onClick={() => navigateTo(href)}
      className={clsx(className)}
    >
      {children}
    </button>
  )
}
