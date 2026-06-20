import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const dynamic = "force-static";
export const revalidate = false;

const WIDTH = 1200;
const HEIGHT = 630;

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#ffffff",
          backgroundImage: "linear-gradient(135deg, #e0f2fe 0%, #ffffff 50%, #ecfdf5 100%)",
          fontFamily: "sans-serif",
          color: "#0f172a",
          padding: "52px 60px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 22,
            color: "#0369a1",
            fontWeight: 700,
            letterSpacing: 1,
            textTransform: "uppercase",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 44,
              height: 44,
              borderRadius: 10,
              backgroundColor: "#0369a1",
              color: "#ffffff",
              fontSize: 22,
              fontWeight: 800,
            }}
          >
            O
          </div>
          Ofis Akademi · TSB Dashboard
        </div>

        <div
          style={{
            marginTop: 20,
            fontSize: 58,
            fontWeight: 800,
            lineHeight: 1.08,
            letterSpacing: -0.5,
            display: "flex",
            flexWrap: "wrap",
            maxWidth: 980,
          }}
        >
          TSB Prim &amp; Finansal İstatistikleri
        </div>
        <div
          style={{
            marginTop: 14,
            fontSize: 26,
            color: "#334155",
            lineHeight: 1.35,
            maxWidth: 880,
          }}
        >
          Kanal · branş · H/P · finansal KPI — şirket vs sektör, tarayıcıda canlı karşılaştırma
        </div>

        <div
          style={{
            marginTop: 36,
            display: "flex",
            gap: 16,
            flex: 1,
          }}
        >
          <Panel title="Kanal prim" rows={["Merkez · Acente", "Banka · Broker", "Sıra & pay %"]} color="#0284c7" />
          <Panel title="Branş & H/P" rows={["Pazar payı Δ", "Hasar/prim oranı", "GT branş kırılımı"]} color="#059669" />
          <Panel title="Finansal KPI" rows={["Gelir tablosu", "Bilanço oranları", "Çeyreklik Δ YoY"]} color="#7c3aed" />
        </div>

        <div
          style={{
            marginTop: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 20,
            color: "#475569",
          }}
        >
          <span
            style={{
              display: "flex",
              alignItems: "center",
              padding: "8px 16px",
              backgroundColor: "#0369a1",
              color: "#ffffff",
              borderRadius: 999,
              fontSize: 18,
              fontWeight: 700,
            }}
          >
            Ücretsiz · ofisakademi.com/sigorta/tsb
          </span>
          <span style={{ fontSize: 16, color: "#64748b" }}>Kaynak: TSB kamuya açık istatistikleri</span>
        </div>
      </div>
    ),
    { width: WIDTH, height: HEIGHT },
  );
}

function Panel({ title, rows, color }: { title: string; rows: string[]; color: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        borderRadius: 16,
        border: `2px solid ${color}33`,
        backgroundColor: "#ffffff",
        overflow: "hidden",
        boxShadow: "0 12px 32px rgba(15,23,42,0.08)",
      }}
    >
      <div
        style={{
          padding: "14px 18px",
          backgroundColor: color,
          color: "#ffffff",
          fontSize: 20,
          fontWeight: 700,
        }}
      >
        {title}
      </div>
      <div style={{ display: "flex", flexDirection: "column", padding: 16, gap: 10 }}>
        {rows.map((row) => (
          <div
            key={row}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              backgroundColor: "#f8fafc",
              border: "1px solid #e2e8f0",
              fontSize: 18,
              color: "#334155",
            }}
          >
            {row}
          </div>
        ))}
      </div>
    </div>
  );
}
