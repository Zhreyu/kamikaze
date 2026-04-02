'use client'

import { useState, useEffect, useCallback } from 'react'

const GLITCH_CHARS = '神風死暴走地下▓▒░█カミカゼ'

const TERMINAL_LINES = [
  { prefix: 'SIGNAL://', text: 'SEARCHING_FREQUENCIES...' },
  { prefix: 'STATUS://', text: 'NO_ARCHIVED_TRANSMISSIONS' },
  { prefix: 'ROUTE://', text: '████████████' },
  { prefix: 'MSG://', text: '消せない // CANNOT_BE_ERASED' },
]

function GlitchTypeLine({
  prefix,
  text,
  delay,
  onComplete
}: {
  prefix: string
  text: string
  delay: number
  onComplete?: () => void
}) {
  const [displayText, setDisplayText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setHasStarted(true)
      setIsTyping(true)
      let index = 0

      const interval = setInterval(() => {
        if (index < text.length) {
          // Occasionally insert glitch char then correct it
          if (Math.random() > 0.85) {
            const glitchChar = GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
            setDisplayText(text.slice(0, index) + glitchChar)
            setTimeout(() => {
              setDisplayText(text.slice(0, index + 1))
            }, 50)
          } else {
            setDisplayText(text.slice(0, index + 1))
          }
          index++
        } else {
          clearInterval(interval)
          setIsTyping(false)
          onComplete?.()
        }
      }, 35)

      return () => clearInterval(interval)
    }, delay)

    return () => clearTimeout(timeout)
  }, [text, delay, onComplete])

  if (!hasStarted) return null

  return (
    <div className="flex items-center gap-2 font-mono text-xs md:text-sm">
      <span className="text-arterial">{prefix}</span>
      <span className="text-white/70">{displayText}</span>
      {isTyping && <span className="text-arterial animate-pulse">█</span>}
    </div>
  )
}

function StalledProgressBar() {
  const [progress, setProgress] = useState(0)
  const [isGlitching, setIsGlitching] = useState(false)

  useEffect(() => {
    const targetProgress = 3 + Math.random() * 12 // 3-15%

    // Fill to target
    const fillInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= targetProgress) {
          clearInterval(fillInterval)
          // Hold, then reset with glitch
          setTimeout(() => {
            setIsGlitching(true)
            setTimeout(() => {
              setIsGlitching(false)
              setProgress(0)
            }, 150)
          }, 2000 + Math.random() * 2000)
          return prev
        }
        return prev + 0.5
      })
    }, 50)

    return () => clearInterval(fillInterval)
  }, [progress === 0]) // Restart when reset to 0

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-[10px] text-white/40">ESTABLISHING_LINK</span>
        <span className="font-mono text-[10px] text-arterial">{Math.round(progress)}%</span>
      </div>
      <div className="h-1 bg-white/10 overflow-hidden">
        <div
          className={`h-full transition-all duration-100 ${isGlitching ? 'bg-white' : 'bg-arterial'}`}
          style={{
            width: `${progress}%`,
            boxShadow: isGlitching
              ? '0 0 20px rgba(255, 255, 255, 0.8)'
              : '0 0 10px rgba(204, 0, 0, 0.6)',
            transform: isGlitching ? `translateX(${Math.random() * 10 - 5}px)` : 'none',
          }}
        />
      </div>
    </div>
  )
}

export function DeadSignalsEmpty() {
  const [completedLines, setCompletedLines] = useState(0)
  const [showProgressBar, setShowProgressBar] = useState(false)

  const handleLineComplete = useCallback(() => {
    setCompletedLines(prev => {
      const next = prev + 1
      if (next >= TERMINAL_LINES.length) {
        setTimeout(() => setShowProgressBar(true), 300)
      }
      return next
    })
  }, [])

  return (
    <div className="relative border border-white/10 bg-black/40 overflow-hidden">
      {/* Terminal header */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-white/10 bg-white/5">
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-arterial/60" />
          <div className="w-2 h-2 rounded-full bg-white/20" />
          <div className="w-2 h-2 rounded-full bg-white/20" />
        </div>
        <span className="font-mono text-[10px] text-white/40 ml-2">
          DEAD_SIGNALS // ARCHIVE_TERMINAL v0.1
        </span>
      </div>

      {/* Terminal content */}
      <div className="p-6 space-y-3">
        {TERMINAL_LINES.map((line, index) => (
          <GlitchTypeLine
            key={index}
            prefix={line.prefix}
            text={line.text}
            delay={index * 800}
            onComplete={index === completedLines ? handleLineComplete : undefined}
          />
        ))}

        {/* Pending message */}
        {completedLines >= TERMINAL_LINES.length && (
          <div className="flex items-center gap-2 font-mono text-xs mt-4 pt-4 border-t border-white/10">
            <span className="text-white/30">&gt;</span>
            <span className="text-white/50">AWAITING_FIRST_TRANSMISSION</span>
            <span className="text-arterial animate-pulse">_</span>
          </div>
        )}

        {/* Stalled progress bar */}
        {showProgressBar && <StalledProgressBar />}
      </div>

      {/* Scanline overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(255, 255, 255, 0.03) 2px,
            rgba(255, 255, 255, 0.03) 4px
          )`,
        }}
      />
    </div>
  )
}
