/**
 * V2 push öncesi doğrulama:
 * 1) Negatif banka bakiyesi flag
 * 2) Yerel mizan varsa 2025 proxy vs 60301 sapma
 * 3) F368 (61402) branş payı beslemesi
 */
import { buildFaaliyetGiderSonuc } from "../lib/butce/gelir/faaliyetGiderGt";
import { ORAN_KALEM_MIZAN } from "../lib/butce/oran/oranKalemLoader";
import { MizanOranServisi } from "../lib/butce/oran/mizanOranlar";
import { loadMizanRows, loadBilancoAylikRows, loadMizanAylikRows } from "../lib/butce/loadData";
import { buildMaliGelirProxy } from "../lib/butce/v2/maliGelirProxy";
import type { FaaliyetGiderRow, MizanRow } from "../lib/butce/types";

function pct(n: number): string {
  if (!Number.isFinite(n)) return "n/a";
  return `${(n * 100).toFixed(2)}%`;
}

function section(title: string) {
  console.log(`\n=== ${title} ===`);
}

async function checkNegatifBakiye() {
  section("1) Negatif bakiye flag");
  const aylikToplam: Record<number, number[]> = {
    11: Array(12).fill(100),
    105: Array(12).fill(0),
    86: Array(12).fill(0),
    96: Array(12).fill(500),
    177: Array(12).fill(0),
    19: Array(12).fill(0),
    190: Array(12).fill(0),
    191: Array(12).fill(0),
    192: Array(12).fill(0),
    193: Array(12).fill(0),
    194: Array(12).fill(0),
  };
  const proxy = buildMaliGelirProxy({
    aylikToplam,
    aylikGetiriOrani: Array(12).fill(0.02),
    acilisBanka: 1000,
    acilisKaynak: "102/100",
  });
  const firstNeg = proxy.negatifBakiyeAylar[0];
  console.log("negatifBakiyeAylar:", proxy.negatifBakiyeAylar.join(", ") || "(yok)");
  console.log(
    "uyarı içeriyor mu:",
    proxy.uyarilar.some((u) => u.includes("Negatif banka bakiyesi")),
  );
  for (const a of proxy.aylar) {
    if (a.negatifBakiye) {
      console.log(
        `  ${a.ayAd}: ayBaş=${a.ayBasiBanka.toFixed(0)} aySon=${a.aySonuBanka.toFixed(0)} flag=true`,
      );
    }
  }
  if (!firstNeg || !proxy.aylar[firstNeg - 1]?.negatifBakiye) {
    throw new Error("Negatif bakiye senaryosu flag üretmedi");
  }
  console.log("OK — flag + uyarı üretiliyor");
}

async function checkF368() {
  section("3) F368 branş payı (61402)");
  const spec = ORAN_KALEM_MIZAN["F368"];
  console.log("ORAN_KALEM_MIZAN.F368:", JSON.stringify(spec));
  if (!spec || spec.pay[0] !== "61402" || spec.baz[0] !== "61402") {
    throw new Error("F368 pay/baz 61402 olmalı");
  }
  if (!spec.baz_toplam_sirket) {
    throw new Error("F368 baz_toplam_sirket true olmalı");
  }

  const mizan: MizanRow[] = [
    { yil: 2025, bransKodu: "711", hesap: "61402", tutar: 60 },
    { yil: 2025, bransKodu: "712", hesap: "61402", tutar: 40 },
    { yil: 2025, bransKodu: "711", hesap: "60001", tutar: 1000 },
    { yil: 2025, bransKodu: "712", hesap: "60001", tutar: 1000 },
  ];
  const servis = new MizanOranServisi(mizan, 2026);
  const tablo = servis.tumBranslarTablosu("F368", {});
  const aktif = tablo.filter((r) => ["711", "712"].includes(r.bransKodu));
  console.log(
    "tumBranslarTablosu F368:",
    aktif.map((r) => `${r.bransKodu}=${r.oran.toFixed(4)}`).join(" | "),
  );
  const o711 = aktif.find((r) => r.bransKodu === "711")?.oran ?? 0;
  const o712 = aktif.find((r) => r.bransKodu === "712")?.oran ?? 0;
  if (Math.abs(o711 - 0.6) > 1e-9 || Math.abs(o712 - 0.4) > 1e-9) {
    throw new Error(`Beklenen 0.6/0.4, gelen ${o711}/${o712}`);
  }

  const rows: FaaliyetGiderRow[] = [
    {
      butceYili: 2026,
      ay: 1,
      hesap: "61402",
      tutar: 1000,
      bransKodu: "",
    },
  ];
  const sonuc = buildFaaliyetGiderSonuc({
    butceYili: 2026,
    rows,
    mizan,
    aktifBransKodlari: ["711", "712"],
  });
  if (!sonuc) throw new Error("buildFaaliyetGiderSonuc null");
  const g711 = Math.abs(sonuc.find((b) => b.bransKodu === "711")?.gtYillik[190] ?? 0);
  const g712 = Math.abs(sonuc.find((b) => b.bransKodu === "712")?.gtYillik[190] ?? 0);
  console.log(`Dağıtım 61402→F190: 711=${g711.toFixed(2)} 712=${g712.toFixed(2)} (sum=${(g711 + g712).toFixed(2)})`);
  if (Math.abs(g711 - 600) > 0.01 || Math.abs(g712 - 400) > 0.01) {
    throw new Error("F368 dağıtımı 600/400 üretmedi");
  }
  console.log("OK — F368 61402 payları ile şirket geneli gider branşlara dağıtılıyor");
}

