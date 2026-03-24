'use client'

// Audio Engine - Hybrid approach:
// 1. For local files: Full Web Audio API with frequency analysis
// 2. For SoundCloud: Widget API + BPM-based fake visualization

interface AudioEngineState {
  mode: 'local' | 'soundcloud' | 'idle'
  isInitialized: boolean
  isPlaying: boolean
  currentTrack: number
  volume: number
  bpm: number
  // Local mode only
  audioContext: AudioContext | null
  analyzer: AnalyserNode | null
  frequencyData: Uint8Array
}

// Global state
const state: AudioEngineState = {
  mode: 'idle',
  isInitialized: false,
  isPlaying: false,
  currentTrack: 0,
  volume: 0.7,
  bpm: 140, // Default techno BPM
  audioContext: null,
  analyzer: null,
  frequencyData: new Uint8Array(128),
}

const listeners: Set<() => void> = new Set()
let beatPhase = 0
let lastBeatTime = 0

// SoundCloud configuration
export const SOUNDCLOUD_PLAYLIST = 'https://soundcloud.com/neeraj-hari-839626007/sets/4-akedo-final'

// Track list for local mode (optional)
export const LOCAL_TRACKS = [
  { title: 'SIGNAL_01', artist: 'KAMIKAZE', src: '/audio/track1.mp3' },
]

let audioElement: HTMLAudioElement | null = null
let scWidget: any = null
let scIframe: HTMLIFrameElement | null = null

// ============================================
// INITIALIZATION
// ============================================

export function initAudioEngine(): boolean {
  if (state.isInitialized) return true
  if (typeof window === 'undefined') return false

  // Default to SoundCloud mode (more reliable)
  state.mode = 'soundcloud'
  state.isInitialized = true
  notifyListeners()

  return true
}

// Initialize SoundCloud widget (call from component that renders iframe)
export function initSoundCloudWidget(iframe: HTMLIFrameElement) {
  if (!iframe || !window.SC?.Widget) return

  scIframe = iframe
  scWidget = window.SC.Widget(iframe)

  scWidget.bind(window.SC.Widget.Events.READY, () => {
    state.isInitialized = true
    notifyListeners()
  })

  scWidget.bind(window.SC.Widget.Events.PLAY, () => {
    state.isPlaying = true
    lastBeatTime = performance.now()
    notifyListeners()
  })

  scWidget.bind(window.SC.Widget.Events.PAUSE, () => {
    state.isPlaying = false
    notifyListeners()
  })

  scWidget.bind(window.SC.Widget.Events.FINISH, () => {
    state.isPlaying = false
    notifyListeners()
  })
}

// ============================================
// PLAYBACK CONTROLS
// ============================================

export function play() {
  if (state.mode === 'soundcloud' && scWidget) {
    scWidget.play()
  } else if (audioElement) {
    audioElement.play()
  }
}

export function pause() {
  if (state.mode === 'soundcloud' && scWidget) {
    scWidget.pause()
  } else if (audioElement) {
    audioElement.pause()
  }
}

export function toggle() {
  if (state.isPlaying) {
    pause()
  } else {
    play()
  }
}

export function nextTrack() {
  if (state.mode === 'soundcloud' && scWidget) {
    scWidget.next()
  }
}

export function prevTrack() {
  if (state.mode === 'soundcloud' && scWidget) {
    scWidget.prev()
  }
}

export function setVolume(vol: number) {
  state.volume = Math.max(0, Math.min(1, vol))
  if (state.mode === 'soundcloud' && scWidget) {
    scWidget.setVolume(vol * 100)
  } else if (audioElement) {
    audioElement.volume = state.volume
  }
  notifyListeners()
}

export function setBPM(bpm: number) {
  state.bpm = Math.max(60, Math.min(200, bpm))
}

// ============================================
// FREQUENCY DATA (BPM-based simulation for SoundCloud)
// ============================================

// Generate fake frequency data based on BPM
// This creates a pulsing effect synced to the expected beat
function generateBPMBasedFrequency(): void {
  if (!state.isPlaying) {
    state.frequencyData.fill(0)
    return
  }

  const now = performance.now()
  const beatDuration = 60000 / state.bpm // ms per beat
  const timeSinceBeat = (now - lastBeatTime) % beatDuration
  beatPhase = timeSinceBeat / beatDuration

  // Simulate kick drum on each beat (sharp attack, quick decay)
  const kickEnvelope = beatPhase < 0.1
    ? 1 - (beatPhase / 0.1) // Quick decay
    : beatPhase > 0.9
    ? (beatPhase - 0.9) / 0.1 * 0.5 // Anticipation
    : 0

  // Simulate hi-hat on off-beats
  const hihatPhase = (beatPhase + 0.5) % 1
  const hihatEnvelope = hihatPhase < 0.05 ? 1 - (hihatPhase / 0.05) : 0

  // Fill frequency data
  for (let i = 0; i < state.frequencyData.length; i++) {
    if (i < 10) {
      // Bass frequencies - kick drum
      state.frequencyData[i] = Math.floor(kickEnvelope * 255 * (1 - i / 10))
    } else if (i < 30) {
      // Mid frequencies - some movement
      const mid = Math.sin(now / 200 + i) * 0.3 + 0.2
      state.frequencyData[i] = Math.floor(mid * 128)
    } else {
      // High frequencies - hi-hats
      state.frequencyData[i] = Math.floor(hihatEnvelope * 200 * Math.random())
    }
  }
}

export function getFrequencyData(): Uint8Array {
  if (state.mode === 'soundcloud') {
    generateBPMBasedFrequency()
  } else if (state.analyzer && state.isPlaying) {
    state.analyzer.getByteFrequencyData(state.frequencyData)
  }
  return state.frequencyData
}

// Get specific frequency bands
export function getBass(): number {
  const data = getFrequencyData()
  const sum = data[0] + data[1] + data[2] + data[3]
  return sum / 4 / 255
}

export function getMids(): number {
  const data = getFrequencyData()
  let sum = 0
  for (let i = 10; i < 30; i++) {
    sum += data[i]
  }
  return sum / 20 / 255
}

export function getHighs(): number {
  const data = getFrequencyData()
  let sum = 0
  for (let i = 50; i < 80; i++) {
    sum += data[i]
  }
  return sum / 30 / 255
}

// ============================================
// STATE GETTERS
// ============================================

export function getAudioState() {
  return {
    mode: state.mode,
    isInitialized: state.isInitialized,
    isPlaying: state.isPlaying,
    currentTrack: state.currentTrack,
    volume: state.volume,
    bpm: state.bpm,
  }
}

export function getProgress(): number {
  // For SoundCloud, we'd need to query the widget
  // Return 0 for now, the component can handle this
  return 0
}

// ============================================
// SUBSCRIPTIONS
// ============================================

function notifyListeners() {
  listeners.forEach((fn) => fn())
}

export function onAudioChange(callback: () => void) {
  listeners.add(callback)
  return () => listeners.delete(callback)
}

// ============================================
// TYPE DECLARATIONS
// ============================================

declare global {
  interface Window {
    SC?: {
      Widget: {
        (iframe: HTMLIFrameElement): any
        Events: {
          READY: string
          PLAY: string
          PAUSE: string
          FINISH: string
          PLAY_PROGRESS: string
        }
      }
    }
  }
}
