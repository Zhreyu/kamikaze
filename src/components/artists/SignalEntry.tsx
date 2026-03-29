'use client'

import { useState } from 'react'
import { Signal } from '@/data/signals'
import { setActiveFrequency } from '@/components/canvas/AsciiSigil'
import clsx from 'clsx'

interface SignalEntryProps {
  signal: Signal
  index: number
}

export function SignalEntry({ signal, index }: SignalEntryProps) {
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseEnter = () => {
    setIsHovered(true)
    setActiveFrequency(signal.genre, true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setActiveFrequency(null, false)
  }

  // Format genre for display (replace underscores with spaces)
  const genreDisplay = signal.genre.replace(/_/g, ' ')

  return (
    <div
      className={clsx(
        'group relative py-3 px-4 border-b border-white/20',
        'transition-all duration-200',
        'hover:bg-white/[0.02] hover:border-arterial/30'
      )}
    >
      {/* Scan line effect on hover */}
      {isHovered && (
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden"
          style={{
            background: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(204, 0, 0, 0.03) 2px,
              rgba(204, 0, 0, 0.03) 4px
            )`,
          }}
        />
      )}

      <div className="relative flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-x-4 font-mono text-sm">
        {/* Metadata group - wraps together on mobile */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {/* ID */}
          <span className="text-white/50">
            ID: <span className="text-white/70">#{signal.id}</span>
          </span>

          {/* Separator */}
          <span className="text-white/30 hidden sm:inline">|</span>

          {/* Timestamp */}
          <span className="text-white/50">
            <span className="text-white/70">{signal.timestamp}</span>
          </span>

          {/* Separator */}
          <span className="text-white/30 hidden sm:inline">|</span>

          {/* Genre */}
          <span
            className={clsx(
              'uppercase tracking-wider transition-colors duration-200',
              isHovered ? 'text-arterial' : 'text-white/70'
            )}
          >
            {genreDisplay}
          </span>

          {/* Alias (if present) */}
          {signal.alias && (
            <>
              <span className="text-white/30 hidden sm:inline">|</span>
              <span className="text-white/50">
                ALIAS: <span className="text-white/70">{signal.alias}</span>
              </span>
            </>
          )}
        </div>

        {/* Spacer - only on desktop */}
        <div className="hidden sm:block sm:flex-1" />

        {/* Listen Link */}
        <a
          href={signal.soundcloudUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={clsx(
            'relative px-4 py-3 min-h-[44px] border transition-all duration-200',
            'font-mono text-xs tracking-widest inline-flex items-center self-start sm:self-auto',
            isHovered
              ? 'border-arterial text-arterial bg-arterial/10'
              : 'border-white/40 text-white/70 hover:text-white focus:ring-2 focus:ring-arterial focus:outline-none'
          )}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleMouseEnter}
          onFocus={handleMouseEnter}
          onBlur={handleMouseLeave}
        >
          {/* Glitch effect on hover */}
          {isHovered && (
            <>
              <span
                className="absolute inset-0 flex items-center justify-center text-cyan-400/50"
                style={{ transform: 'translate(-2px, -1px)' }}
              >
                [ LISTEN ]
              </span>
              <span
                className="absolute inset-0 flex items-center justify-center text-red-500/50"
                style={{ transform: 'translate(2px, 1px)' }}
              >
                [ LISTEN ]
              </span>
            </>
          )}
          <span className="relative">[ LISTEN ]</span>
        </a>
      </div>

      {/* Index indicator */}
      <div
        className={clsx(
          'absolute left-0 top-0 bottom-0 w-1 transition-all duration-300',
          isHovered ? 'bg-arterial' : 'bg-transparent'
        )}
      />
    </div>
  )
}
