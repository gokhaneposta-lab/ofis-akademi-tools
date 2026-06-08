import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { get, put } from "@vercel/blob";
import { BUTCE_META_JSON, BUTCE_MIZAN_JSON, BUTCE_ORAN_AYAR_JSON, localPrivateDir, useBlobStorage } from "./paths";

const BLOB_PREFIX = "butce-private/";

function blobPath(name: string) {
  return `${BLOB_PREFIX}${name}`;
}

async function streamToString(stream: ReadableStream<Uint8Array>): Promise<string> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }
  return Buffer.concat(chunks).toString("utf8");
}

export async function writePrivateFile(name: string, content: string): Promise<void> {
  if (useBlobStorage()) {
    await put(blobPath(name), content, {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: name.endsWith(".json") ? "application/json" : "text/plain",
    });
    return;
  }

  const dir = localPrivateDir();
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, name), content, "utf8");
}

export async function readPrivateFile(name: string): Promise<string | null> {
  if (useBlobStorage()) {
    try {
      const result = await get(blobPath(name), { access: "private" });
      if (!result || result.statusCode === 304 || !result.stream) return null;
      return await streamToString(result.stream);
    } catch {
      return null;
    }
  }

  const p = join(localPrivateDir(), name);
  if (!existsSync(p)) return null;
  return readFileSync(p, "utf8");
}

export function storageDurumu(): { mode: "blob" | "local" | "vercel-tmp"; yazilabilir: boolean } {
  if (useBlobStorage()) return { mode: "blob", yazilabilir: true };
  if (process.env.VERCEL === "1") return { mode: "vercel-tmp", yazilabilir: true };
  return { mode: "local", yazilabilir: true };
}

export function vercelBlobGerekliMesaji(): string | null {
  if (process.env.VERCEL === "1" && !useBlobStorage()) {
    return (
      "Vercel Blob bağlı değil veya ortam değişkenleri deploy'a yansımamış. " +
      "Storage → Blob Store oluşturup projeye bağlayın; ardından Deployments → " +
      "son dağıtım → Redeploy (Yeniden dağıt) yapın."
    );
  }
  return null;
}

export { BUTCE_META_JSON, BUTCE_MIZAN_JSON, BUTCE_ORAN_AYAR_JSON };
