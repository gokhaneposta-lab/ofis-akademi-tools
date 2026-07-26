/**
 * Ofis Akademi brand mark — light backgrounds (header/drawer).
 * Assets: /brand/logo-icon.svg
 */
export default function BrandLogo({
  variant = "full",
  className = "",
  priority = false,
}: {
  variant?: "full" | "mark";
  className?: string;
  priority?: boolean;
}) {
  const mark = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/logo-icon.svg"
      alt={variant === "mark" ? "Ofis Akademi" : ""}
      width={44}
      height={26}
      className={variant === "mark" ? `h-7 w-auto ${className}` : "h-7 w-auto"}
      decoding="async"
      {...(priority ? { fetchPriority: "high" as const } : {})}
    />
  );

  if (variant === "mark") return mark;

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      {mark}
      <span className="hidden text-[13px] font-bold tracking-[0.12em] text-[#0D1117] sm:inline">
        OFİS AKADEMİ
      </span>
    </span>
  );
}
