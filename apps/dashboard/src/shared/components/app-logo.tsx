export function AppLogo({ size = 28 }: { size?: number }) {
  return (
    <div
      className="grid place-items-center rounded-md bg-primary font-bold text-primary-foreground"
      style={{ height: size, width: size }}
    >
      C
    </div>
  );
}
