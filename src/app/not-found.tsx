import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Page not found', description: 'There is no page at this address.' }

export default function NotFound() {
  return (
    <div className="wrap">
      <h1 className="rit">Wrong room</h1>
    </div>
  )
}
