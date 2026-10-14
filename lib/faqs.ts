import { FREE_SCANS_PER_MONTH, PASS_PRICE, MONTHLY_PRICE, PRICING, MINI_PRICE, MINI_SCANS, SUPPORT_EMAIL } from "./pricing";

export const FAQS = [
  {
    q: "How does KoiCard scan a business card?",
    a: "Take a photo with your camera or upload one. If the card has a contact QR code, KoiCard reads it instantly. Otherwise AI reads the card and fills in name, title, company, email, phone, website, LinkedIn, Instagram, X, and address automatically. You can edit anything before saving.",
  },
  {
    q: "Does KoiCard read QR codes?",
    a: "Yes. If a card, badge or phone screen shows a contact QR code (a vCard), point the camera at it or upload a photo and KoiCard fills in the whole contact instantly, for free, without using a scan. If the QR just links to a website or LinkedIn profile, KoiCard adds that link to the contact and reads the rest of the card as usual.",
  },
  {
    q: "Which QR codes work, and which don't?",
    a: "Work: contact QR codes in vCard or MECARD format (these fill in the whole contact, free, no scan used). Also work, but only add one field: LinkedIn, Instagram and X profile links, website links, email (mailto:) and phone (tel:) codes. Don't work: codes that open a digital business card page (such as Linq, HiHello or Popl), event or badge-app codes that point to a web page, Wi-Fi, payment, app-store and calendar codes. KoiCard doesn't open links, so it can only save the web address, not the details behind it. For those, photograph the printed card instead and AI will read the text.",
  },
  {
    q: "What fields does KoiCard extract?",
    a: "Name, job title, company, email, phone (including a second number), website, LinkedIn, Instagram, X (Twitter), and physical address. After scanning, you can also add where you met, a follow-up date, notes, and a color tag.",
  },
  {
    q: "What are the color tags for?",
    a: "Color tags are yours to define. Use them however makes sense for your workflow - by relationship type (investor, client, press), by event, by priority, or by follow-up status. Name each color in Settings (for example blue = Investor), and your names are saved to your account, shown on your contacts, and included in your CSV export.",
  },
  {
    q: "Does KoiCard find LinkedIn?",
    a: "KoiCard reads the LinkedIn link or handle when it is printed on the card. If it isn't printed, you can paste the profile link in yourself before saving.",
  },
  {
    q: "Can I export my contacts?",
    a: "Yes. Export your full contact list to CSV anytime from the Contacts tab. Every column, including color tag, your color label and follow-up date, is included.",
  },
  {
    q: "Is my data private?",
    a: "Your contacts are tied to your account only. KoiCard doesn't sell your data, use it for advertising, or train AI models on it. Contact QR codes are read on your device and never sent to an AI provider.",
  },
  {
    q: "How much does KoiCard cost?",
    a: `Free for ${FREE_SCANS_PER_MONTH} scans a month. An Event Pass (${PASS_PRICE}, valid ${PRICING.pass.durationDays} days, up to ${PRICING.pass.scanCap} scans) is perfect for conferences. A Monthly plan (${MONTHLY_PRICE}/month, up to ${PRICING.monthly.scanCap} scans a month) covers year-round use. Run out of scans? A Mini Pass adds ${MINI_SCANS} more for ${MINI_PRICE}.`,
  },
  {
    q: "What happens when I run out of scans?",
    a: `You'll see a pop-up with options to keep going. (Contact QR codes never use a scan, so those still work.) Free users get ${FREE_SCANS_PER_MONTH} scans a month, and an Event Pass or Monthly plan has its own scan limit. Anyone can add a Mini Pass (${MINI_PRICE} for ${MINI_SCANS} more scans, valid ${PRICING.mini.validDays} days). Your saved contacts are never locked, only new scans. Need more than that? Email ${SUPPORT_EMAIL}.`,
  },
  {
    q: "How do the Event Pass, Monthly plan and Mini Pass work?",
    a: `Event Pass: one payment of ${PASS_PRICE}, up to ${PRICING.pass.scanCap} scans over ${PRICING.pass.durationDays} days, does not renew. Monthly: ${MONTHLY_PRICE}/month, up to ${PRICING.monthly.scanCap} scans a month, renews until cancelled. Mini Pass: one payment of ${MINI_PRICE} adds ${MINI_SCANS} scans on top of what you already have, valid ${PRICING.mini.validDays} days, does not renew. Passes can be bought again whenever you need.`,
  },
  {
    q: "Can I gift KoiCard to someone?",
    a: `Yes. In Settings, tap Gift an Event Pass and pay ${PASS_PRICE}. You'll get a private link to send to a friend, colleague or client. When they open it and sign up or log in, the Event Pass (${PRICING.pass.durationDays} days, up to ${PRICING.pass.scanCap} scans) is added to their account. Each link works once.`,
  },
  {
    q: "I have an access code from an event. How do I use it?",
    a: "Sign up or log in, open Settings, enter your code under Access code and tap Apply. (If you were sent a link, opening it does the same.) You get a set number of scans for a fixed period, for example 300 scans for two weeks, and Settings shows when it ends. If you start before the access period begins, you stay on the free plan until it does. When it ends you go back to the free plan, and you can buy a plan or Mini Pass anytime.",
  },
  {
    q: "Can I cancel my Monthly plan myself?",
    a: `Yes, anytime, no email needed. Go to Settings, tap Manage or cancel Monthly plan, and cancel in a couple of taps. You can also update your card and see invoices there. Cancelling stops future renewals and you keep access until the end of the period you've paid for. Event Passes and Mini Passes are one-time and never renew. Questions about a payment? Email ${SUPPORT_EMAIL}.`,
  },
  {
    q: "Who is KoiCard for?",
    a: "Anyone who collects business cards: conference attendees, founders, investors, sales teams, recruiters at job fairs, and students at career events.",
  },
];

