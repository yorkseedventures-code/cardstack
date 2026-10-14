"use client";

import { useRouter } from "next/navigation";
import { FREE_SCANS_PER_MONTH, PASS_PRICE, MONTHLY_PRICE, MINI_PRICE, MINI_SCANS, PRICING, SUPPORT_EMAIL } from "@/lib/pricing";

export default function TermsContent() {
  const router = useRouter();

  return (
    <div className="min-h-dvh bg-[#f8f7f5] flex flex-col">
      <nav className="flex items-center justify-between px-6 py-4 max-w-2xl mx-auto w-full">
        <button
          onClick={() => router.push("/landing")}
          className="text-lg font-bold text-[#111]"
        >
          KoiCard
        </button>
        <button
          onClick={() => router.back()}
          className="text-sm text-[#666] hover:text-[#111] transition-colors"
        >
          Back
        </button>
      </nav>

      <main className="flex-1 px-6 py-10 max-w-2xl mx-auto w-full">
        <h1 className="text-3xl font-bold text-[#111] mb-2">
          Terms &amp; Conditions
        </h1>
        <p className="text-xs text-[#bbb] mb-10">Last updated: October 2026</p>

        <div className="flex flex-col gap-8 text-sm text-[#444] leading-relaxed">
          <section>
            <h2 className="text-base font-semibold text-[#111] mb-2">
              1. Using KoiCard
            </h2>
            <p>
              KoiCard lets you scan or upload business cards, extract contact
              details with AI, and save them to your personal contact list.
              By creating an account, you agree to use the app only for
              lawful purposes and to keep your login credentials secure.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[#111] mb-2">
              2. Your content
            </h2>
            <p>
              You own the card images and contact data you upload. You&apos;re
              responsible for making sure you have the right to store and
              process any contact information you scan into the app.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[#111] mb-2">
              3. AI extraction
            </h2>
            <p>
              Contact details are extracted automatically using AI and may
              occasionally be inaccurate or incomplete. Always review
              extracted information before saving or acting on it. LinkedIn
              links are only filled in when they appear on the card; otherwise
              you can add them yourself.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[#111] mb-2">
              4. Optional integrations
            </h2>
            <p>
              Features like Google Sheets sync are opt-in and require you to
              provide your own webhook. You&apos;re responsible for the
              destinations you connect and what happens to data sent there.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[#111] mb-2">
              5. Plans, scan limits and payments
            </h2>
            <p>
              {`Free accounts include ${FREE_SCANS_PER_MONTH} scans per calendar month. Paid options: Event Pass (${PASS_PRICE} one-time, up to ${PRICING.pass.scanCap} scans over ${PRICING.pass.durationDays} days), Monthly (${MONTHLY_PRICE} per month, up to ${PRICING.monthly.scanCap} scans per month, renews until cancelled) and Mini Pass (${MINI_PRICE} one-time, ${MINI_SCANS} additional scans valid ${PRICING.mini.validDays} days). Prices are in US dollars. Payments are processed by Stripe; we never see or store your card details.`}
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[#111] mb-2">
              6. Cancellations and refunds
            </h2>
            <p>
              {`You can cancel Monthly at any time by emailing ${SUPPORT_EMAIL}; cancelling stops future renewals and you keep access until the end of the period you've paid for. Event Passes and Mini Passes are one-time purchases that don't renew. Because scans use paid AI processing, purchases are generally non-refundable once used, but if something went wrong with a payment or the service, email ${SUPPORT_EMAIL} and we'll make it right.`}
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[#111] mb-2">
              7. Fair use
            </h2>
            <p>
              {`Scan limits exist to keep KoiCard affordable. Scans are for business cards you have legitimately received. Automated, bulk or abusive use, or sharing one account across many people, may be limited or suspended. Need higher volume? Email ${SUPPORT_EMAIL}.`}
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[#111] mb-2">
              8. Saved contacts
            </h2>
            <p>
              Reaching a scan limit never locks or deletes the contacts you've already saved. You can always view, edit and export them, including your color labels, in your CSV export.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[#111] mb-2">
              9. Availability
            </h2>
            <p>
              KoiCard is provided as-is. We aim for reliable uptime but
              don&apos;t guarantee the service will be uninterrupted or
              error-free.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[#111] mb-2">
              10. Changes
            </h2>
            <p>
              We may update these terms from time to time. Continued use of
              KoiCard after changes means you accept the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[#111] mb-2">
              11. Privacy
            </h2>
            <p>
              See our{" "}
              <button
                onClick={() => router.push("/privacy")}
                className="text-brand underline underline-offset-2"
              >
                Privacy Policy
              </button>{" "}
              for details on how your data is handled. In short, we
              don&apos;t use or look at it.
            </p>
          </section>
        </div>
      </main>

      <footer className="text-center py-6 text-xs text-[#ccc]">
        A Yorkseed product
      </footer>
    </div>
  );
}
