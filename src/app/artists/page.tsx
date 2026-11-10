import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Artists',
  description: "SIREN, IBLIIIZ, AN'SHE and JUNVON played the first Kamikaze room. We book on merit and take demos through the site.",
  alternates: { canonical: '/artists/' },
}

export default function Artists() {
  return (
    <div className="wrap">
      <h1 className="rit">Artists</h1>
    </div>
  )
}
