/** Interest tags — docs/newsletter-v2 v1.0 Final */
export const INTEREST_TAGS = [
  "excel",
  "training",
  "finance",
  "insurance",
  "tsb",
  "ifrs17",
  "legacy",
  "general",
] as const;

export type InterestTag = (typeof INTEREST_TAGS)[number];

export const INTEREST_TAG_SET = new Set<string>(INTEREST_TAGS);

export function isInterestTag(value: string): value is InterestTag {
  return INTEREST_TAG_SET.has(value);
}

/**
 * Path prefix → tag. En uzun eşleşen prefix kazanır.
 * Category UI'dan gelmez — yalnızca bu config.
 */
const PATH_RULES: { prefix: string; tag: InterestTag }[] = [
  { prefix: "/excel-araclari", tag: "excel" },
  { prefix: "/formul-kutuphanesi", tag: "excel" },
  { prefix: "/egitimler", tag: "training" },
  { prefix: "/finans-sigorta", tag: "finance" },
  { prefix: "/sigorta", tag: "insurance" },
  { prefix: "/tsb", tag: "tsb" },
  { prefix: "/ifrs17", tag: "ifrs17" },
];

export function normalizePagePath(page: string): string {
  const raw = page.trim() || "/";
  let path = raw.startsWith("http")
    ? (() => {
        try {
          return new URL(raw).pathname;
        } catch {
          return "/";
        }
      })()
    : raw;
  if (!path.startsWith("/")) path = `/${path}`;
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
  return path.slice(0, 512);
}

/** Bilinmeyen path → general (son çare; mümkün olduğunca config genişletilir). */
export function mapPageToCategory(page: string): InterestTag {
  const path = normalizePagePath(page).toLowerCase();
  let best: { prefix: string; tag: InterestTag } | null = null;
  for (const rule of PATH_RULES) {
    if (path === rule.prefix || path.startsWith(`${rule.prefix}/`)) {
      if (!best || rule.prefix.length > best.prefix.length) best = rule;
    }
  }
  return best?.tag ?? "general";
}

export const SUBSCRIBE_REASONS = [
  "signup_form",
  "download_template",
  "exit_intent",
  "manual",
  "migration",
] as const;

export type SubscribeReason = (typeof SUBSCRIBE_REASONS)[number];

export const SUBSCRIBE_CHANNELS = [
  "web_inline",
  "web_footer",
  "web_popup",
  "web_home_hero",
  "email_footer",
  "legacy_api",
  "unknown",
] as const;

export type SubscribeChannel = (typeof SUBSCRIBE_CHANNELS)[number];

export function normalizeReason(raw: unknown): SubscribeReason {
  if (typeof raw === "string" && (SUBSCRIBE_REASONS as readonly string[]).includes(raw)) {
    return raw as SubscribeReason;
  }
  return "signup_form";
}

export function normalizeChannel(raw: unknown): SubscribeChannel {
  if (typeof raw === "string" && (SUBSCRIBE_CHANNELS as readonly string[]).includes(raw)) {
    return raw as SubscribeChannel;
  }
  return "unknown";
}
