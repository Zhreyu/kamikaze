export type Genre =
  | 'INDUSTRIAL_BOUNCE'
  | 'DARK_TECHNO'
  | 'ACID'
  | 'HARDCORE'
  | 'GABBER'
  | 'BREAKCORE'
  | 'EBM'
  | 'NOISE'
  | 'AMBIENT_DRONE'

export interface Signal {
  id: string
  timestamp: string
  genre: Genre
  soundcloudUrl: string
  alias?: string
}

// Genre frequency configurations for the FrequencySigil
export const GENRE_FREQUENCIES: Record<
  Genre,
  { curl: number; speed: number; color: string; intensity: number }
> = {
  INDUSTRIAL_BOUNCE: { curl: 2.5, speed: 0.8, color: '#cc0000', intensity: 0.7 },
  DARK_TECHNO: { curl: 1.2, speed: 0.4, color: '#660000', intensity: 0.5 },
  ACID: { curl: 4.0, speed: 1.2, color: '#00cc44', intensity: 0.9 },
  HARDCORE: { curl: 5.0, speed: 2.0, color: '#ff0000', intensity: 1.0 },
  GABBER: { curl: 6.0, speed: 2.5, color: '#ff3300', intensity: 1.0 },
  BREAKCORE: { curl: 8.0, speed: 3.0, color: '#ff00ff', intensity: 0.95 },
  EBM: { curl: 1.8, speed: 0.6, color: '#333399', intensity: 0.6 },
  NOISE: { curl: 10.0, speed: 4.0, color: '#ffffff', intensity: 1.0 },
  AMBIENT_DRONE: { curl: 0.3, speed: 0.1, color: '#003366', intensity: 0.2 },
}

// Generate a pseudo-random ID from a seed string
function generateId(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash).toString(36).toUpperCase().slice(0, 6)
}

// Static signals - visual concept data
export const signals: Signal[] = [
  {
    id: generateId('sig001'),
    timestamp: '14:22:01',
    genre: 'INDUSTRIAL_BOUNCE',
    soundcloudUrl: 'https://soundcloud.com/signal/001',
    alias: 'VOID_FREQ',
  },
  {
    id: generateId('sig002'),
    timestamp: '09:15:33',
    genre: 'DARK_TECHNO',
    soundcloudUrl: 'https://soundcloud.com/signal/002',
  },
  {
    id: generateId('sig003'),
    timestamp: '23:45:12',
    genre: 'ACID',
    soundcloudUrl: 'https://soundcloud.com/signal/003',
    alias: 'CORROSIVE',
  },
  {
    id: generateId('sig004'),
    timestamp: '02:08:44',
    genre: 'HARDCORE',
    soundcloudUrl: 'https://soundcloud.com/signal/004',
  },
  {
    id: generateId('sig005'),
    timestamp: '17:33:09',
    genre: 'GABBER',
    soundcloudUrl: 'https://soundcloud.com/signal/005',
    alias: 'PULSE_WRECK',
  },
  {
    id: generateId('sig006'),
    timestamp: '06:12:55',
    genre: 'EBM',
    soundcloudUrl: 'https://soundcloud.com/signal/006',
  },
  {
    id: generateId('sig007'),
    timestamp: '11:59:59',
    genre: 'BREAKCORE',
    soundcloudUrl: 'https://soundcloud.com/signal/007',
    alias: 'SHATTER_SYS',
  },
  {
    id: generateId('sig008'),
    timestamp: '20:01:17',
    genre: 'NOISE',
    soundcloudUrl: 'https://soundcloud.com/signal/008',
  },
  {
    id: generateId('sig009'),
    timestamp: '04:44:44',
    genre: 'AMBIENT_DRONE',
    soundcloudUrl: 'https://soundcloud.com/signal/009',
    alias: 'DEPTH_SIGNAL',
  },
  {
    id: generateId('sig010'),
    timestamp: '15:27:38',
    genre: 'INDUSTRIAL_BOUNCE',
    soundcloudUrl: 'https://soundcloud.com/signal/010',
  },
  {
    id: generateId('sig011'),
    timestamp: '08:03:21',
    genre: 'DARK_TECHNO',
    soundcloudUrl: 'https://soundcloud.com/signal/011',
    alias: 'NULL_ZONE',
  },
  {
    id: generateId('sig012'),
    timestamp: '19:48:56',
    genre: 'HARDCORE',
    soundcloudUrl: 'https://soundcloud.com/signal/012',
  },
]

export function getSignals(): Signal[] {
  return signals
}

export function getSignalById(id: string): Signal | undefined {
  return signals.find((s) => s.id === id)
}
