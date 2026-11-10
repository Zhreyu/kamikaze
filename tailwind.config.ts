import type { Config } from 'tailwindcss'

// Tokens mirror :root in src/styles/globals.css. Component classes live there too.
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  // hover: utilities only apply where a real pointer can hover (no sticky hover on touch)
  future: { hoverOnlyWhenSupported: true },
  theme: {
    screens: { sm: '640px', md: '900px', lg: '1280px' },
    extend: {
      colors: {
        void: '#0a0a0a',
        bone: '#efefef',
        dim: 'rgba(239, 239, 239, 0.7)',
        red: '#cc0000',
        hot: '#ff3b30',
        hair: 'rgba(239, 239, 239, 0.16)',
        line: 'rgba(239, 239, 239, 0.4)',
      },
      fontFamily: {
        rit: ['var(--font-rit)', 'var(--font-archivo)', 'sans-serif'],
        sans: ['var(--font-archivo)', 'Arial', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
