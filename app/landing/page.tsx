import type { Metadata } from "next";
import LandingContent from "@/components/LandingContent";
import { FAQS } from "@/lib/faqs";
import { SITE_URL, SITE_NAME, SITE_TAGLINE, SITE_DESCRIPTION, OG_IMAGE_PATH, OG_IMAGE_WIDTH, OG_IMAGE_HEIGHT } from "@/lib/seo";

export const metadata: Metadata = {
  title: SITE_TAGLINE,
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/landing" },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/landing`,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: [{ url: OG_IMAGE_PATH, width: OG_IMAGE_WIDTH, height: OG_IMAGE_HEIGHT, alt: `${SITE_NAME} — ${SITE_TAGLINE}` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE_PATH],
  },
};

export default function LandingPage() {
  const softwareAppJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web, iOS, Android",
    description: SITE_DESCRIPTION,
    url: `${SITE_URL}/landing`,
    image: `${SITE_URL}${OG_IMAGE_PATH}`,
    offers: [
      { "@type": "Offer", name: "Free", price: "0", priceCurrency: "USD", description: "20 scans per month" },
      { "@type": "Offer", name: "Event Pass", price: "5.99", priceCurrency: "USD", description: "Unlimited scans for 4 days" },
      { "@type": "Offer", name: "Monthly", price: "7.99", priceCurrency: "USD", description: "Unlimited scans, billed monthly" },
    ],
    publisher: { "@type": "Organization", name: "Yorkseed Venture Studio" },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map(f => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <LandingContent />
    </>
  );
}
