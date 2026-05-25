export function AppLogo({ size = 24 }: { size?: number }) {
  return (
    <svg
      aria-hidden="true"
      className="block shrink-0"
      height={size}
      viewBox="0 0 32 32"
      width={size}
    >
      <rect fill="var(--primary)" height="32" rx="8" width="32" />
      <text
        dominantBaseline="central"
        fill="var(--primary-foreground)"
        fontFamily="Space Grotesk Variable, sans-serif"
        fontSize="18"
        fontWeight="700"
        textAnchor="middle"
        x="16"
        y="16"
      >
        C
      </text>
    </svg>
  );
}
