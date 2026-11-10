import { useId, type ComponentProps, type ReactNode } from 'react'
import Arrow from '@/components/Arrow'

type FieldProps = { label: string; error?: string | false; wrap?: string; children?: ReactNode } & ComponentProps<'input'>

/** Labelled input; with children it is a select and the children are its options. The error line is tied to the control. */
export function Field({ label, error, wrap = '', children, ...props }: FieldProps) {
  const id = useId()
  const shared = { className: 'field', 'aria-invalid': error ? true : undefined, 'aria-describedby': error ? id : undefined } as const
  return (
    <label className={`block ${wrap}`}>
      <span className="mono dim mb-1.5 block">{label}</span>
      {children ? (
        <select {...(props as ComponentProps<'select'>)} {...shared}>
          {children}
        </select>
      ) : (
        <input {...props} {...shared} />
      )}
      {error && (
        <span id={id} className="hot mt-1.5 block">
          {error}
        </span>
      )}
    </label>
  )
}

export const smallBtn =
  'mono inline-flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center border border-hair px-3 transition-colors active:bg-bone active:text-void hover:border-line disabled:cursor-not-allowed disabled:opacity-40 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-[3px] has-[:focus-visible]:outline-hot'

/** A button that opens the file picker. The real input sits inside the label, so it is keyboard reachable. */
export function FileButton({ label, onFiles, multiple, disabled, className = smallBtn }: { label: string; onFiles: (files: File[]) => void; multiple?: boolean; disabled?: boolean; className?: string }) {
  return (
    <label className={`${className} ${disabled ? 'cursor-not-allowed opacity-40' : ''}`}>
      {label}
      <input
        type="file"
        accept="image/*"
        multiple={multiple}
        disabled={disabled}
        className="sr-only"
        onChange={(e) => {
          const files = [...(e.target.files ?? [])]
          e.target.value = '' // the same file can be picked again after a failure
          if (files.length) onFiles(files)
        }}
      />
    </label>
  )
}

/** Move up, move down, remove: the three things every ordered row can do. */
export function RowActions({ what, first, last, removeLabel, onMove, onRemove }: { what: string; first: boolean; last: boolean; removeLabel: string; onMove: (dir: -1 | 1) => void; onRemove: () => void }) {
  return (
    <div className="flex gap-2">
      <button type="button" className={smallBtn} disabled={first} aria-label={`Move up: ${what}`} title="Move up" onClick={() => onMove(-1)}>
        <Arrow className="-rotate-90" />
      </button>
      <button type="button" className={smallBtn} disabled={last} aria-label={`Move down: ${what}`} title="Move down" onClick={() => onMove(1)}>
        <Arrow className="rotate-90" />
      </button>
      <button type="button" className={smallBtn} aria-label={`${removeLabel}: ${what}`} onClick={onRemove}>
        {removeLabel}
      </button>
    </div>
  )
}
