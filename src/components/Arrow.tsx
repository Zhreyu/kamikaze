/** The 16px arrow from the design canvas. Decorative: the label beside it carries the meaning. */
export default function Arrow({ className = '' }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={`shrink-0 ${className}`} width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 8h11M9 4l4 4-4 4" />
    </svg>
  )
}
