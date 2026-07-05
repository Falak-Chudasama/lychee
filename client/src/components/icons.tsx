import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

const strokeProps = {
  viewBox: '0 0 24 24',
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function LinkIcon(props: IconProps) {
  return (
    <svg {...strokeProps} {...props}>
      <path d="M9.5 14.5 14.5 9.5" />
      <path d="M11 6.5 12.6 4.9a3.6 3.6 0 0 1 5.1 5.1L16 11.6" />
      <path d="M13 17.5 11.4 19.1a3.6 3.6 0 0 1-5.1-5.1L8 12.4" />
    </svg>
  )
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <svg {...strokeProps} {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

export function CheckIcon(props: IconProps) {
  return (
    <svg {...strokeProps} {...props}>
      <path d="m5 13 4 4 10-10" />
    </svg>
  )
}

export function SpinnerIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

export function DownloadIcon(props: IconProps) {
  return (
    <svg {...strokeProps} {...props}>
      <path d="M12 4v11" />
      <path d="m7.5 11.5 4.5 4.5 4.5-4.5" />
      <path d="M5 19.5h14" />
    </svg>
  )
}

export function SearchIcon(props: IconProps) {
  return (
    <svg {...strokeProps} {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-3.8-3.8" />
    </svg>
  )
}

export function ImageIcon(props: IconProps) {
  return (
    <svg {...strokeProps} {...props}>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="m4.5 16.5 4.5-4.5 3.5 3.5 3-3 4 4" />
    </svg>
  )
}

export function UserIcon(props: IconProps) {
  return (
    <svg {...strokeProps} {...props}>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5 19.5c1.2-3.3 3.9-5 7-5s5.8 1.7 7 5" />
    </svg>
  )
}

export function ClockIcon(props: IconProps) {
  return (
    <svg {...strokeProps} {...props}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  )
}

export function AlertIcon(props: IconProps) {
  return (
    <svg {...strokeProps} {...props}>
      <path d="M12 3.5 21.5 20h-19L12 3.5Z" />
      <path d="M12 10v4" />
      <path d="M12 17h.01" strokeWidth="2.5" />
    </svg>
  )
}

export function LycheeMark(props: IconProps) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" {...props}>
      <circle cx="16" cy="17.5" r="10.5" fill="#C81D3A" />
      <path
        d="M15.4 7.3c-.5-1.8-.1-3.3 1.3-4.4"
        stroke="#8B5E3C"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
      <g fill="#841126">
        <circle cx="12" cy="12.6" r="0.85" />
        <circle cx="17" cy="10.8" r="0.85" />
        <circle cx="20.8" cy="13.6" r="0.85" />
        <circle cx="10.3" cy="17.4" r="0.85" />
        <circle cx="14.6" cy="16" r="0.85" />
        <circle cx="19.2" cy="17.1" r="0.85" />
        <circle cx="22.1" cy="18.7" r="0.85" />
        <circle cx="11.7" cy="21.8" r="0.85" />
        <circle cx="16.2" cy="21" r="0.85" />
        <circle cx="20.3" cy="22.1" r="0.85" />
      </g>
    </svg>
  )
}
