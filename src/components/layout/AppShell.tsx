'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { LenisProvider } from '@/providers/LenisProvider'
import { CursorProvider } from '@/providers/CursorProvider'
import { TransitionProvider } from '@/providers/TransitionProvider'
import { Navigation } from '@/components/layout/Navigation'
import { DepthLayers } from '@/components/canvas/DepthLayers'
import { ScrollTracker } from '@/components/layout/ScrollTracker'
import { TerminalAudioPlayer } from '@/components/audio/TerminalAudioPlayer'
import { BootSequence } from '@/components/layout/BootSequence'
import { FontLoader } from '@/components/layout/FontLoader'

// Dynamic import for 3D scene (client-only, no SSR for WebGL)
const SigilScene3D = dynamic(
  () => import('@/components/canvas/SigilScene3D'),
  { ssr: false }
)

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const [hasBooted, setHasBooted] = useState(false)
  const [showBootSequence, setShowBootSequence] = useState(true)

  // Check if user has already booted this session
  useEffect(() => {
    const booted = sessionStorage.getItem('kamikaze_booted')
    if (booted) {
      setHasBooted(true)
      setShowBootSequence(false)
    }
  }, [])

  const handleBootComplete = () => {
    setHasBooted(true)
    setShowBootSequence(false)
    sessionStorage.setItem('kamikaze_booted', 'true')
  }

  return (
    <>
      {/* Load fonts with correct base path */}
      <FontLoader />

      {/* Boot sequence overlay */}
      {showBootSequence && (
        <BootSequence onComplete={handleBootComplete} />
      )}

      {/* Main app */}
      <ScrollTracker />
      <SigilScene3D />
      <LenisProvider>
        <CursorProvider>
          <TransitionProvider>
            <Navigation />
            <main className="relative z-10">{children}</main>
            <DepthLayers />
            {hasBooted && <TerminalAudioPlayer />}
          </TransitionProvider>
        </CursorProvider>
      </LenisProvider>
    </>
  )
}