export const IN_APP_TIPS = [
  {
    icon: "📷",
    title: "Scanning",
    body: "Tap 'Scan' and use your camera or upload a photo. Hold the card flat and make sure text is in frame. If there is a contact QR code, it fills in instantly. Otherwise AI fills everything in. Edit before saving.",
  },
  {
    icon: "🎨",
    title: "Color coding",
    body: "Assign a color to each contact when saving or from the contact detail view. Use colors however works for you - by type, event, priority, or status. Name each color in Settings (your names are saved to your account and appear in your CSV export).",
  },
  {
    icon: "🔳",
    title: "QR codes",
    body: "Point the camera at a contact QR code (on a card, a badge or someone's phone) and KoiCard captures it by itself. It fills in the whole contact in an instant and doesn't use a scan. You can also upload a photo or screenshot of a QR code.",
  },
  {
    icon: "🎟️",
    title: "Scan limits and passes",
    body: `Free accounts get ${FREE_SCANS_PER_MONTH} scans a month. When you run out, pick a Monthly plan, an Event Pass for a conference, or a Mini Pass (${MINI_SCANS} more scans for ${MINI_PRICE}). Saved contacts are never locked.`,
  },
  {
    icon: "🔗",
    title: "LinkedIn",
    body: "KoiCard reads LinkedIn when it's printed on the card. If it isn't, tap Edit on the contact and paste the profile link.",
  },
  {
    icon: "📅",
    title: "Follow-ups",
    body: "Set a follow-up date on any contact. Overdue follow-ups are flagged in red and float to the top when you sort by Urgency.",
  },
  {
    icon: "🔍",
    title: "Finding contacts",
    body: "Search by name, company, or event. Sort by date added, color, urgency, A-Z, or company name. With 100+ contacts, use pagination to browse.",
  },
  {
    icon: "✏️",
    title: "Editing",
    body: "Tap any contact to expand it, then tap Edit to update any field including Instagram, X handle, and address. Changes save instantly.",
  },
  {
    icon: "💾",
    title: "Exporting",
    body: "Tap Export CSV in the Contacts tab to download your full database as a spreadsheet, including all fields, color tags and your color label names.",
  },
];
