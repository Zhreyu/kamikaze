import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { AppShell } from '@/components/layout/AppShell'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'KAMIKAZE | Underground Never Dies',
  description: 'We don\'t make music. We make ruptures. Underground techno events. The underground never dies.',
  keywords: ['techno', 'rave', 'underground', 'electronic music', 'IN', 'events', 'kamikaze'],
  openGraph: {
    title: 'KAMIKAZE',
    description: 'Underground. Uncompromising. Unrepeatable.',
    type: 'website',
  },
  icons: {
    icon: [
      { url: '/favicon/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon/favicon.ico',
    apple: { url: '/favicon/apple-touch-icon.png', sizes: '180x180' },
  },
  manifest: '/favicon/site.webmanifest',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Preload 3D assets for faster loading */}
        <link rel="preload" href="/draco/draco_decoder.wasm" as="fetch" crossOrigin="anonymous" />
        <link rel="preload" href="/logo.glb" as="fetch" crossOrigin="anonymous" />
      </head>
      <body className="bg-void text-white min-h-screen overflow-x-hidden">
        <AppShell>{children}</AppShell>
        <Analytics />
      </body>
    </html>
  )
}
