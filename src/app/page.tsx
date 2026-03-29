import { Hero } from '@/components/home/Hero'
import { Manifesto } from '@/components/home/Manifesto'
import { TeaseCards } from '@/components/home/TeaseCards'
import { PerspectiveGrid } from '@/components/canvas/PerspectiveGrid'

export default function HomePage() {
  return (
    <div className="relative min-h-screen flex flex-col">
      <div className="flex-grow">
        <Hero />
        <Manifesto />
        <TeaseCards />
      </div>
      <PerspectiveGrid />
    </div>
  )
}
