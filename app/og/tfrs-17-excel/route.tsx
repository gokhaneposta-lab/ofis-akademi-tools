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
          backgroundImage:
            "linear-gradient(135deg, #ecfdf5 0%, #ffffff 55%, #e0f2fe 100%)",
          fontFamily: "sans-serif",
          color: "#0f172a",
          padding: "56px 64px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 24,
            color: "#047857",
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
              backgroundColor: "#047857",
              color: "#ffffff",
              fontSize: 22,
              fontWeight: 800,
            }}
          >
            O
          </div>
          Ofis Akademi · Finans &amp; Sigorta
        </div>

        <div
          style={{
            marginTop: 18,
            fontSize: 64,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: -0.5,
            display: "flex",
            flexWrap: "wrap",
          }}
        >
          IFRS 17 — Excel Örnek Model
        </div>
        <div
          style={{
            marginTop: 12,
            fontSize: 28,
            color: "#334155",
            lineHeight: 1.35,
            maxWidth: 900,
          }}
        >
          CSM (Sözleşme Hizmet Marjı) nasıl hesaplanır? Ücretsiz şablon, formüllü basit örnek.
        </div>

        <div
          style={{
            marginTop: 36,
            display: "flex",
            alignItems: "stretch",
            gap: 28,
            flex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1.15,
              borderRadius: 18,
              border: "2px solid #a7f3d0",
              backgroundColor: "#ffffff",
              boxShadow: "0 18px 40px rgba(16,185,129,0.18)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "14px 20px",
                backgroundColor: "#047857",
                color: "#ffffff",
                fontSize: 18,
                fontWeight: 700,
              }}
            >
              tfrs-17-ornek-model.xlsx · Basit ornek
            </div>

            <div style={{ display: "flex", flexDirection: "column", padding: 20, gap: 12 }}>
              <Row label="Prim" value="1.200 TL" />
              <Row label="Beklenen maliyet" value="960 TL" />
              <Row label="Beklenen kâr (başlangıç CSM)" value="= 240 TL" highlight />
              <Row label="Hizmet süresi" value="12 ay" />
              <Row label="Aylık itfa (eşit dağılım)" value="= 20 TL" highlight />
            </div>

            <div
              style={{
                marginTop: "auto",
                padding: "12px 20px",
                backgroundColor: "#ecfdf5",
                color: "#065f46",
                fontSize: 16,
                borderTop: "1px solid #a7f3d0",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              Formül: B6 = B4 − B5 · B8 = B6 ÷ B7
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              borderRadius: 18,
              border: "1px solid #bae6fd",
              backgroundColor: "#ffffff",
              padding: 20,
              gap: 14,
            }}
          >
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "#0c4a6e",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              KPI sablonu · CSM roll-forward
            </div>
            <MiniRow label="Açılış CSM" />
            <MiniRow label="+ Yeni sözleşmeler" />
            <MiniRow label="+ Faiz birikimi" />
            <MiniRow label="± Unlocking" />
            <MiniRow label="− Dönem itfası" />
            <div
              style={{
                marginTop: "auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                borderRadius: 12,
                backgroundColor: "#e0f2fe",
                color: "#0c4a6e",
                fontSize: 16,
                fontWeight: 700,
              }}
            >
              = Kapanış CSM
              <span style={{ fontSize: 14, fontWeight: 500, opacity: 0.85 }}>dönem sonu</span>
            </div>
          </div>
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
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span
              style={{
                display: "flex",
                alignItems: "center",
                padding: "8px 14px",
                backgroundColor: "#047857",
                color: "#ffffff",
                borderRadius: 999,
                fontSize: 18,
                fontWeight: 700,
              }}
            >
              Ücretsiz indir · .xlsx
            </span>
            <span>ofisakademi.com/blog</span>
          </div>
          <span style={{ fontSize: 16, color: "#64748b" }}>
            Eğitim amaçlıdır — TMS/TFRS yerine geçmez.
          </span>
        </div>
      </div>
    ),
    { width: WIDTH, height: HEIGHT },
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 14px",
        borderRadius: 10,
        backgroundColor: highlight ? "#ecfdf5" : "#f8fafc",
        border: `1px solid ${highlight ? "#6ee7b7" : "#e2e8f0"}`,
        fontSize: 20,
        color: highlight ? "#065f46" : "#0f172a",
      }}
    >
      <span style={{ fontWeight: 500 }}>{label}</span>
      <span style={{ fontWeight: 700 }}>{value}</span>
    </div>
  );
}

function MiniRow({ label }: { label: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "8px 12px",
        borderRadius: 8,
        backgroundColor: "#f1f5f9",
        border: "1px solid #e2e8f0",
        fontSize: 17,
        color: "#334155",
      }}
    >
      {label}
    </div>
  );
}
