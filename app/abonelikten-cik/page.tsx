import type { Metadata } from "next";
import Link from "next/link";
import { isSubscriptionDbConfigured } from "@/lib/subscription/db";
import { unsubscribe } from "@/lib/subscription/service";
import {
  UnsubscribeSecretMissingError,
  isUnsubscribeSecretConfigured,
  verifyUnsubscribeToken,
} from "@/lib/subscription/unsubscribeToken";
import { isValidEmail, normalizeEmail } from "@/lib/subscription/validate";
import { getSiteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Abonelikten Çık — Ofis Akademi",
  description: "Ofis Akademi bülten aboneliğinden çıkış.",
  robots: { index: false, follow: false },
  alternates: { canonical: `${getSiteUrl()}/abonelikten-cik` },
};

type PageState = "success" | "already" | "invalid" | "error";

type View = {
  state: PageState;
  title: string;
  body: string;
};

async function resolveView(
  emailRaw: string | undefined,
  tokenRaw: string | undefined,
): Promise<View> {
  const email = normalizeEmail(emailRaw ?? "");
  const token = typeof tokenRaw === "string" ? tokenRaw : "";

  if (!isValidEmail(email) || !token) {
    return {
      state: "invalid",
      title: "Bağlantı geçersiz",
      body: "Bu abonelikten çıkış bağlantısı eksik veya hatalı. Lütfen e-postadaki bağlantıyı kullan.",
    };
  }

  if (!isSubscriptionDbConfigured() || !isUnsubscribeSecretConfigured()) {
    return {
      state: "error",
      title: "Şu an işlem yapılamıyor",
      body: "Sistem geçici olarak yapılandırılmamış. Lütfen daha sonra tekrar dene.",
    };
  }

  try {
    if (!verifyUnsubscribeToken(email, token)) {
      return {
        state: "invalid",
        title: "Bağlantı geçersiz veya süresi dolmuş",
        body: "Bu bağlantı artık geçerli değil. Yeni bir çıkış bağlantısı için destek ile iletişime geçebilirsin.",
      };
    }
  } catch (err) {
    if (err instanceof UnsubscribeSecretMissingError) {
      return {
        state: "error",
        title: "Şu an işlem yapılamıyor",
        body: "Sistem geçici olarak yapılandırılmamış. Lütfen daha sonra tekrar dene.",
      };
    }
    throw err;
  }

  try {
    const result = await unsubscribe({
      email,
      reason: "manual",
      channel: "email_footer",
    });
    if (result.outcome === "already_unsubscribed") {
      return {
        state: "already",
        title: "Abonelik zaten sonlandırılmış",
        body: "Bu e-posta adresi için bülten aboneliği daha önce kapatılmış. Başka bir işlem gerekmiyor.",
      };
    }
    return {
      state: "success",
      title: "Abonelik başarıyla sonlandırıldı",
      body: "Ofis Akademi bülteninden çıktın. İstersen istediğin zaman siteden yeniden abone olabilirsin.",
    };
  } catch (err) {
    if (err instanceof Error && err.name === "SubscriberNotFoundError") {
      return {
        state: "invalid",
        title: "Abonelik bulunamadı",
        body: "Bu bağlantıya karşılık gelen bir abonelik kaydı yok.",
      };
    }
    console.error("[abonelikten-cik]", err);
    return {
      state: "error",
      title: "Bir sorun oluştu",
      body: "Çıkış işlemi tamamlanamadı. Lütfen daha sonra tekrar dene.",
    };
  }
}

export default async function AboneliktenCikPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; token?: string }>;
}) {
  const sp = await searchParams;
  const view = await resolveView(sp.email, sp.token);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-lg items-center px-4 py-3 sm:px-6">
          <Link href="/" className="text-sm font-semibold text-gray-900">
            Ofis Akademi
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-12 sm:px-6">
        <h1 className="text-xl font-bold text-gray-900">{view.title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-gray-600">{view.body}</p>
        <Link
          href="/"
          className="mt-8 inline-flex w-fit items-center justify-center rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          Ana sayfaya dön
        </Link>
      </main>
    </div>
  );
}
