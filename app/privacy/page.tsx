import type { Metadata } from "next";
import PrivacyContent from "@/components/PrivacyContent";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${SITE_NAME} collects, uses, and protects your contact data and scanned business cards.`,
  alternates: { canonical: "/privacy" },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/privacy`,
    title: `Privacy Policy · ${SITE_NAME}`,
    description: `How ${SITE_NAME} collects, uses, and protects your contact data and scanned business cards.`,
  },
};

export default function PrivacyPage() {
  return <PrivacyContent />;
}
