"use client";

import { useRouter } from "next/navigation";

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <div className="min-h-dvh bg-[#f8f7f5] flex flex-col">
      <nav className="flex items-center justify-between px-6 py-4 max-w-2xl mx-auto w-full">
        <button
          onClick={() => router.push("/landing")}
          className="text-lg font-bold text-[#111]"
        >
          ScanBiz
        </button>
        <button
          onClick={() => router.back()}
          className="text-sm text-[#666] hover:text-[#111] transition-colors"
        >
          Back
        </button>
      </nav>

      <main className="flex-1 px-6 py-10 max-w-2xl mx-auto w-full">
        <h1 className="text-3xl font-bold text-[#111] mb-2">Privacy Policy</h1>
        <p className="text-xs text-[#bbb] mb-10">Last updated: August 2026</p>

        <div className="bg-white border border-brand/20 rounded-xl p-5 mb-10">
          <p className="text-sm text-[#111] leading-relaxed">
            The short version: your data is yours. We don&apos;t use it, sell
            it, or look at it. Contacts, photos, and card scans stay tied to
            your account and are only ever used to run the app for you.
          </p>
        </div>

        <div className="flex flex-col gap-8 text-sm text-[#444] leading-relaxed">
          <section>
            <h2 className="text-base font-semibold text-[#111] mb-2">
              What we collect
            </h2>
            <p>
              When you use ScanBiz, we store the information you give us
              directly: your account details, the business card photos you
              scan or upload, and the contact details extracted from them
              (name, title, company, email, phone, LinkedIn, website, notes,
              and follow-up dates you add).
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[#111] mb-2">
              How your data is used
            </h2>
            <p>
              Card images are sent to an AI provider solely to extract the
              contact fields listed above, and are not retained by us
              beyond what&apos;s needed to complete that request. We do not
              read, review, analyze, or use your contacts or scanned cards
              for any purpose other than displaying them back to you inside
              the app.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[#111] mb-2">
              What we don&apos;t do
            </h2>
            <ul className="list-disc pl-5 flex flex-col gap-1.5">
              <li>We don&apos;t sell your data to anyone.</li>
              <li>We don&apos;t use your contacts for advertising or marketing.</li>
              <li>We don&apos;t train AI models on your data.</li>
              <li>We don&apos;t share your contacts with other users.</li>
              <li>
                We don&apos;t manually look through your saved contacts or
                card photos.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[#111] mb-2">
              Third parties
            </h2>
            <p>
              If you connect Google Sheets syncing in Settings, the contact
              rows you choose to sync are sent to the webhook URL you
              provide. That connection is entirely opt-in and controlled by
              you. Nothing syncs unless you set it up.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[#111] mb-2">
              Your control over your data
            </h2>
            <p>
              You can export all your contacts to CSV or delete them at any
              time from within the app. Deleting your account removes your
              stored contacts and card data from our systems.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[#111] mb-2">
              Contact
            </h2>
            <p>
              Questions about this policy? Reach out to the ScanBiz team
              through Yorkseed.
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
