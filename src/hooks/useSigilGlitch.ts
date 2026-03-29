'use client'

// Separate file to avoid importing Three.js on server
// This module can be safely imported anywhere

let glitchIntensity = 0
let dangerLevel: 0 | 1 | 2 | 3 = 0 // 0=safe, 1=warning, 2=alert, 3=critical
let dangerDecayTimer: NodeJS.Timeout | null = null
const listeners: Set<() => void> = new Set()

export function triggerSigilGlitch(intensity = 1, duration = 200) {
  glitchIntensity = intensity
  listeners.forEach(fn => fn())

  setTimeout(() => {
    glitchIntensity = 0
    listeners.forEach(fn => fn())
  }, duration)
}

export function getGlitchIntensity() {
  return glitchIntensity
}

// Danger level state - triggers global screen corruption
export function setDangerLevel(level: 0 | 1 | 2 | 3, autoClear = true) {
  // Clear any existing decay timer
  if (dangerDecayTimer) {
    clearTimeout(dangerDecayTimer)
    dangerDecayTimer = null
  }

  dangerLevel = level
  listeners.forEach(fn => fn())

  // Auto-decay back to 0 after delay (scales with severity)
  if (autoClear && level > 0) {
    const decayDelay = level === 3 ? 3000 : level === 2 ? 2000 : 1500
    dangerDecayTimer = setTimeout(() => {
      dangerLevel = 0
      listeners.forEach(fn => fn())
    }, decayDelay)
  }
}

export function getDangerLevel() {
  return dangerLevel
}

export function onGlitchChange(callback: () => void) {
  listeners.add(callback)
  return () => listeners.delete(callback)
}
