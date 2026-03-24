'use client'

import { useEffect } from 'react'
import { getAssetPath } from '@/lib/basePath'

export function FontLoader() {
  useEffect(() => {
    // Create @font-face rule with correct base path
    const fontUrl = getAssetPath('/sdcyberpunkcitydemo/SDCyberPunkCityDemo.otf')

    const style = document.createElement('style')
    style.textContent = `
      @font-face {
        font-family: 'CyberpunkCity';
        src: url('${fontUrl}') format('opentype');
        font-weight: 400;
        font-style: normal;
        font-display: swap;
      }
    `
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [])

  return null
}
