'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import clsx from 'clsx'
import {
  initAudioEngine,
  initSoundCloudWidget,
  play,
  pause,
  toggle,
  nextTrack,
  prevTrack,
  setVolume,
  setBPM,
  getAudioState,
  getFrequencyData,
  onAudioChange,
  SOUNDCLOUD_PLAYLIST,
} from '@/hooks/useAudioEngine'

export function TerminalAudioPlayer() {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [state, setState] = useState(getAudioState)
  const [isExpanded, setIsExpanded] = useState(false)
  const [bars, setBars] = useState<number[]>(new Array(16).fill(0.1))
  const [trackTitle, setTrackTitle] = useState('LOADING...')
  const [scReady, setScReady] = useState(false)
  const animationRef = useRef<number>(0)

  // Load SoundCloud Widget API script
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://w.soundcloud.com/player/api.js'
    script.async = true
    script.onload = () => {
      // Initialize audio engine
      initAudioEngine()

      // Wait for iframe and initialize widget
      if (iframeRef.current && window.SC?.Widget) {
        const widget = window.SC.Widget(iframeRef.current)

        widget.bind(window.SC.Widget.Events.READY, () => {
          setScReady(true)
          initSoundCloudWidget(iframeRef.current!)
        })

        widget.bind(window.SC.Widget.Events.PLAY, () => {
          widget.getCurrentSound((sound: any) => {
            if (sound?.title) {
              setTrackTitle(sound.title.toUpperCase())
            }
          })
        })
      }
    }
    document.body.appendChild(script)

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [])

  // Subscribe to audio state changes
  useEffect(() => {
    return onAudioChange(() => {
      setState(getAudioState())
    })
  }, [])

  // Animate frequency bars
  useEffect(() => {
    const updateBars = () => {
      const freqData = getFrequencyData()
      const newBars: number[] = []

      // Sample 16 frequency bands
      const bandSize = Math.floor(freqData.length / 16)
      for (let i = 0; i < 16; i++) {
        let sum = 0
        for (let j = 0; j < bandSize; j++) {
          sum += freqData[i * bandSize + j]
        }
        newBars.push(sum / bandSize / 255)
      }

      setBars(newBars)
      animationRef.current = requestAnimationFrame(updateBars)
    }

    updateBars()
    return () => cancelAnimationFrame(animationRef.current)
  }, [])

  const handlePlayPause = useCallback(() => {
    toggle()
  }, [])

  // SoundCloud embed URL (hidden)
  const embedUrl = `https://w.soundcloud.com/player/?url=${encodeURIComponent(SOUNDCLOUD_PLAYLIST)}&color=%23CC0000&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=false`

  return (
    <div
      className={clsx(
        'fixed bottom-4 left-4 z-50',
        'font-mono text-[10px]',
        'border border-arterial/30 bg-void/95',
        'transition-all duration-300',
        isExpanded ? 'w-72' : 'w-44'
      )}
    >
      {/* Hidden SoundCloud iframe */}
      <iframe
        ref={iframeRef}
        src={embedUrl}
        className="hidden"
        allow="autoplay"
        title="Audio Stream"
      />

      {/* Terminal header */}
      <div
        className="flex items-center justify-between px-2 py-1 border-b border-arterial/20 cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-1.5">
          <span className={clsx('text-[8px]', state.isPlaying ? 'text-arterial animate-pulse' : 'text-grey-dark')}>
            {state.isPlaying ? '[LIVE]' : '[IDLE]'}
          </span>
          <span className="text-grey-mid">AUDIO_TAP</span>
        </div>
        <span className="text-grey-dark">{isExpanded ? '[-]' : '[+]'}</span>
      </div>

      {/* Frequency visualizer - 8-bit blocky style */}
      <div className="flex items-end justify-between h-8 px-2 py-1 gap-px bg-black/50">
        {bars.map((height, i) => (
          <div
            key={i}
            className={clsx(
              'w-full transition-all duration-75',
              state.isPlaying ? 'bg-arterial' : 'bg-grey-dark/50'
            )}
            style={{
              height: `${Math.max(8, height * 100)}%`,
              opacity: state.isPlaying ? 0.4 + height * 0.6 : 0.3,
            }}
          />
        ))}
      </div>

      {/* Track info */}
      <div className="px-2 py-1.5">
        <div className="text-white/90 truncate tracking-wider">
          {scReady ? trackTitle : 'CONNECTING...'}
        </div>
        <div className="text-grey-dark truncate">
          {state.bpm} BPM
        </div>
      </div>

      {/* Expanded controls */}
      {isExpanded && (
        <div className="px-2 py-2 border-t border-arterial/10 mt-1">
          {/* Transport controls */}
          <div className="flex items-center justify-center gap-3 mb-2">
            <button
              onClick={prevTrack}
              className="text-grey-mid hover:text-arterial transition-colors"
              title="Previous"
            >
              |&lt;
            </button>
            <button
              onClick={handlePlayPause}
              className={clsx(
                'px-3 py-1 border transition-colors',
                state.isPlaying
                  ? 'border-arterial text-arterial hover:bg-arterial/10'
                  : 'border-grey-mid text-grey-mid hover:border-arterial hover:text-arterial'
              )}
            >
              {state.isPlaying ? 'PAUSE' : 'PLAY_'}
            </button>
            <button
              onClick={nextTrack}
              className="text-grey-mid hover:text-arterial transition-colors"
              title="Next"
            >
              &gt;|
            </button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-2 text-[8px] mb-2">
            <span className="text-grey-dark">VOL:</span>
            <div className="flex-1 flex gap-px">
              {[...Array(10)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setVolume((i + 1) / 10)}
                  className={clsx(
                    'flex-1 h-2 transition-colors',
                    i < state.volume * 10
                      ? 'bg-arterial/70 hover:bg-arterial'
                      : 'bg-grey-dark/30 hover:bg-grey-dark/50'
                  )}
                />
              ))}
            </div>
            <span className="text-grey-mid w-6 text-right">
              {Math.round(state.volume * 100)}%
            </span>
          </div>

          {/* BPM control */}
          <div className="flex items-center gap-2 text-[8px]">
            <span className="text-grey-dark">BPM:</span>
            <div className="flex gap-1">
              {[120, 130, 140, 150, 160].map((bpm) => (
                <button
                  key={bpm}
                  onClick={() => setBPM(bpm)}
                  className={clsx(
                    'px-1 py-0.5 transition-colors',
                    state.bpm === bpm
                      ? 'bg-arterial/50 text-white'
                      : 'text-grey-mid hover:text-arterial'
                  )}
                >
                  {bpm}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Collapsed mini controls */}
      {!isExpanded && (
        <div className="flex items-center justify-center gap-2 px-2 py-1.5">
          <button
            onClick={handlePlayPause}
            className="text-arterial hover:text-white transition-colors"
          >
            {state.isPlaying ? '[||]' : '[>]'}
          </button>
          <button
            onClick={nextTrack}
            className="text-grey-mid hover:text-arterial transition-colors text-[8px]"
          >
            SKIP&gt;
          </button>
        </div>
      )}
    </div>
  )
}
