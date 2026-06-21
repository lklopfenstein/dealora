import { ImageResponse } from "next/og";

export const alt = "Dealora — Great prices, minus the scavenger hunt";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "#f7f5ed", color: "#171816", fontFamily: "Arial, sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, fontWeight: 800, fontSize: 42 }}>
        <div style={{ width: 43, height: 43, borderRadius: 99, background: "#ff6534", boxShadow: "17px -10px 0 #d8ff55" }} />
        dealora
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 84, lineHeight: .95, letterSpacing: -5, fontWeight: 800 }}>Great prices,</div>
        <div style={{ fontSize: 84, lineHeight: .95, letterSpacing: -5, fontWeight: 500, color: "#ff6534" }}>minus the scavenger hunt.</div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 23, color: "#656860" }}>
        <span>Fresh finds from across the web, every day.</span>
        <span style={{ display: "flex", padding: "12px 22px", borderRadius: 99, background: "#171816", color: "white", fontWeight: 700 }}>Curated, not crowded.</span>
      </div>
    </div>,
    size,
  );
}
