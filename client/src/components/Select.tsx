import { useEffect, useId, useRef, useState } from 'react'
import { CheckIcon, ChevronDownIcon } from './icons'

export interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  label: string
  value: string
  options: SelectOption[]
  onChange: (value: string) => void
  disabled?: boolean
}

export function Select({ label, value, options, onChange, disabled }: SelectProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerId = useId()
  const listboxId = useId()
  const selected = options.find((option) => option.value === value)

  useEffect(() => {
    if (!open) return

    function handlePointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <label htmlFor={triggerId} className="block text-sm font-semibold text-lychee-ink">
        {label}
      </label>

      <button
        id={triggerId}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => setOpen((prev) => !prev)}
        className="focus-ring mt-2 flex w-full items-center justify-between rounded-2xl border border-lychee-border bg-lychee-membrane-100/70 px-4 py-3 text-left text-sm font-medium text-lychee-ink transition hover:bg-lychee-membrane-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span>{selected?.label ?? 'Select…'}</span>
        <ChevronDownIcon
          className={`h-4 w-4 text-lychee-seed transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open ? (
        <ul
          id={listboxId}
          role="listbox"
          aria-labelledby={triggerId}
          className="animate-pop-in absolute z-10 mt-2 w-full origin-top overflow-hidden rounded-2xl border border-lychee-border bg-white p-1.5 shadow-pop"
        >
          {options.map((option) => {
            const isSelected = option.value === value
            return (
              <li key={option.value} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option.value)
                    setOpen(false)
                  }}
                  className={`focus-ring flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                    isSelected
                      ? 'bg-lychee-shell-50 text-lychee-shell'
                      : 'text-lychee-ink hover:bg-lychee-membrane-100'
                  }`}
                >
                  {option.label}
                  {isSelected ? <CheckIcon className="h-4 w-4" /> : null}
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
