import { Hero } from '@/components/home/Hero'
import { Manifesto } from '@/components/home/Manifesto'
import { PerspectiveGrid } from '@/components/canvas/PerspectiveGrid'
import { TransmissionPanel } from '@/components/events/TransmissionPanel'

export default function HomePage() {
  return (
    <div className="relative min-h-screen flex flex-col">
      <div className="flex-grow">
        <Hero />
        <TransmissionPanel />
        <Manifesto />
      </div>
      <PerspectiveGrid />
    </div>
  )
}
