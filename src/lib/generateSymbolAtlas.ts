/**
 * Generate a texture atlas of tech symbols for the particle swarm
 * 512x512 canvas with 4x4 grid of symbols
 */

const TECH_SYMBOLS = [
  '\u25C7', // ◇ Diamond
  '\u27C1', // ⟁ Triangle
  '\u232C', // ⌬ Benzene ring
  '\u2394', // ⎔ Keyboard
  '\u2573', // ╳ X mark
  '\u25C8', // ◈ Diamond with dot
  '\u2B21', // ⬡ Hexagon
  '\u2316', // ⌖ Target
  '\u2295', // ⊕ Circle plus
  '\u2297', // ⊗ Circle X
  '\u2318', // ⌘ Command
  '\u2388', // ⎈ Helm
  '\u25B3', // △ Triangle up
  '\u25BD', // ▽ Triangle down
  '\u25C1', // ◁ Triangle left
  '\u25B7', // ▷ Triangle right
]

export function generateSymbolAtlas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')!

  // Clear with transparent black
  ctx.fillStyle = 'rgba(0, 0, 0, 0)'
  ctx.fillRect(0, 0, 512, 512)

  const cellSize = 128
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  TECH_SYMBOLS.forEach((symbol, i) => {
    const col = i % 4
    const row = Math.floor(i / 4)
    const x = col * cellSize + cellSize / 2
    const y = row * cellSize + cellSize / 2

    // Reset shadow for each symbol
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0

    // Outer glow layer
    ctx.font = '72px monospace'
    ctx.shadowColor = '#ff0000'
    ctx.shadowBlur = 20
    ctx.fillStyle = 'rgba(255, 0, 0, 0.3)'
    ctx.fillText(symbol, x, y)

    // Middle glow layer
    ctx.shadowColor = '#ff3333'
    ctx.shadowBlur = 10
    ctx.fillStyle = 'rgba(255, 100, 100, 0.5)'
    ctx.fillText(symbol, x, y)

    // Core symbol (white, crisp)
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.fillStyle = '#ffffff'
    ctx.fillText(symbol, x, y)
  })

  return canvas
}

export { TECH_SYMBOLS }
