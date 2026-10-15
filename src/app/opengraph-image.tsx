import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "AIR Club UdeSA — Artificial Intelligence & Robotics Club";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(160deg, #faf8f8 0%, #f3eeef 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            fontSize: 30,
            color: "#8f5261",
            letterSpacing: 4,
            textTransform: "uppercase",
            marginBottom: 28,
          }}
        >
          Universidad de San Andrés
        </div>
        <div style={{ display: "flex", fontSize: 220, fontWeight: 800, color: "#a40c4c", lineHeight: 1 }}>
          AIR Club
        </div>
        <div style={{ display: "flex", fontSize: 34, color: "#1a0810", marginTop: 28, opacity: 0.78 }}>
          Artificial Intelligence &amp; Robotics Club
        </div>
      </div>
    ),
    { ...size }
  );
}
