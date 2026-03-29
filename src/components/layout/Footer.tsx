'use client'

import { contactInfo } from '@/data/moto'
import { SignalStrengthLink } from './SignalStrengthLink'
import { DataStreamBar } from './DataStreamBar'
import { AscendButton } from './AscendButton'
import { MarqueeGlitch } from '@/components/effects/MarqueeGlitch'

export function Footer() {
  return (
    <footer className="relative z-[100] bg-black">
      {/* NO VIP Warning Banner - Marquee Glitch */}
      <div className="relative bg-arterial/5 border-y border-arterial/20 py-3">
        <MarqueeGlitch
          text="[!] WARNING: NO VIP. NO BACKSTAGE. ONE SOUL. ONE TICKET. ONE DANCEFLOOR."
          className="font-mono text-[10px] sm:text-xs tracking-widest text-arterial"
          speed={40}
          glitchInterval={2500}
        />
        {/* Subtle scanline */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            background: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(204, 0, 0, 0.1) 2px,
              rgba(204, 0, 0, 0.1) 4px
            )`,
          }}
        />
      </div>

      {/* Data Stream Status Bar */}
      <DataStreamBar />

      {/* Main Footer Content */}
      <div className="py-10 px-6 border-t border-[#9f9fa9]/20">
        <div className="max-w-7xl mx-auto">
          {/* Top Row: Signal Strength Socials */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-8">
              <SignalStrengthLink
                href={contactInfo.instagramUrl}
                label="IG"
                strength={3}
              />
              <SignalStrengthLink
                href="https://soundcloud.com/kamikaze-events"
                label="SC"
                strength={7}
              />
            </div>

            <a
              href={`mailto:${contactInfo.email}`}
              className="font-mono text-xs text-[#9f9fa9] hover:text-arterial transition-colors"
            >
              {contactInfo.email}
            </a>
          </div>

          {/* Bottom Row: Copyright & Location */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#9f9fa9]/10">
            <div className="font-mono text-[10px] text-[#9f9fa9] tracking-wider">
              &copy; {new Date().getFullYear()} KAMIKAZE
              <span className="mx-3 text-[#9f9fa9]/40">{'//'}</span>
              GLOBAL
              <span className="mx-3 text-[#9f9fa9]/40">{'//'}</span>
              STAY_UNDERGROUND
            </div>

            <AscendButton />
          </div>
        </div>
      </div>
    </footer>
  )
}
