export interface MerchItem {
  id: string
  serial: string
  name: string
  description: string
  price: number
  currency: string
  images: string[]
  sizes: string[]
  stock: 'HIGH' | 'LOW' | 'CRITICAL' | 'DEPLETED'
  fabric?: string
  category: 'APPAREL' | 'ACCESSORY' | 'ARTIFACT'
  signal: number // 1-10 "hype" rating
  releaseDate: string
}

export const merchItems: MerchItem[] = [
  {
    id: 'kmkz-001',
    serial: 'KMKZ-001',
    name: 'VOID_HOODIE_V1',
    description: 'Heavyweight cotton fleece. Oversized fit. Embroidered sigil on back. For those who dwell in the frequencies.',
    price: 75,
    currency: 'EUR',
    images: [
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80',
      'https://images.unsplash.com/photo-1578681994506-b8f463449011?w=800&q=80',
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    stock: 'LOW',
    fabric: '400GSM COTTON FLEECE',
    category: 'APPAREL',
    signal: 9,
    releaseDate: '2024-01-15',
  },
  {
    id: 'kmkz-002',
    serial: 'KMKZ-002',
    name: 'SIGNAL_TEE_BLK',
    description: 'Premium heavyweight tee. Screen-printed transmission codes. Washed black finish.',
    price: 45,
    currency: 'EUR',
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80',
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 'HIGH',
    fabric: '300GSM COTTON',
    category: 'APPAREL',
    signal: 7,
    releaseDate: '2024-02-01',
  },
  {
    id: 'kmkz-003',
    serial: 'KMKZ-003',
    name: 'ARTERIAL_CAP',
    description: 'Six-panel cap. Embroidered coordinates. Adjustable strap. Blood red accent stitching.',
    price: 35,
    currency: 'EUR',
    images: [
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&q=80',
    ],
    sizes: ['ONE SIZE'],
    stock: 'CRITICAL',
    category: 'ACCESSORY',
    signal: 8,
    releaseDate: '2024-01-20',
  },
  {
    id: 'kmkz-004',
    serial: 'KMKZ-004',
    name: 'CARGO_PANTS_V2',
    description: 'Tactical cargo pants. Multiple utility pockets. Tapered fit. Reflective details.',
    price: 95,
    currency: 'EUR',
    images: [
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80',
    ],
    sizes: ['28', '30', '32', '34', '36'],
    stock: 'LOW',
    fabric: 'RIPSTOP NYLON',
    category: 'APPAREL',
    signal: 9,
    releaseDate: '2024-03-01',
  },
  {
    id: 'kmkz-005',
    serial: 'KMKZ-005',
    name: 'FREQUENCY_LONGSLEEVE',
    description: 'Oversized long sleeve. Distressed graphics. Raw hem finish. Signals from the underground.',
    price: 55,
    currency: 'EUR',
    images: [
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80',
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 'HIGH',
    fabric: '280GSM COTTON',
    category: 'APPAREL',
    signal: 6,
    releaseDate: '2024-02-15',
  },
  {
    id: 'kmkz-006',
    serial: 'KMKZ-006',
    name: 'SIGIL_TOTE',
    description: 'Heavy canvas tote. Screen-printed sigil. Reinforced straps. Carry the signal.',
    price: 25,
    currency: 'EUR',
    images: [
      'https://images.unsplash.com/photo-1597633125097-5a9ae51a30da?w=800&q=80',
    ],
    sizes: ['ONE SIZE'],
    stock: 'HIGH',
    category: 'ACCESSORY',
    signal: 5,
    releaseDate: '2024-01-10',
  },
  {
    id: 'kmkz-007',
    serial: 'KMKZ-007',
    name: 'BOMBER_JACKET_MK1',
    description: 'MA-1 style bomber. Embroidered patches. Satin lining. For cold transmissions.',
    price: 145,
    currency: 'EUR',
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80',
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 'CRITICAL',
    fabric: 'NYLON SHELL / POLYESTER FILL',
    category: 'APPAREL',
    signal: 10,
    releaseDate: '2024-03-15',
  },
  {
    id: 'kmkz-008',
    serial: 'KMKZ-008',
    name: 'TRANSMISSION_BEANIE',
    description: 'Ribbed knit beanie. Woven label. One size fits all frequencies.',
    price: 28,
    currency: 'EUR',
    images: [
      'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800&q=80',
    ],
    sizes: ['ONE SIZE'],
    stock: 'HIGH',
    category: 'ACCESSORY',
    signal: 6,
    releaseDate: '2024-01-25',
  },
]

export interface CartItem {
  item: MerchItem
  size: string
  quantity: number
}
