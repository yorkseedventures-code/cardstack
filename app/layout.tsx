import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SITE_URL, SITE_NAME, SITE_TAGLINE, SITE_DESCRIPTION, OG_IMAGE_PATH, OG_IMAGE_WIDTH, OG_IMAGE_HEIGHT } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} — ${SITE_TAGLINE}`, template: `%s · ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  keywords: [
    "business card scanner", "digital business cards", "networking app",
    "contact management", "AI business card reader", "conference networking",
    "CRM for networking", "business card OCR", "vCard scanner",
  ],
  applicationName: SITE_NAME,
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: SITE_NAME },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: [{ url: OG_IMAGE_PATH, width: OG_IMAGE_WIDTH, height: OG_IMAGE_HEIGHT, alt: `${SITE_NAME} — ${SITE_TAGLINE}` }],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE_PATH],
  },
  icons: {
    icon: [{ url: "/icon-192.png", sizes: "192x192", type: "image/png" }, { url: "/icon-512.png", sizes: "512x512", type: "image/png" }],
    apple: [{ url: "/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#fff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body>{children}</body>
    </html>
  );
}
