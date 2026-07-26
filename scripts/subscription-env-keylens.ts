import { readFileSync } from "fs";

const lines = readFileSync(".env.local", "utf8").split(/\r?\n/);
for (const line of lines) {
  if (!line || line.startsWith("#")) continue;
  const i = line.indexOf("=");
  if (i < 0) continue;
  const k = line.slice(0, i);
  const v = line.slice(i + 1);
  if (!/DATABASE|POSTGRES_URL|PGHOST|PGUSER|PGDATABASE|POSTGRES_HOST/.test(k)) {
    continue;
  }
  const quoted = v.startsWith('"') || v.startsWith("'");
  console.log(`${k} len=${v.length} quoted=${quoted}`);
}
