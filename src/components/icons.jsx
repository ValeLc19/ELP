// Small inline SVG icons used across the event cards and detail view.
const base = {
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export const LocationIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
)

export const CalendarIcon = (p) => (
  <svg {...base} {...p}>
    <rect x="3" y="4.5" width="18" height="16" rx="2" />
    <path d="M3 9h18M8 2.5v4M16 2.5v4" />
  </svg>
)

export const ClockIcon = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3.5 2" />
  </svg>
)

export const TicketIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z" />
  </svg>
)

export const UsersIcon = (p) => (
  <svg {...base} {...p}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
    <path d="M16 5.2a3.2 3.2 0 0 1 0 5.6M17 14.2c2.3.6 4 2.6 4 5.8" />
  </svg>
)

export const SearchIcon = (p) => (
  <svg {...base} {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.2-3.2" />
  </svg>
)

export const ChatIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M21 12a8 8 0 0 1-11.5 7.2L4 20l1-4.4A8 8 0 1 1 21 12z" />
    <path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01" />
  </svg>
)

export const ShareIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M14 3h7v7M21 3l-9 9" />
    <path d="M19 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5" />
  </svg>
)

export const CopyIcon = (p) => (
  <svg {...base} {...p}>
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
)

export const HeartIcon = ({ filled, ...p }) => (
  <svg
    viewBox="0 0 24 24"
    width={19}
    height={19}
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...p}
  >
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
)

export const CheckIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
)

export const HomeIcon = (p) => (
  <svg {...base} width={26} height={26} {...p}>
    <path d="M3.5 11.7 12 3.7l8.5 8" />
    <path d="M5.7 10.2V20.3h12.6V10.2" />
    <path d="M9.7 20.3v-5h4.6v5" />
  </svg>
)

export const PlusBoxIcon = (p) => (
  <svg {...base} width={26} height={26} {...p}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="4" />
    <path d="M12 8.5v7M8.5 12h7" />
  </svg>
)

export const ShopIcon = (p) => (
  <svg {...base} width={26} height={26} {...p}>
    <path d="M3.5 9 5 3.9h14l1.5 5.1" />
    <path d="M5 9v10.6a1.5 1.5 0 0 0 1.5 1.5h11a1.5 1.5 0 0 0 1.5-1.5V9" />
    <path d="M3.5 9h17" />
    <path d="M9.5 21.1v-5h5v5" />
  </svg>
)

export const SavedIcon = (p) => (
  <svg {...base} width={26} height={26} {...p}>
    <path d="M3.5 6a2 2 0 0 1 2-2h4l2 2h7a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5.5a2 2 0 0 1-2-2z" />
    <path d="M12 11.6c1-1.3 3.3-.6 3.3 1.1 0 1.4-1.8 2.5-3.3 3.5-1.5-1-3.3-2.1-3.3-3.5 0-1.7 2.3-2.4 3.3-1.1z" />
  </svg>
)

export const XIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
)

export const TrashIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M4 7h16" />
    <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    <path d="M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" />
    <path d="M10 11v7M14 11v7" />
  </svg>
)

export const GoogleIcon = ({ width = 22, height = 22, ...p }) => (
  <svg width={width} height={height} viewBox="0 0 48 48" {...p}>
    <path
      fill="#FFC107"
      d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.5 29.3 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.3-.4-3.5z"
    />
    <path
      fill="#FF3D00"
      d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.5 29.3 4.5 24 4.5 16.3 4.5 9.6 8.9 6.3 14.7z"
    />
    <path
      fill="#4CAF50"
      d="M24 43.5c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.5 2.4-7.2 2.4-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39 16.2 43.5 24 43.5z"
    />
    <path
      fill="#1976D2"
      d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.4l6.2 5.2C41.4 36.1 43.5 30.5 43.5 24c0-1.2-.1-2.3-.4-3.5z"
    />
  </svg>
)

export const ScanFaceIcon = (p) => (
  <svg {...base} width={26} height={26} {...p}>
    <path d="M3.7 8V5.7a2 2 0 0 1 2-2H8M16 3.7h2.3a2 2 0 0 1 2 2V8M20.3 16v2.3a2 2 0 0 1-2 2H16M8 20.3H5.7a2 2 0 0 1-2-2V16" />
    <path d="M9 10v.5M15 10v.5M12 10v3l-1 1M9.5 15.5c1.4 1 3.6 1 5 0" />
  </svg>
)
