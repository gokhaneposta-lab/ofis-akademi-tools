/**
 * Ofis Akademi brand mark — light backgrounds (header/drawer/footer).
 * Assets: /brand/logo-icon.svg
 */
export default function BrandLogo({
  variant = "full",
  className = "",
  priority = false,
  alwaysShowWordmark = false,
}: {
  variant?: "full" | "mark";
  className?: string;
  priority?: boolean;
  /** Footer gibi yerlerde wordmark her zaman görünsün */
  alwaysShowWordmark?: boolean;
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
      <span
        className={`${
          alwaysShowWordmark ? "inline" : "hidden sm:inline"
        } text-[13px] font-bold tracking-[0.12em] text-[#0D1117]`}
      >
        OFİS AKADEMİ
      </span>
    </span>
  );
}
