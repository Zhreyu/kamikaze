'use client'

import { useEffect, useRef } from 'react'

// Simple global store for scroll progress (accessible outside React tree)
interface ScrollStore {
  progress: number
  section: 'hero' | 'manifesto' | 'events' | 'artists' | 'contact'
  listeners: Set<() => void>
}

const scrollStore: ScrollStore = {
  progress: 0,
  section: 'hero',
  listeners: new Set()
}

export function setScrollProgress(progress: number) {
  scrollStore.progress = Math.max(0, Math.min(1, progress))
  scrollStore.listeners.forEach(listener => listener())
}

export function setScrollSection(section: ScrollStore['section']) {
  scrollStore.section = section
  scrollStore.listeners.forEach(listener => listener())
}

export function getScrollProgress() {
  return scrollStore.progress
}

export function getScrollSection() {
  return scrollStore.section
}

// Hook for components that need reactive updates
export function useScrollProgress() {
  const progressRef = useRef(scrollStore.progress)

  useEffect(() => {
    const listener = () => {
      progressRef.current = scrollStore.progress
    }
    scrollStore.listeners.add(listener)
    return () => {
      scrollStore.listeners.delete(listener)
    }
  }, [])

  return progressRef
}

// Hook to track and broadcast scroll progress using GSAP
export function useScrollTracker() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = docHeight > 0 ? scrollTop / docHeight : 0
      setScrollProgress(progress)

      // Determine section based on scroll position
      const vh = window.innerHeight
      if (scrollTop < vh * 2) {
        setScrollSection('hero')
      } else if (scrollTop < vh * 4) {
        setScrollSection('manifesto')
      } else if (scrollTop < vh * 6) {
        setScrollSection('events')
      } else if (scrollTop < vh * 8) {
        setScrollSection('artists')
      } else {
        setScrollSection('contact')
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial call

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
}
