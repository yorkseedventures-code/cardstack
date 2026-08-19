import type { Metadata } from "next";
import TermsContent from "@/components/TermsContent";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: `The terms of service for using ${SITE_NAME}, the AI-powered business card scanner.`,
  alternates: { canonical: "/terms" },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/terms`,
    title: `Terms & Conditions · ${SITE_NAME}`,
    description: `The terms of service for using ${SITE_NAME}, the AI-powered business card scanner.`,
  },
};

export default function TermsPage() {
  return <TermsContent />;
}
