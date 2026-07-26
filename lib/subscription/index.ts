export { sendWelcomeEmail, buildWelcomeHtml } from "./welcome";
export {
  mapPageToCategory,
  normalizeChannel,
  normalizePagePath,
  normalizeReason,
} from "./rules";
export { subscribe } from "./service";
export { isSubscriptionDbConfigured } from "./db";
export type { SubscribeInput, SubscribeResult, SubscribeOutcome } from "./types";
