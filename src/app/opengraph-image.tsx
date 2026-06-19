import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "心电学堂 — AI心电图判读教学平台";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function og() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0F2540 0%, #2D8C6A 50%, #1A365D 100%)",
          fontFamily: '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif',
          padding: 60,
        }}
      >
        {/* ECG trace decoration */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24, opacity: 0.6 }}>
          <div style={{ width: 60, height: 2, background: "#60a5fa", borderRadius: 1 }} />
          <div style={{ width: 8, height: 40, background: "#60a5fa", borderRadius: 2 }} />
          <div style={{ width: 4, height: 80, background: "#f87171", borderRadius: 2 }} />
          <div style={{ width: 8, height: 30, background: "#60a5fa", borderRadius: 2 }} />
          <div style={{ width: 4, height: 4, background: "#60a5fa", borderRadius: 2 }} />
          <div style={{ width: 100, height: 2, background: "#60a5fa", borderRadius: 1 }} />
          <div style={{ width: 4, height: 50, background: "#f87171", borderRadius: 2 }} />
          <div style={{ width: 60, height: 2, background: "#60a5fa", borderRadius: 1 }} />
        </div>

        {/* Main title */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 900,
            color: "#ffffff",
            lineHeight: 1.1,
            textAlign: "center",
            marginBottom: 20,
            letterSpacing: -1,
          }}
        >
          心电学堂
        </div>

        <div
          style={{
            fontSize: 32,
            fontWeight: 500,
            color: "#93c5fd",
            textAlign: "center",
            marginBottom: 40,
          }}
        >
          AI 心电图判读教学平台
        </div>

        {/* Category tags */}
        <div
          style={{
            display: "flex",
            gap: 20,
            marginBottom: 40,
          }}
        >
          {["正常心电图", "心律失常", "心肌缺血", "起搏器", "急诊"].map((cat) => (
            <div
              key={cat}
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: "#bfdbfe",
                background: "rgba(255,255,255,0.12)",
                padding: "8px 18px",
                borderRadius: 20,
              }}
            >
              {cat}
            </div>
          ))}
        </div>

        <div style={{ fontSize: 20, fontWeight: 400, color: "rgba(255,255,255,0.5)" }}>
          AI 导师像高年资医生一样，一句一句追问，带你学会读每一份心电图
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
