import { ImageResponse } from "next/og";

// Favicon con la marca "P." del logo (Paul.dev). Google pide múltiplos de 48px.
export const size = { width: 96, height: 96 };
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: 22,
          fontSize: 68,
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
