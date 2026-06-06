export const BUTCE_SESSION_COOKIE = "butce_session";
export const BUTCE_USER_COOKIE = "butce_user";

export function butceSessionToken(): string | undefined {
  return process.env.BUTCE_SESSION_TOKEN?.trim() || undefined;
}

/** Eski tek şifre (geri uyum) — yeni kurulumda BUTCE_USERS kullanın. */
export function butcePanelPassword(): string | undefined {
  return process.env.BUTCE_PANEL_PASSWORD?.trim() || undefined;
}

/**
 * Çoklu kullanıcı: `kullanici:sifre,kullanici2:sifre2`
 * Kullanıcı adı küçük harfe normalize edilir.
 */
export function parseButceUsers(): Map<string, string> {
  const map = new Map<string, string>();
  const raw = process.env.BUTCE_USERS?.trim();
  if (raw) {
    for (const part of raw.split(",")) {
      const idx = part.indexOf(":");
      if (idx <= 0) continue;
      const user = part.slice(0, idx).trim().toLocaleLowerCase("tr-TR");
      const pass = part.slice(idx + 1).trim();
      if (user && pass) map.set(user, pass);
    }
  }
  const legacy = butcePanelPassword();
  if (legacy && map.size === 0) {
    map.set("butce", legacy);
  }
  return map;
}

export function isButceAuthConfigured(): boolean {
  return Boolean(butceSessionToken() && parseButceUsers().size > 0);
}

export function verifyButceCredentials(username: string, password: string): boolean {
  const map = parseButceUsers();
  if (!username || !password || map.size === 0) return false;
  const u = username.trim().toLocaleLowerCase("tr-TR");
  const expected = map.get(u);
  return expected !== undefined && expected === password;
}

/** @deprecated Tek şifre */
export function verifyButcePassword(input: string): boolean {
  return verifyButceCredentials("butce", input) || input === butcePanelPassword();
}

export function verifyButceSession(cookieValue: string | undefined): boolean {
  const token = butceSessionToken();
  if (!token || !cookieValue) return false;
  return cookieValue === token;
}
