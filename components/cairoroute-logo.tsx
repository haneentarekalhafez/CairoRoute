import Link from "next/link"

type CairoRouteLogoProps = {
  href?: string
  compact?: boolean
  light?: boolean
  className?: string
}

export default function CairoRouteLogo({
  href = "/dashboard",
  compact = false,
  light = false,
  className = "",
}: CairoRouteLogoProps) {
  const logo = (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-[14px] bg-gradient-to-br from-[#6d3aa2] via-[#512978] to-[#35154e] shadow-[0_8px_24px_rgba(81,41,120,0.22)]">
        <svg
          viewBox="0 0 40 40"
          className="size-7 text-white"
          aria-hidden="true"
        >
          <path
            d="M10.5 29.2c4.6-1.5 5.7-5.2 6.2-9.2.5-4.4 2.3-7.2 7.1-8.4"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.2"
            strokeLinecap="round"
          />

          <circle
            cx="10"
            cy="30"
            r="4"
            fill="currentColor"
          />

          <circle
            cx="25"
            cy="10.8"
            r="4"
            fill="currentColor"
          />

          <path
            d="M21.5 28.9h8.1c1.7 0 3.1-1.4 3.1-3.1v-6.1c0-1.7-1.4-3.1-3.1-3.1h-4.1"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.9"
          />

          <path
            d="M26.8 21.4h3.2M25.9 25h4.1"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.85"
          />
        </svg>
      </div>

      {!compact && (
        <div className="min-w-0">
          <div className="flex items-baseline">
            <span
              className={`text-[18px] font-extrabold tracking-[-0.035em] ${
                light
                  ? "text-white"
                  : "text-[#211827]"
              }`}
            >
              Cairo
            </span>

            <span
              className={`text-[18px] font-extrabold tracking-[-0.035em] ${
                light
                  ? "text-[#d7bcec]"
                  : "text-[#6d3aa2]"
              }`}
            >
              Route
            </span>
          </div>

          <p
            className={`mt-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${
              light
                ? "text-white/55"
                : "text-slate-400"
            }`}
          >
            Move Cairo smarter
          </p>
        </div>
      )}
    </div>
  )

  if (!href) {
    return logo
  }

  return (
    <Link
      href={href}
      className="inline-flex rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[#6d3aa2]/40"
    >
      {logo}
    </Link>
  )
}