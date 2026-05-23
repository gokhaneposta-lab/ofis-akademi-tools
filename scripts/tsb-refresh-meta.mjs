/**
 * Import sonrası hub "Veri Durumu" meta.json güncelleme.
 */
import { spawnSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

export function refreshTsbMeta() {
  const r = spawnSync("npm", ["run", "tsb:meta"], {
    cwd: ROOT,
    stdio: "inherit",
    shell: true,
  });
  if (r.status !== 0) {
    console.warn("[tsb] meta.json güncellenemedi (npm run tsb:meta)");
  }
}
