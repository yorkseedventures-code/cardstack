"use client";

import { useRouter } from "next/navigation";

export default function TermsPage() {
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
          Terms & Conditions
        </h1>
        <p className="text-xs text-[#bbb] mb-10">Last updated: August 2026</p>

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
              extracted information before saving or acting on it.
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
              5. Availability
            </h2>
            <p>
              KoiCard is provided as-is. We aim for reliable uptime but
              don&apos;t guarantee the service will be uninterrupted or
              error-free.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[#111] mb-2">
              6. Changes
            </h2>
            <p>
              We may update these terms from time to time. Continued use of
              KoiCard after changes means you accept the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[#111] mb-2">
              7. Privacy
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
