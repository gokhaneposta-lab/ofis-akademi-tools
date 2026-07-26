import { Resend } from "resend";

/**
 * Best-effort Resend contact unsubscribe. Never throws for caller flow.
 * DB remains source of truth.
 */
export async function softFailResendUnsubscribe(email: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.error("[resendContacts] RESEND_API_KEY missing — soft-fail");
    return false;
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.contacts.update({
      email,
      unsubscribed: true,
    });
    if (error) {
      console.error("[resendContacts] update error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[resendContacts] exception:", err);
    return false;
  }
}
