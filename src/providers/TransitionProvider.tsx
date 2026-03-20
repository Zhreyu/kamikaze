'use client'

import { createContext, useContext, useState, useCallback, useRef, ReactNode, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { GlitchTransition } from '@/lib/canvas/glitchTransition'

interface TransitionContextValue {
  isTransitioning: boolean
  navigateTo: (href: string) => void
}

const TransitionContext = createContext<TransitionContextValue>({
  isTransitioning: false,
  navigateTo: () => {},
})

export function useTransition() {
  return useContext(TransitionContext)
}

interface TransitionProviderProps {
  children: ReactNode
}

export function TransitionProvider({ children }: TransitionProviderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isTransitioning, setIsTransitioning] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const transitionRef = useRef<GlitchTransition | null>(null)

  // Initialize canvas and transition handler
  useEffect(() => {
    const canvas = document.createElement('canvas')
    canvas.style.cssText = `
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 10000;
      background: transparent;
    `
    document.body.appendChild(canvas)
    canvasRef.current = canvas

    const transition = new GlitchTransition(canvas)
    transitionRef.current = transition

    return () => {
      transition.stop()
      canvas.remove()
    }
  }, [])

  const navigateTo = useCallback(async (href: string) => {
    if (isTransitioning || href === pathname) return

    setIsTransitioning(true)

    const transition = transitionRef.current

    if (transition) {
      // Glitch out
      await transition.glitchOut(350)

      // Navigate
      router.push(href)

      // Small delay
      await new Promise((resolve) => setTimeout(resolve, 50))

      // Glitch in
      await transition.glitchIn(300)
    } else {
      router.push(href)
    }

    setIsTransitioning(false)
  }, [isTransitioning, pathname, router])

  return (
    <TransitionContext.Provider value={{ isTransitioning, navigateTo }}>
      {children}
    </TransitionContext.Provider>
  )
}
