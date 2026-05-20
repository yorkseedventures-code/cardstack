# CardStack

AI-powered business card scanner PWA. Scan cards with your camera or upload photos — Claude extracts contact info, you review it, and it saves to a local database with optional Google Sheets sync.

## Features

- 📷 Camera capture (direct on mobile) or photo upload
- 🤖 AI extraction via Claude Vision (name, title, company, email, phone, LinkedIn, website)
- 📝 Editable form — review before saving
- 🗂 Local contact database with search
- 📅 Follow-up date tracking
- 📤 CSV export for Google Sheets
- 🔄 Auto-sync to Google Sheets via Make.com webhook
- 📱 PWA — installable on iPhone/Android home screen

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Add your Anthropic API key

Create `.env.local`:

```
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

Get your key at [console.anthropic.com](https://console.anthropic.com).

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deploy to Vercel

```bash
npx vercel
```

Add `ANTHROPIC_API_KEY` as an environment variable in your Vercel project settings.

---

## Google Sheets Auto-Sync (Make.com)

1. Go to [make.com](https://make.com) → Create new scenario
2. Add trigger: **Webhooks → Custom webhook** → copy the URL
3. Add action: **Google Sheets → Add a Row**
4. Map these fields to columns:
   - `first_name`, `last_name`, `title`, `company`
   - `email`, `phone`, `website`, `linkedin`
   - `event`, `follow_up`, `notes`, `added`
5. In the app, go to **Settings** and paste the webhook URL
6. Every saved contact will now auto-appear as a new row in your Sheet

---

## Install as PWA (iPhone)

1. Open the app in Safari
2. Tap the Share button → **Add to Home Screen**
3. Launch from your home screen — it behaves like a native app with camera access

---

## Project Structure

```
cardstack/
├── app/
│   ├── page.tsx              # Main app shell
│   ├── layout.tsx            # Root layout + fonts + PWA meta
│   ├── globals.css           # Global styles
│   └── api/
│       ├── extract/route.ts  # Claude Vision extraction endpoint
│       └── sync/route.ts     # Google Sheets webhook proxy
├── components/
│   ├── Scanner.tsx           # Camera + file upload
│   ├── ContactForm.tsx       # Review/edit extracted info
│   ├── ContactCard.tsx       # Database contact row
│   └── Settings.tsx          # Webhook config
├── lib/
│   ├── types.ts              # TypeScript types
│   └── contacts.ts           # LocalStorage CRUD + CSV export
└── public/
    └── manifest.json         # PWA manifest
```
