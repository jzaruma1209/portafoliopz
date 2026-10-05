import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { siteConfig, serviceNames, faqList } from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: siteConfig.title,
  description: siteConfig.description,
  keywords: [
    "desarrollador web La Troncal",
    "páginas web La Troncal",
    "desarrollador web Cañar",
    "diseño web Cañar",
    "desarrollador de software Ecuador",
    "desarrollador full-stack Ecuador",
    "chatbot WhatsApp Ecuador",
    "automatización n8n Ecuador",
    "tienda online Ecuador",
    "arquitectura de software",
    "Paul Zaruma",
  ],
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "es_EC",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  other: {
    "geo.region": siteConfig.regionCode,
    "geo.placename": `${siteConfig.city}, ${siteConfig.region}, ${siteConfig.country}`,
  },
  icons: {
    icon: "/paul.png",
  },
};

const address = {
  "@type": "PostalAddress",
  addressLocality: siteConfig.city,
  addressRegion: siteConfig.region,
  addressCountry: siteConfig.countryCode,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteConfig.url}/#website`,
      url: siteConfig.url,
      name: siteConfig.name,
      description: siteConfig.description,
      inLanguage: "es-EC",
      publisher: { "@id": `${siteConfig.url}/#person` },
    },
    {
      "@type": "Person",
      "@id": `${siteConfig.url}/#person`,
      name: siteConfig.name,
      alternateName: siteConfig.fullName,
      jobTitle: siteConfig.jobTitle,
      description: siteConfig.description,
      url: siteConfig.url,
      image: `${siteConfig.url}/paul.png`,
      email: `mailto:${siteConfig.email}`,
      address,
      sameAs: [siteConfig.linkedin, siteConfig.github],
      knowsAbout: [
        "Arquitectura de software",
        "Desarrollo web full-stack",
        "React",
        "Next.js",
        "TypeScript",
        "Node.js",
        "n8n",
        "Automatización de procesos",
        "WhatsApp Business API",
        "Chatbots con inteligencia artificial",
        "E-commerce",
        "Supabase",
        "PostgreSQL",
        "Docker",
        "Integración de APIs",
        "Testing de software",
      ],
    },
    {
      "@type": "ProfessionalService",
      "@id": `${siteConfig.url}/#business`,
      name: `${siteConfig.name} – Desarrollo Web y Automatización`,
      description: siteConfig.description,
      url: siteConfig.url,
      image: `${siteConfig.url}/paul.png`,
      email: siteConfig.email,
      founder: { "@id": `${siteConfig.url}/#person` },
      address,
      areaServed: [
        { "@type": "City", name: `${siteConfig.city}, ${siteConfig.region}` },
        { "@type": "AdministrativeArea", name: `Provincia del ${siteConfig.region}` },
        { "@type": "Country", name: siteConfig.country },
      ],
      knowsLanguage: "es",
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Servicios de desarrollo de software",
        itemListElement: serviceNames.map((name) => ({
          "@type": "Offer",
          itemOffered: { "@type": "Service", name, areaServed: siteConfig.country },
        })),
      },
    },
    {
      "@type": "FAQPage",
      "@id": `${siteConfig.url}/#faq`,
      mainEntity: faqList.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-EC" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/paul.png" type="image/png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
        {children}
      </body>
    </html>
  );
}
