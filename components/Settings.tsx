"use client";

import { useState } from "react";

interface SettingsProps {
  webhookUrl: string;
  onSave: (url: string) => void;
}

export default function Settings({ webhookUrl, onSave }: SettingsProps) {
  const [url, setUrl] = useState(webhookUrl);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave(url);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="slide-up">
      <div className="bg-white rounded-2xl border border-[#ece9e4] p-4 mb-4">
        <h3 className="text-sm font-medium text-[#111] mb-1">Google Sheets sync</h3>
        <p className="text-xs text-[#aaa] mb-4 leading-relaxed">
          Set up a Make.com webhook to auto-add rows to your Sheet every time you save a card.
        </p>
        <div className="bg-[#f8f7f5] rounded-xl p-3 mb-4 text-xs text-[#888] leading-relaxed space-y-1.5 border border-[#ece9e4]">
          <p className="text-[#555] font-medium">Setup steps:</p>
          <p>1. Go to <span className="text-blue-500">make.com</span> → New scenario</p>
          <p>2. Add <span className="text-[#555]">Webhooks → Custom webhook</span> trigger</p>
          <p>3. Add <span className="text-[#555]">Google Sheets → Add a Row</span> action</p>
          <p>4. Map fields: first_name, last_name, title, company, email, phone, linkedin, event, follow_up, notes</p>
          <p>5. Copy the webhook URL and paste below</p>
        </div>
        <label className="block text-xs text-[#aaa] mb-1.5">Make.com webhook URL</label>
        <input className="field-input mb-3" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://hook.eu1.make.com/..." />
        <button onClick={handleSave} className="w-full py-3 rounded-xl bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-all">
          {saved ? "✓ Saved" : "Save webhook URL"}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#ece9e4] p-4">
        <h3 className="text-sm font-medium text-[#111] mb-1">About CardStack</h3>
        <p className="text-xs text-[#aaa] leading-relaxed">
          AI-powered business card scanner. Photos are sent to OpenAI for extraction — nothing is stored server-side. All contacts are saved in your browser.
        </p>
      </div>
    </div>
  );
}
