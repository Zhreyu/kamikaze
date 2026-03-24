'use client'

import { useScrollTracker } from '@/hooks/useScrollStore'

export function ScrollTracker() {
  useScrollTracker()
  return null // This component only tracks scroll, renders nothing
}
