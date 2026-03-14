import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

/** Site base URL (production'da NEXT_PUBLIC_SITE_URL veya VERCEL_URL kullanın) */
function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim() : "";

    if (!email) {
      return NextResponse.json({ error: "E-posta gerekli." }, { status: 400 });
    }

    const baseUrl = getBaseUrl();
    const linkTemel = `${baseUrl}/egitimler/temel`;
    const linkOrta = `${baseUrl}/egitimler/orta`;
    const linkIleri = `${baseUrl}/egitimler/ileri`;

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
