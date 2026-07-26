export { sendWelcomeEmail, buildWelcomeHtml } from "./welcome";
export { buildUnsubscribePageUrl } from "./unsubscribeUrl";
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
export {
  countAudience,
  createCampaign,
  sendCampaign,
  sendTestEmail,
} from "./campaign";
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
