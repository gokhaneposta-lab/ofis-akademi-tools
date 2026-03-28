import { NextResponse } from "next/server";
import { Resend } from "resend";

/** E-postadaki linkler her zaman bu adrese gider (preview URL'leri kullanılmaz). */
function getBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL || "https://ofisakademi.com";
  return url.replace(/\/$/, "");
}

type ContactSyncResult =
  | { ok: true; contactId?: string }
  | { ok: false; reason: "duplicate" | "forbidden" | "other" };

function classifyContactSync(
  data: { id?: string } | null | undefined,
  error: unknown
): ContactSyncResult {
  if (data && "id" in data && data.id) {
    return { ok: true, contactId: data.id };
  }
  if (!error) return { ok: false, reason: "other" };

  const raw = JSON.stringify(error).toLowerCase();
  const err = error as { statusCode?: number; message?: string };
  if (err.statusCode === 403 || err.statusCode === 401) {
    return { ok: false, reason: "forbidden" };
  }
  if (
    raw.includes("duplicate") ||
    raw.includes("already") ||
    raw.includes("exist")
  ) {
    return { ok: false, reason: "duplicate" };
  }
  return { ok: false, reason: "other" };
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("RESEND_API_KEY is not set");
      return NextResponse.json(
        { error: "E-posta gönderilemedi. Lütfen daha sonra tekrar dene." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim() : "";

    if (!email) {
      return NextResponse.json({ error: "E-posta gerekli." }, { status: 400 });
    }

    const baseUrl = getBaseUrl();
    const linkTemel = `${baseUrl}/egitimler/temel`;
    const linkOrta = `${baseUrl}/egitimler/orta`;
    const linkIleri = `${baseUrl}/egitimler/ileri`;

    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM ?? "Ofis Akademi <onboarding@resend.dev>",
      to: [email],
      subject: "Hoş geldin — Excel başlangıç setin hazır",
      html: `
        <p>Merhaba,</p>
        <p>Ofis Akademi’ye hoş geldin. Aşağıdaki linklerden her seviye için örnek Excel dosyasını indirebilirsin (sayfada <strong>Örnek Excel İndir</strong> butonuna tıklaman yeterli).</p>
        <ul>
          <li><a href="${linkTemel}">Seviye 1 · Temel</a></li>
          <li><a href="${linkOrta}">Seviye 2 · Orta</a></li>
          <li><a href="${linkIleri}">Seviye 3 · İleri</a></li>
        </ul>
        <p>İyi çalışmalar,<br>Ofis Akademi</p>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "E-posta gönderilemedi. Lütfen daha sonra tekrar dene." },
        { status: 500 }
      );
    }

    /** Kişiyi Resend Audience (Contacts) listesine ekler — panelde Kitle → İletişim.
     * Not: API anahtarı "Tam erişim" (Full access) olmalı; yalnızca "Gönderim" (Sending) ise Contacts API reddedilir. */
    let contactSync: ContactSyncResult = { ok: false, reason: "other" };
    try {
      const { data: contactData, error: contactError } =
        await resend.contacts.create({
          email,
          unsubscribed: false,
        });
      contactSync = classifyContactSync(contactData, contactError);

      if (contactSync.ok) {
        console.info("Resend contact oluşturuldu:", contactSync.contactId);
      } else if (contactSync.reason === "duplicate") {
        console.info("Resend: contact zaten kayıtlı", email);
      } else if (contactSync.reason === "forbidden") {
        console.error(
          "Resend contacts: 403/401 — RESEND_API_KEY muhtemelen yalnızca 'Sending access'. " +
            "Kişi listesi için Resend'de yeni anahtar oluştur: izin = Full access, Vercel env'e yapıştır."
        );
      } else if (contactError) {
        console.error("Resend contacts.create:", contactError);
      }
    } catch (contactErr) {
      console.error("Resend contacts.create exception:", contactErr);
    }

    return NextResponse.json({
      success: true,
      id: data?.id,
      contactAdded: contactSync.ok,
      /** duplicate | forbidden | other — tarayıcıda Network sekmesinden kontrol (forbidden = API anahtarını Full access yap) */
      contactSyncReason: contactSync.ok ? undefined : contactSync.reason,
    });
  } catch (err) {
    console.error("Abone API error:", err);
    return NextResponse.json(
      { error: "Bir hata oluştu. Lütfen daha sonra tekrar dene." },
      { status: 500 }
    );
  }
}
