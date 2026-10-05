import { ImageResponse } from "next/og";

// Icono para iOS (pantalla de inicio). Sin transparencia ni bordes redondeados:
// iOS aplica su propia máscara.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f172a",
          fontSize: 120,
          fontWeight: 700,
          color: "#ffffff",
        }}
      >
        P<span style={{ color: "#ef4444" }}>.</span>
      </div>
    ),
    size
  );
}
