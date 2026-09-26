/**
 * Konu kotalı seçim + tekrar koruması.
 * node --import tsx --test lib/exam/selectQuestions.test.ts
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { normalizeQuestionText } from "./dedupe";
import { selectQuestionIds, type SelectableQuestion } from "./selectQuestions";
import { computeSectionQuotas, type ExamSelectionRules } from "./sections";

const RULES: ExamSelectionRules = {
  sections: [
    { key: "tfrs17", label: "TFRS 17", weight: 40, default: true },
    { key: "muhasebe", label: "Muhasebe", weight: 30, categories: ["Muhasebe ve Finansal Raporlama"] },
    { key: "ekonomi", label: "Ekonomi", weight: 15, categories: ["Ekonomi ve Finans Teorisi"] },
    { key: "mevzuat", label: "Mevzuat", weight: 15, categories: ["Temel Sigortacılık Mevzuatı"] },
  ],
};

function bank(): SelectableQuestion[] {
  const out: SelectableQuestion[] = [];
  const add = (prefix: string, category: string, n: number) => {
    for (let i = 0; i < n; i++) {
      out.push({ id: `${prefix}${i}`, category, question_text: `${prefix} benzersiz soru metni numara ${prefix}-${i}-${"x".repeat(i)}` });
    }
  };
  add("t", "CSM ve Kapsama Birimleri", 120);
  add("m", "Muhasebe ve Finansal Raporlama", 60);
  add("e", "Ekonomi ve Finans Teorisi", 45);
  add("v", "Temel Sigortacılık Mevzuatı", 45);
  // Aynı sorunun "(Uygulama Örneği #N)" kopyaları
  for (let i = 0; i < 13; i++) {
    out.push({
      id: `dup${i}`,
      category: "Sözleşme Sınırı (Contract Boundary)",
      question_text: `Sözleşme Sınırı hangi noktada sona erer? (Uygulama Örneği #${i + 20})`,
    });
  }
  return out;
}

function seeded(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

describe("computeSectionQuotas", () => {
  it("50 soruda 20/15 ve 7-8 dağılımı, toplam 50", () => {
    for (let seed = 1; seed < 40; seed++) {
      const q = computeSectionQuotas(RULES, 50, seeded(seed));
      assert.equal(q.get("tfrs17"), 20);
      assert.equal(q.get("muhasebe"), 15);
      const e = q.get("ekonomi")!;
      const v = q.get("mevzuat")!;
      assert.ok([7, 8].includes(e) && [7, 8].includes(v));
      assert.equal(e + v, 15);
    }
  });
});

describe("selectQuestionIds", () => {
  it("kotaya uyar, ID ve metin tekrarı yoktur", () => {
    const b = bank();
    const byId = new Map(b.map((q) => [q.id, q]));
    for (let seed = 1; seed < 200; seed++) {
      const ids = selectQuestionIds(b, 50, RULES, seeded(seed));
      assert.equal(ids.length, 50);
      assert.equal(new Set(ids).size, 50);
      const texts = ids.map((id) => normalizeQuestionText(byId.get(id)!.question_text));
      assert.equal(new Set(texts).size, 50, "aynı metin iki kez seçildi");
      const cat = (c: string) => ids.filter((id) => byId.get(id)!.category === c).length;
      assert.equal(cat("Muhasebe ve Finansal Raporlama"), 15);
      assert.equal(cat("Ekonomi ve Finans Teorisi") + cat("Temel Sigortacılık Mevzuatı"), 15);
      const dupCount = ids.filter((id) => id.startsWith("dup")).length;
      assert.ok(dupCount <= 1);
    }
  });

  it("bir bölümün havuzu yetmezse diğerlerinden tamamlar", () => {
    const b = bank().filter((q) => !(q.category === "Temel Sigortacılık Mevzuatı" && Number(q.id.slice(1)) >= 3));
    const ids = selectQuestionIds(b, 50, RULES, seeded(7));
    assert.equal(ids.length, 50);
    assert.equal(new Set(ids).size, 50);
  });

  it("kural yoksa tamamen rastgele ama tekil seçer", () => {
    const ids = selectQuestionIds(bank(), 50, null, seeded(3));
    assert.equal(new Set(ids).size, 50);
  });
});
