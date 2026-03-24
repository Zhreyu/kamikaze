import type { Metadata } from 'next'
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
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-void text-white min-h-screen overflow-x-hidden">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
