import { Resend } from "resend";
import { getSiteUrl } from "@/lib/site";
import type { InterestTag } from "./rules";

const INTROS: Record<InterestTag, string> = {
  excel:
    "Excel araçları ve formül tarafındaki yeni içeriklerden haberdar olmak için kaydoldun.",
  training:
    "Excel eğitimleri ve pratik alıştırmalarla ilgili güncellemeleri paylaşacağız.",
  finance:
    "Finans ve sigorta kavramları / rehberleriyle ilgili seçilmiş içerikler göndereceğiz.",
  insurance:
    "Sigorta içerikleri ve ilgili rehberlerden seçilmiş güncellemeler paylaşacağız.",
  tsb:
    "TSB dashboard ve sektörel veri güncellemelerinden haberdar olmak için kaydoldun.",
  ifrs17:
    "IFRS 17 / TFRS 17 içerikleriyle ilgili seçilmiş güncellemeler paylaşacağız.",
  general:
    "Ofis Akademi’den pratik Excel, finans ve sigorta içeriklerini paylaşacağız.",
  legacy:
    "Ofis Akademi’den pratik Excel, finans ve sigorta içeriklerini paylaşacağız.",
};

function resolveIntro(category: InterestTag | string): string {
  if (category in INTROS) return INTROS[category as InterestTag]!;
  return INTROS.general;
}

export function buildWelcomeHtml(category: InterestTag | string): string {
  const base = getSiteUrl();
  const intro = resolveIntro(category);
  return `
    <p>Merhaba,</p>
    <p>Ofis Akademi bültenine hoş geldin.</p>
    <p>${intro}</p>
    <p>İstersen hemen göz atabileceğin bazı başlangıç noktaları:</p>
    <ul>
      <li><a href="${base}/excel-araclari">Excel araçları</a></li>
      <li><a href="${base}/egitimler/temel">Excel eğitimleri</a></li>
      <li><a href="${base}/sigorta/tsb">TSB / sigorta panelleri</a></li>
    </ul>
    <p>İyi çalışmalar,<br/>Ofis Akademi</p>
  `.trim();
}

/**
 * Soft-fail welcome: hata aboneliği bozmaz; false döner.
 * Yalnızca ilk SUBSCRIBE yolundan çağrılmalı.
 */
export async function sendWelcomeEmail(opts: {
  email: string;
  category: InterestTag;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.error("[welcome] RESEND_API_KEY missing — welcomeSent=false");
    return false;
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM ?? "Ofis Akademi <onboarding@resend.dev>",
      to: [opts.email],
      subject: "Ofis Akademi’ye hoş geldin",
      html: buildWelcomeHtml(opts.category),
    });
    if (error) {
      console.error("[welcome] Resend error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[welcome] Resend exception:", err);
    return false;
  }
}
