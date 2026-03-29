'use client'

import { MerchItem } from '@/data/merch'
import { MerchCard } from './MerchCard'

interface MerchGridProps {
  items: MerchItem[]
  onAddToCart: (item: MerchItem, size: string) => void
  onSelectItem: (item: MerchItem) => void
}

export function MerchGrid({ items, onAddToCart, onSelectItem }: MerchGridProps) {
  return (
    <div className="max-w-7xl mx-auto px-6 pb-32">
      {/* Filter/sort bar */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/30/20">
        <div className="flex items-center gap-6">
          <button className="font-mono text-xs text-white border-b border-arterial pb-1">
            ALL
          </button>
          <button className="font-mono text-xs text-white/50 hover:text-white/70 transition-colors">
            APPAREL
          </button>
          <button className="font-mono text-xs text-white/50 hover:text-white/70 transition-colors">
            ACCESSORY
          </button>
        </div>
        <div className="font-mono text-[10px] text-white/50">
          {items.length} UNITS_AVAILABLE
        </div>
      </div>

      {/* Asymmetric grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
        {items.map((item, index) => (
          <MerchCard
            key={item.id}
            item={item}
            index={index}
            onAddToCart={onAddToCart}
            onSelect={onSelectItem}
          />
        ))}
      </div>
    </div>
  )
}
