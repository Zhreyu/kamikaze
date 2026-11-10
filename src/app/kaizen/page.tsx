import type { Metadata } from 'next'
import dynamic from 'next/dynamic'

// Not linked from anywhere and kept out of search and the sitemap. Access control is Supabase Auth + RLS, not the URL.
export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
}

// Its own chunk, so supabase-js is downloaded on this route only.
const Admin = dynamic(() => import('@/components/kaizen/Admin'))

export default function Kaizen() {
  return <Admin />
}
