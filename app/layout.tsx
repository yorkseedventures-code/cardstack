import type { Metadata, Viewport } from "next";
import { Sora, Instrument_Serif } from "next/font/google";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CardStack",
  description: "Scan business cards. Build your network.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CardStack",
  },
};

export const viewport: Viewport = {
  themeColor: "#f8f7f5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${sora.variable} ${instrumentSerif.variable} font-sans bg-[#f8f7f5] text-[#111]`}>
        {children}
      </body>
    </html>
  );
}
