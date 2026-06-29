/**
 * Aylık GT dosyasından muhasebe-kodlu yıl-sonu mizan satırları üretir.
 * Köprü: muhasebe hesap kodu -> GT satır kodu. Değer eşleştirmeyle (13 branş × 4 yıl)
 * doğrulandı; oran motoru iki mizanı karşılaştırınca max Δ 0.004 (sadece 2022/715
 * muallak vintage farkı). Detay: scripts/butce-recon-oran.ts
 */
import XLSX from "xlsx";

/** Tek-kod eşleme (muhasebe -> GT kod). */
export const BRIDGE_SINGLE = {
  "60001": "0111",  "600011": "01111", "600012": "01112",
  "60002": "0112",  "60003": "0113",
  "600": "011",     "60101": "0121",  "60201": "0131",
  "60301": "0141",
  "61001": "0211",  "61002": "0212",
  "61101": "0221",  "61102": "0222",  "611": "022",
  "611011": "02211","611012": "02212","611021": "02221","611022": "02222",
  "61301101": "02411",
  "614011": "0251", "61402": "0252",
  "61408": "0258",  "61409": "0259",
  "605": "016",
};

/** İsim+prefix toplama (muhasebe -> GT yapraklarının toplamı). */
export const BRIDGE_SUM = {
  // Üretim komisyon gideri — standart üretim komisyonu (0251101) yaprakları
  "6140110101": { prefix: "0251101", includes: ["URETIM KOMISYON GIDERI"], excludes: [] },
  // Ertelenmiş komisyon giderleri (0251101 altı)
  "6140110102": { prefix: "0251101", includes: ["ERTELENMIS KOMISYON GIDER"], excludes: ["GELIR"] },
  // Diğer üretim komisyonu giderleri — 0251199 altı (üretim + ertelenmiş)
  "61401199": { prefix: "0251199", includes: ["KOMISYON GIDER"], excludes: ["GELIR"] },
};

function normAd(s) {
  const TR = { İ:"I", I:"I", ı:"I", i:"I", Ş:"S", ş:"S", Ğ:"G", ğ:"G", Ü:"U", ü:"U", Ö:"O", ö:"O", Ç:"C", ç:"C" };
  return [...String(s ?? "")].map((c) => TR[c] ?? c).join("").toUpperCase();
}

function serialYM(s) {
  const d = new Date(Date.UTC(1899, 11, 30) + s * 86400000);
  return [d.getUTCFullYear(), d.getUTCMonth() + 1];
}

/** GT xlsx -> { rows: MizanRow[], yillar } (yıl-sonu = ay 12 kümülatif). */
export function reconstructMizanFromGt(gtPath) {
  const wb = XLSX.readFile(gtPath, { cellDates: false });
  const raw = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: null });

  const G = new Map(); // brans -> kod -> yil -> {month, net}
  const adMap = new Map(); // kod -> normAd
  for (let i = 1; i < raw.length; i++) {
    const r = raw[i];
    if (!r || r[1] !== "Sigorta") continue;
    const hn = String(r[2] ?? "");
    if (hn[0] !== "7" || !/^\d{3}$/.test(hn.slice(0, 3))) continue;
    const b = hn.slice(0, 3), kod = hn.slice(3);
    const [y, m] = serialYM(Number(r[0]));
    if (!(m >= 1 && m <= 12)) continue;
    if (!G.has(b)) G.set(b, new Map());
    if (!G.get(b).has(kod)) G.get(b).set(kod, new Map());
    const cur = G.get(b).get(kod).get(y);
    if (!cur || m > cur.month) G.get(b).get(kod).set(y, { month: m, net: Number(r[4]) || 0 });
    if (!adMap.has(kod)) adMap.set(kod, normAd(r[3]));
  }

  const yilSet = new Set();
  for (const kodMap of G.values())
    for (const yMap of kodMap.values())
      for (const [y, v] of yMap) if (v.month === 12) yilSet.add(y);
  const yillar = [...yilSet].sort((a, b) => a - b);

  const decVal = (b, kod, y) => {
    const v = G.get(b)?.get(kod)?.get(y);
    return v && v.month === 12 ? v.net : 0;
  };

  const rows = [];
  for (const [b, kodMap] of G) {
    for (const y of yillar) {
      for (const [code, kod] of Object.entries(BRIDGE_SINGLE)) {
        rows.push({ yil: y, hesap: code, bransKodu: b, tutar: decVal(b, kod, y) });
      }
      for (const [code, rule] of Object.entries(BRIDGE_SUM)) {
        let sum = 0;
        for (const [kod] of kodMap) {
          if (!kod.startsWith(rule.prefix)) continue;
          const ad = adMap.get(kod) ?? "";
          if (!rule.includes.every((s) => ad.includes(s))) continue;
          if (rule.excludes.some((s) => ad.includes(s))) continue;
          sum += decVal(b, kod, y);
        }
        rows.push({ yil: y, hesap: code, bransKodu: b, tutar: sum });
      }
    }
  }

  return { rows, yillar };
}
