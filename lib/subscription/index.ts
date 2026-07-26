export { sendWelcomeEmail, buildWelcomeHtml } from "./welcome";
export {
  mapPageToCategory,
  normalizeChannel,
  normalizePagePath,
  normalizeReason,
} from "./rules";
export {
  importLegacySubscriber,
  subscribe,
  unsubscribe,
} from "./service";
export { isSubscriptionDbConfigured } from "./db";
export {
  createUnsubscribeToken,
  isUnsubscribeSecretConfigured,
  verifyUnsubscribeToken,
} from "./unsubscribeToken";
export type {
  SubscribeInput,
  SubscribeResult,
  SubscribeOutcome,
  UnsubscribeInput,
  UnsubscribeResult,
  UnsubscribeOutcome,
  LegacyImportResult,
} from "./types";
