import { NextResponse } from "next/server";
import { Resend } from "resend";

/** E-postadaki linkler her zaman bu adrese gider (preview URL'leri kullanılmaz). */
function getBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL || "https://ofisakademi.com";
  return url.replace(/\/$/, "");
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

    return NextResponse.json({ success: true, id: data?.id });
  } catch (err) {
    console.error("Abone API error:", err);
    return NextResponse.json(
      { error: "Bir hata oluştu. Lütfen daha sonra tekrar dene." },
      { status: 500 }
    );
  }
}
