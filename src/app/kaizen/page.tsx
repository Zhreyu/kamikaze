import type { Metadata } from 'next'

// Not linked from anywhere and kept out of search and the sitemap. Access control is Supabase Auth + RLS, not the URL.
export const metadata: Metadata = {
  title: 'Kaizen',
  robots: { index: false, follow: false },
}

export default function Kaizen() {
  return (
    <div className="wrap">
      <h1 className="rit">Kaizen</h1>
    </div>
  )
}
