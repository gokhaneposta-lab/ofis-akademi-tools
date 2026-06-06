import { mkdirSync, writeFileSync, readFileSync, existsSync } from "fs";
import { join } from "path";
import { NextResponse } from "next/server";
import { BUTCE_PRIVATE_DIR, BUTCE_GTBL_JSON, BUTCE_HEDEF_JSON, BUTCE_META_JSON } from "@/lib/butce/paths";

export const runtime = "nodejs";

async function runImport(script: string, tmpPath: string): Promise<{ ok: boolean; output: string }> {
  const { execFile } = await import("child_process");
  const { promisify } = await import("util");
  const exec = promisify(execFile);
  const node = process.execPath;
  const scriptPath = join(process.cwd(), "scripts", script);
  try {
    const { stdout, stderr } = await exec(node, [scriptPath, tmpPath], {
      cwd: process.cwd(),
      maxBuffer: 20 * 1024 * 1024,
    });
    return { ok: true, output: `${stdout}\n${stderr}`.trim() };
  } catch (e: unknown) {
    const err = e as { stdout?: string; stderr?: string; message?: string };
    return {
      ok: false,
      output: `${err.stdout ?? ""}\n${err.stderr ?? ""}\n${err.message ?? ""}`.trim(),
    };
  }
}

export async function POST(request: Request) {
  const form = await request.formData();
  const kind = String(form.get("kind") ?? "");
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Dosya gerekli" }, { status: 400 });
  }

  if (kind !== "gtbl" && kind !== "hedef") {
    return NextResponse.json({ error: "kind: gtbl veya hedef" }, { status: 400 });
  }

  mkdirSync(BUTCE_PRIVATE_DIR, { recursive: true });
  const tmp = join(BUTCE_PRIVATE_DIR, `_upload-${Date.now()}.xlsx`);
  const buf = Buffer.from(await file.arrayBuffer());
  writeFileSync(tmp, buf);

  const script = kind === "gtbl" ? "butce-import-gt-bl.mjs" : "butce-import-hedef.mjs";
  const result = await runImport(script, tmp);

  try {
    const { unlinkSync } = await import("fs");
    unlinkSync(tmp);
  } catch {
    /* ignore */
  }

  if (!result.ok) {
    return NextResponse.json({ error: "Import başarısız", detail: result.output }, { status: 500 });
  }

  const meta = existsSync(join(BUTCE_PRIVATE_DIR, BUTCE_META_JSON))
    ? JSON.parse(readFileSync(join(BUTCE_PRIVATE_DIR, BUTCE_META_JSON), "utf8"))
    : null;

  return NextResponse.json({
    ok: true,
    kind,
    log: result.output,
    meta,
    outFile: kind === "gtbl" ? BUTCE_GTBL_JSON : BUTCE_HEDEF_JSON,
  });
}
