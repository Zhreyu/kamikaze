'use client'

import { useEffect, useRef } from 'react'

// Simple global store for scroll progress (accessible outside React tree)
interface ScrollStore {
  progress: number
  velocity: number // -1 to 1, negative = scrolling up, positive = scrolling down
  rawVelocity: number // Unsmoothed velocity for particle stretch
  section: 'hero' | 'manifesto' | 'events' | 'artists' | 'contact'
  listeners: Set<() => void>
}

const scrollStore: ScrollStore = {
  progress: 0,
  velocity: 0,
  rawVelocity: 0,
  section: 'hero',
  listeners: new Set()
}

// Velocity tracking state
let lastScrollY = 0
let lastScrollTime = 0
let velocityDecay: number | null = null

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

export function getScrollVelocity() {
  return scrollStore.velocity
}

export function getRawScrollVelocity() {
  return scrollStore.rawVelocity
}

function setScrollVelocity(velocity: number, raw: number) {
  scrollStore.velocity = Math.max(-1, Math.min(1, velocity))
  scrollStore.rawVelocity = raw
  scrollStore.listeners.forEach(listener => listener())
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

    // Initialize scroll position
    lastScrollY = window.scrollY
    lastScrollTime = performance.now()

    const handleScroll = () => {
      const scrollTop = window.scrollY
      const now = performance.now()
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = docHeight > 0 ? scrollTop / docHeight : 0
      setScrollProgress(progress)

      // Calculate velocity (pixels per millisecond, normalized)
      const deltaY = scrollTop - lastScrollY
      const deltaTime = Math.max(now - lastScrollTime, 1) // Prevent division by zero
      const rawVelocity = deltaY / deltaTime // px/ms

      // Normalize to -1 to 1 range (assuming ~2000px/s is "max" scroll speed)
      const normalizedVelocity = Math.max(-1, Math.min(1, rawVelocity / 2))

      setScrollVelocity(normalizedVelocity, rawVelocity)

      // Update last values
      lastScrollY = scrollTop
      lastScrollTime = now

      // Clear any existing decay and start new one
      if (velocityDecay) {
        cancelAnimationFrame(velocityDecay)
      }

      // Decay velocity back to 0 when not scrolling
      const decayVelocity = () => {
        const currentVel = scrollStore.velocity
        if (Math.abs(currentVel) > 0.01) {
          setScrollVelocity(currentVel * 0.92, scrollStore.rawVelocity * 0.92)
          velocityDecay = requestAnimationFrame(decayVelocity)
        } else {
          setScrollVelocity(0, 0)
          velocityDecay = null
        }
      }

      // Start decay after a brief pause
      velocityDecay = requestAnimationFrame(decayVelocity)

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

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (velocityDecay) {
        cancelAnimationFrame(velocityDecay)
      }
    }
  }, [])
}
