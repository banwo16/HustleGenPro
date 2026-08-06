import type { SVGProps } from 'react'

/** Transparent, vector version of the HustleGenPro graduation-cap mark. */
export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 106 106"
      role="img"
      aria-label="HustleGenPro"
      {...props}
    >
      <path
        d="M14 43.5 53 28l39 15.5L53 59 14 43.5Z"
        fill="#1f4b93"
      />
      <path
        d="m27 50.5 26 10 26-10v16.2c0 2.4-1.5 4.5-3.8 5.3L53 79l-22.2-7c-2.3-.8-3.8-2.9-3.8-5.3V50.5Z"
        fill="#173c7b"
      />
      <path
        d="M53 59v20"
        stroke="#12356d"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <ellipse cx="53" cy="43.5" rx="8.5" ry="3.2" fill="#f6b51b" />
      <path
        d="M45.5 43.5c2.2 2.4 13.3 2.4 15.5 0"
        fill="none"
        stroke="#d88f08"
        strokeWidth="1"
      />
      <path
        d="M87 44v22.5"
        stroke="#1f4b93"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M87 66.5c-4.6 2.2-4.6 6.5-4.6 9.2 2.7-1.1 4.6-.4 4.6 2.8 0-3.2 1.9-3.9 4.6-2.8 0-2.7 0-7-4.6-9.2Z"
        fill="#1764c0"
      />
    </svg>
  )
}
