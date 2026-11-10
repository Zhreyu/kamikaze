import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy',
  description: 'What the pass and demo forms collect, where it is kept, what tracking runs on the site and how to get your details deleted.',
  alternates: { canonical: '/privacy/' },
}

export default function Privacy() {
  return (
    <div className="wrap">
      <h1 className="rit">Privacy</h1>
    </div>
  )
}
