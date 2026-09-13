import { useId } from "react";

export default function Logo({ className = "h-10 w-10" }) {
  const gradientId = useId().replace(/:/g, "");

  return (
    <svg
      viewBox="0 0 80 80"
      className={className}
      role="img"
      aria-label="CodeCircle"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1="12"
          y1="68"
          x2="68"
          y2="12"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#06B6D4" />
          <stop offset="1" stopColor="#7C3AED" />
        </linearGradient>
      </defs>

      {/* Circle / C */}
      <path
        d="M61 19.5C55.7 14.2 48.4 11 40.5 11C24.2 11 11 24.2 11 40.5C11 56.8 24.2 70 40.5 70C48.4 70 55.7 66.8 61 61.5"
        stroke={`url(#${gradientId})`}
        strokeWidth="11"
        strokeLinecap="round"
      />

      {/* Left code bracket */}
      <path
        d="M34 32L25 40.5L34 49"
        stroke="#06B6D4"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Right code bracket */}
      <path
        d="M47 32L56 40.5L47 49"
        stroke="#7C3AED"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Center slash */}
      <path
        d="M44 29L37 52"
        stroke="#1E293B"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}
