'use client'

import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'

interface MarqueeGlitchProps {
  text: string
  className?: string
  speed?: number // pixels per second
  glitchInterval?: number // ms between glitches
}

const GLITCH_CHARS = '▓▒░█▄▀■□●○◆◇★☆×÷±≠∞∅'

export function MarqueeGlitch({
  text,
  className,
  speed = 50,
  glitchInterval = 3000,
}: MarqueeGlitchProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [displayText, setDisplayText] = useState(text)
  const [glitchIndex, setGlitchIndex] = useState<number | null>(null)

  // Random glitch effect
  useEffect(() => {
    const triggerGlitch = () => {
      const index = Math.floor(Math.random() * text.length)
      // Skip spaces
      if (text[index] === ' ') {
        triggerGlitch()
        return
      }

      setGlitchIndex(index)

      // Rapid character cycling
      let cycles = 0
      const maxCycles = 8
      const cycleInterval = setInterval(() => {
        cycles++
        if (cycles >= maxCycles) {
          clearInterval(cycleInterval)
          setDisplayText(text)
          setGlitchIndex(null)
          return
        }

        // Replace character with random glitch char
        const chars = text.split('')
        chars[index] = GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
        setDisplayText(chars.join(''))
      }, 50)

      return () => clearInterval(cycleInterval)
    }

    const interval = setInterval(triggerGlitch, glitchInterval)
    return () => clearInterval(interval)
  }, [text, glitchInterval])

  // Calculate animation duration based on speed
  const animationDuration = (text.length * 20) / speed

  return (
    <div
      ref={containerRef}
      className={clsx('overflow-hidden whitespace-nowrap', className)}
    >
      <div
        className="inline-flex animate-marquee"
        style={{
          animationDuration: `${animationDuration}s`,
        }}
      >
        {/* Two copies for seamless loop */}
        {[0, 1].map((copy) => (
          <span key={copy} className="mx-8">
            {displayText.split('').map((char, i) => (
              <span
                key={`${copy}-${i}`}
                className={clsx(
                  'inline-block transition-all duration-75',
                  glitchIndex === i && 'animate-pulse text-white scale-110'
                )}
                style={{
                  textShadow:
                    glitchIndex === i
                      ? '0 0 10px currentColor, -2px 0 #00ffff, 2px 0 #ff0000'
                      : undefined,
                }}
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </span>
        ))}
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee linear infinite;
        }
      `}</style>
    </div>
  )
}
