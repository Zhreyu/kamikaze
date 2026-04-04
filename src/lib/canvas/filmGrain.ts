export class FilmGrainRenderer {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private animationFrame: number | null = null
  private lastRender = 0
  private interval = 100 // ms between updates (was 50, doubled for perf)
  private scale = 4 // render at 1/4 resolution for major CPU savings

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Could not get canvas context')
    this.ctx = ctx
    // Bind resize handler for proper cleanup
    this.handleResize = this.handleResize.bind(this)
  }

  private handleResize(): void {
    // Render at reduced resolution (scaled up via CSS)
    this.canvas.width = Math.ceil(window.innerWidth / this.scale)
    this.canvas.height = Math.ceil(window.innerHeight / this.scale)
  }

  private renderGrain(): void {
    const { width, height } = this.canvas
    const imageData = this.ctx.createImageData(width, height)
    const data = imageData.data
    const len = data.length

    for (let i = 0; i < len; i += 4) {
      const noise = (Math.random() * 255) | 0 // bitwise OR for fast floor
      data[i] = noise     // R
      data[i + 1] = noise // G
      data[i + 2] = noise // B
      data[i + 3] = 8     // A (very low opacity)
    }

    this.ctx.putImageData(imageData, 0, 0)
  }

  private animate = (timestamp: number): void => {
    if (timestamp - this.lastRender >= this.interval) {
      this.renderGrain()
      this.lastRender = timestamp
    }
    this.animationFrame = requestAnimationFrame(this.animate)
  }

  start(): void {
    this.handleResize()
    window.addEventListener('resize', this.handleResize)
    this.animationFrame = requestAnimationFrame(this.animate)
  }

  stop(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
      this.animationFrame = null
    }
    window.removeEventListener('resize', this.handleResize)
  }

  setInterval(ms: number): void {
    this.interval = ms
  }
}
