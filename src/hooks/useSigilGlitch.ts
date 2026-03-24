'use client'

// Separate file to avoid importing Three.js on server
// This module can be safely imported anywhere

let glitchIntensity = 0
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

export function onGlitchChange(callback: () => void) {
  listeners.add(callback)
  return () => listeners.delete(callback)
}
