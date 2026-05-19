/** Standart TSB kaynak notu — tüm dashboard sayfalarında aynı metin. */
export default function TsbSourceNote() {
  return (
    <>
      <strong>Kaynak:</strong> TSB kamuya açık istatistikleri. Ofis Akademi veriyi yeniden düzenler; resmi tablo ve
      yöntem için{" "}
      <a
        href="https://www.tsb.org.tr"
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-emerald-800 underline decoration-emerald-600/40 hover:decoration-emerald-700"
      >
        tsb.org.tr
      </a>
      .
    </>
  );
}
