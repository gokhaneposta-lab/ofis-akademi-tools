import {
  mapPageToCategory,
  normalizeChannel,
  normalizePagePath,
  normalizeReason,
} from "../lib/subscription/rules";

function assert(cond: unknown, msg: string) {
  if (!cond) throw new Error(msg);
}

assert(mapPageToCategory("/tsb/sektor-ozeti") === "tsb", "tsb");
assert(mapPageToCategory("/excel-araclari/x") === "excel", "excel");
assert(mapPageToCategory("/egitimler/temel") === "training", "training");
assert(mapPageToCategory("/finans-sigorta") === "finance", "finance");
assert(mapPageToCategory("/sigorta/sozluk") === "insurance", "insurance");
assert(mapPageToCategory("/ifrs17/foo") === "ifrs17", "ifrs17");
assert(mapPageToCategory("/") === "general", "general home");
assert(normalizePagePath("/tsb/") === "/tsb", "strip slash");
assert(normalizeReason("download_template") === "download_template", "reason");
assert(normalizeReason("nope") === "signup_form", "reason default");
assert(normalizeChannel("web_footer") === "web_footer", "channel");
assert(normalizeChannel("x") === "unknown", "channel default");

console.log("subscription-rules smoke OK");
