import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/seo";

export const alt = siteConfig.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#0f172a",
          color: "#ffffff",
        }}
      >
        <div style={{ fontSize: 32, color: "#f87171" }}>paulzaruma.com</div>
        <div style={{ fontSize: 96, fontWeight: 700, marginTop: 16 }}>Paul Zaruma</div>
        <div style={{ fontSize: 48, fontWeight: 700, color: "#ef4444", marginTop: 8 }}>
          Desarrollador Web y Automatización
        </div>
        <div style={{ fontSize: 32, color: "#94a3b8", marginTop: 32 }}>
          Páginas web · E-commerce · Chatbots de WhatsApp con IA · n8n
        </div>
        <div style={{ fontSize: 32, color: "#cbd5e1", marginTop: 16 }}>
          La Troncal, Cañar · Todo Ecuador
        </div>
      </div>
    ),
    size
  );
}
