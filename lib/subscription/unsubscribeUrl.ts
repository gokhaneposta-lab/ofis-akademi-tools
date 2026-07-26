import { getSiteUrl } from "@/lib/site";
import {
  UnsubscribeSecretMissingError,
  createUnsubscribeToken,
} from "./unsubscribeToken";
import { normalizeEmail } from "./validate";

/** Signed one-click unsubscribe page URL, or null if secret missing. */
export function buildUnsubscribePageUrl(email: string): string | null {
  try {
    const normalized = normalizeEmail(email);
    const token = createUnsubscribeToken(normalized);
    const q = new URLSearchParams({ email: normalized, token });
    return `${getSiteUrl()}/abonelikten-cik?${q.toString()}`;
  } catch (err) {
    if (err instanceof UnsubscribeSecretMissingError) {
      console.error("[unsubscribeUrl] UNSUBSCRIBE_SECRET missing");
      return null;
    }
    throw err;
  }
}
