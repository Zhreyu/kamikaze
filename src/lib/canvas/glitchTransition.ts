export class GlitchTransition {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private animationFrame: number | null = null

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Could not get canvas context')
    this.ctx = ctx
    this.resize()
    window.addEventListener('resize', () => this.resize())
  }

  private resize(): void {
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
  }

  // Simple glitch out - horizontal slices with RGB split
  async glitchOut(duration: number = 400): Promise<void> {
    return new Promise((resolve) => {
      const startTime = performance.now()

      const animate = (timestamp: number) => {
        const elapsed = timestamp - startTime
        const progress = Math.min(elapsed / duration, 1)
        const intensity = Math.pow(progress, 1.5)

        const { width, height } = this.canvas
        this.ctx.fillStyle = '#000'
        this.ctx.fillRect(0, 0, width, height)

        // Horizontal glitch slices
        const sliceCount = 12
        const sliceHeight = height / sliceCount

        for (let i = 0; i < sliceCount; i++) {
          const y = i * sliceHeight
          const offset = (Math.random() - 0.5) * intensity * 80

          // Red slice
          this.ctx.fillStyle = `rgba(204, 0, 0, ${0.4 * intensity})`
          this.ctx.fillRect(offset - 10, y, width, sliceHeight * 0.8)

          // Cyan slice
          this.ctx.fillStyle = `rgba(0, 255, 255, ${0.3 * intensity})`
          this.ctx.fillRect(offset + 10, y, width, sliceHeight * 0.8)
        }

        // Random noise lines
        for (let i = 0; i < 5 * intensity; i++) {
          const y = Math.random() * height
          this.ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.15})`
          this.ctx.fillRect(0, y, width, 2)
        }

        // Scanlines
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
        for (let y = 0; y < height; y += 3) {
          this.ctx.fillRect(0, y, width, 1)
        }

        // Fade to black
        this.ctx.fillStyle = `rgba(0, 0, 0, ${progress * 0.7})`
        this.ctx.fillRect(0, 0, width, height)

        if (progress < 1) {
          this.animationFrame = requestAnimationFrame(animate)
        } else {
          this.ctx.fillStyle = '#000'
          this.ctx.fillRect(0, 0, width, height)
          resolve()
        }
      }

      this.animationFrame = requestAnimationFrame(animate)
    })
  }

  // Simple glitch in - reverse effect
  async glitchIn(duration: number = 350): Promise<void> {
    return new Promise((resolve) => {
      const startTime = performance.now()

      const animate = (timestamp: number) => {
        const elapsed = timestamp - startTime
        const progress = Math.min(elapsed / duration, 1)
        const intensity = 1 - Math.pow(progress, 0.5)

        const { width, height } = this.canvas

        if (intensity > 0.05) {
          this.ctx.fillStyle = '#000'
          this.ctx.fillRect(0, 0, width, height)

          // Fading glitch slices
          const sliceCount = 8
          const sliceHeight = height / sliceCount

          for (let i = 0; i < sliceCount; i++) {
            const y = i * sliceHeight
            const offset = (Math.random() - 0.5) * intensity * 50

            this.ctx.fillStyle = `rgba(204, 0, 0, ${0.3 * intensity})`
            this.ctx.fillRect(offset, y, width, sliceHeight * 0.6)

            this.ctx.fillStyle = `rgba(0, 255, 255, ${0.2 * intensity})`
            this.ctx.fillRect(-offset, y, width, sliceHeight * 0.6)
          }

          // Fade from black
          this.ctx.fillStyle = `rgba(0, 0, 0, ${intensity})`
          this.ctx.fillRect(0, 0, width, height)
        } else {
          this.clear()
        }

        if (progress < 1) {
          this.animationFrame = requestAnimationFrame(animate)
        } else {
          this.clear()
          resolve()
        }
      }

      this.animationFrame = requestAnimationFrame(animate)
    })
  }

  clear(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }

  stop(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
      this.animationFrame = null
    }
  }
}
