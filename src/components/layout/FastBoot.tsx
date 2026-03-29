'use client'

import { useState, useEffect } from 'react'
import { initAudioEngine, play } from '@/hooks/useAudioEngine'
import { playChirpSound } from '@/hooks/useSonicFeedback'
import clsx from 'clsx'

interface FastBootProps {
  onComplete: () => void
}

export function FastBoot({ onComplete }: FastBootProps) {
  const [phase, setPhase] = useState<'prompt' | 'welcome' | 'done'>('prompt')
  const [glitchFrame, setGlitchFrame] = useState(0)

  // Subtle flicker on prompt
  useEffect(() => {
    if (phase !== 'prompt') return

    const interval = setInterval(() => {
      setGlitchFrame((f) => (f + 1) % 10)
    }, 100)

    return () => clearInterval(interval)
  }, [phase])

  const handleClick = () => {
    if (phase !== 'prompt') return

    // Initialize audio engine (unlocks AudioContext)
    initAudioEngine()

    // Play acknowledgment chirp
    playChirpSound()

    // Transition to welcome
    setPhase('welcome')

    // After brief flash, complete and start radio
    setTimeout(() => {
      play()
      setPhase('done')
      onComplete()
    }, 600)
  }

  // Handle keyboard
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        handleClick()
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [phase])

  if (phase === 'done') return null

  return (
    <div
      className={clsx(
        'fixed inset-0 z-[100] bg-void flex items-center justify-center cursor-pointer',
        'transition-all duration-500',
        phase === 'welcome' && 'opacity-0'
      )}
      onClick={handleClick}
    >
      {/* Scanlines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          background:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
        }}
      />

      {/* Prompt phase */}
      {phase === 'prompt' && (
        <div className="relative">
          {/* Flickering bar above text */}
          <div
            className={clsx(
              'absolute -top-4 left-0 right-0 h-px bg-arterial',
              'transition-opacity duration-75',
              glitchFrame % 3 === 0 ? 'opacity-100' : 'opacity-60'
            )}
          />

          {/* Main prompt */}
          <button
            className={clsx(
              'font-mono text-sm tracking-widest transition-all duration-100',
              glitchFrame % 5 === 0 ? 'text-white' : 'text-arterial'
            )}
            style={{
              textShadow:
                glitchFrame % 4 === 0 ? '2px 0 #00ffff, -2px 0 #ff00ff' : 'none',
            }}
          >
            [ SIGNAL_RECOGNIZED // RESUME_UPLINK? ]
          </button>

          {/* Flickering bar below text */}
          <div
            className={clsx(
              'absolute -bottom-4 left-0 right-0 h-px bg-arterial',
              'transition-opacity duration-75',
              glitchFrame % 4 === 0 ? 'opacity-100' : 'opacity-60'
            )}
          />

          {/* Hint */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 font-mono text-[10px] text-white/50 whitespace-nowrap">
            [ CLICK OR PRESS ENTER ]
          </div>
        </div>
      )}

      {/* Welcome phase - brief flash */}
      {phase === 'welcome' && (
        <div className="font-mono text-sm text-white tracking-widest animate-pulse">
          [ WELCOME BACK, OPERATIVE ]
        </div>
      )}

      {/* Corner decorations */}
      <div className="absolute top-4 left-4 font-mono text-[10px] text-white/50">
        [FAST_BOOT]
      </div>
      <div className="absolute top-4 right-4 font-mono text-[10px] text-arterial/50">
        RETURNING_SIGNAL
      </div>
    </div>
  )
}