async function check60301() {
  section("2) 2025 proxy vs gerçekleşen 60301");
  const mizan = await loadMizanRows();
  const mizanAylik = await loadMizanAylikRows();
  const bilancoAylik = await loadBilancoAylikRows();
  console.log(
    `Yüklenen: mizan=${mizan.length} mizanAylik=${mizanAylik.length} bilancoAylik=${bilancoAylik.length}`,
  );

  if (mizan.length === 0) {
    console.log(
      "BLOCKED: Yerel/Blob private mizan-tidy.json yok. data/butce/private yalnızca gt-bl-tidy + hedef-prim içeriyor; 60301 şirket mizanı bulunamadı.",
    );
    console.log(
      "Sapma raporu için: UNPIVOT mizan + aylık GT/bilanço yükleyin (butce:import-mizan / aylık GT), sonra bu scripti tekrar çalıştırın.",
    );
    return { blocked: true as const };
  }

  const y2025 = mizan.filter((r) => r.yil === 2025);
  const gercek60301 = y2025
    .filter((r) => String(r.hesap).replace(/\D/g, "").startsWith("60301"))
    .reduce((a, r) => a + (Number(r.tutar) || 0), 0);
  console.log("2025 Σ 60301 (mizan):", gercek60301);

  // Basit retrospektif: gerçekleşen GT benzeri nakit proxy için 2025 mizan aylık yoksa yıllık eşit dağıt.
  // Not: Bu tam V2 GT zinciri değil; açılış + sabit getiri ile kaba sapma.
  const acilisRows = mizan.filter((r) => r.yil === 2024);
  const acilis102 = acilisRows
    .filter((r) => {
      const h = String(r.hesap).replace(/\D/g, "");
      return h === "102" || h.startsWith("102") || h === "100" || h.startsWith("100");
    })
    .reduce((a, r) => a + Math.abs(Number(r.tutar) || 0), 0);
  const acilis10 = acilisRows
    .filter((r) => String(r.hesap).replace(/\D/g, "") === "10" || String(r.hesap).replace(/\D/g, "").startsWith("10"))
    .reduce((a, r) => a + Math.abs(Number(r.tutar) || 0), 0);
  // Too broad for 10* — prefer leaf only when present
  let acilis = acilis102;
  let kaynak: "102/100" | "10" | "yok" = "102/100";
  if (acilis <= 0) {
    const only10 = acilisRows
      .filter((r) => String(r.hesap).replace(/\D/g, "") === "10")
      .reduce((a, r) => a + Math.abs(Number(r.tutar) || 0), 0);
    acilis = only10 > 0 ? only10 : 0;
    kaynak = only10 > 0 ? "10" : "yok";
  }
  void acilis10;

  const sumH = (prefix: string) =>
    y2025
      .filter((r) => {
        const h = String(r.hesap).replace(/\D/g, "");
        return h === prefix || h.startsWith(prefix);
      })
      .reduce((a, r) => a + Math.abs(Number(r.tutar) || 0), 0);

  const aylik = (yillik: number) => Array.from({ length: 12 }, () => yillik / 12);
  const aylikToplam: Record<number, number[]> = {
    11: aylik(sumH("60001")),
    105: aylik(sumH("61002")),
    86: aylik(sumH("605")),
    96: aylik(sumH("61001")),
    177: aylik(sumH("614011")), // kaba komisyon proxy
    19: aylik(sumH("60002")),
    190: aylik(sumH("61402")),
    191: aylik(sumH("61403")),
    192: aylik(sumH("61404")),
    193: aylik(sumH("61405")),
    194: aylik(sumH("61406")),
  };

  // Getiri: gerçekleşen 60301 / ortalama stok yaklaşık — ama sapmayı ölçmek için sabit yıllık/12 getiri denemesi:
  // önce 0 getiri ile net nakit yolu, sonra efektif getiri = 60301/ortalama aybaş — circular.
  // Kullanıcı senaryosu: V2'yi 2025 gerçekleşen mizanla çalıştır; getiri bilinmiyor.
  // Rapor: birkaç sabit aylık getiri varsayımıyla sapma tablosu.
  const getiriVarsayımlari = [0.02, 0.03, 0.035, 0.04];
  console.log(`Açılış banka (kaba): ${acilis} (${kaynak})`);
  console.log("Not: Tam V2 GT (oran motoru+KPK) yerine mizan kalemlerinin 1/12 dağılımı kullanıldı.");
  for (const g of getiriVarsayımlari) {
    const proxy = buildMaliGelirProxy({
      aylikToplam,
      aylikGetiriOrani: Array(12).fill(g),
      acilisBanka: acilis,
      acilisKaynak: kaynak,
    });
    const pred = proxy.maliGelirYillik;
    const sapma = gercek60301 !== 0 ? pred / gercek60301 - 1 : NaN;
    console.log(
      `  aylık getiri ${pct(g)} → proxy=${pred.toFixed(0)} 60301=${gercek60301.toFixed(0)} sapma=${pct(sapma)} negatifAylar=${proxy.negatifBakiyeAylar.join(",") || "-"}`,
    );
  }
  return { blocked: false as const, gercek60301 };
}

async function main() {
  await checkNegatifBakiye();
  const r = await check60301();
  await checkF368();
  section("Özet");
  console.log("1 Negatif bakiye UI/flag: motor OK (UI banner+satır bayrağı eklendi)");
  console.log(
    r.blocked
      ? "2 60301 sapma: VERİ YOK — mizan yüklenmeden ölçülemedi"
      : `2 60301 sapma: ölçüm yukarıda (gerçek=${r.gercek60301})`,
  );
  console.log("3 F368: 61402 pay/baz + dağıtım OK");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
