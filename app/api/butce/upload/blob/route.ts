import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getButceLoggedInUser } from "@/lib/butce/auth";
import { vercelBlobGerekliMesaji } from "@/lib/butce/storage";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

const ALLOWED_TYPES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
];

export async function POST(request: Request): Promise<NextResponse> {
  const blobUyari = vercelBlobGerekliMesaji();
  if (blobUyari) {
    return NextResponse.json(
      { error: "Depolama yapılandırılmamış", detail: blobUyari },
      { status: 503 },
    );
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const user = getButceLoggedInUser(await cookies());
        if (!user) {
          throw new Error("Yetkisiz");
        }
        if (!pathname.startsWith("butce-uploads/")) {
          throw new Error("Geçersiz yükleme yolu");
        }
        const payload = JSON.parse(clientPayload || "{}") as {
          kind?: string;
          butceYili?: number;
          originalName?: string;
        };
        return {
          allowedContentTypes: ALLOWED_TYPES,
          maximumSizeInBytes: 100 * 1024 * 1024,
          addRandomSuffix: false,
          tokenPayload: JSON.stringify({
            user,
            kind: payload.kind ?? null,
            butceYili: payload.butceYili ?? null,
            originalName: payload.originalName ?? null,
          }),
        };
      },
      onUploadCompleted: async () => {
        // Import istemci tarafindan ikinci adimda tetiklenir.
      },
    });
    return NextResponse.json(json);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 400 },
    );
  }
}
