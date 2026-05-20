import { Contact } from "./types";

const KEY = "cardstack_contacts";

export function getContacts(): Contact[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveContact(contact: Contact): void {
  const contacts = getContacts();
  contacts.unshift(contact);
  localStorage.setItem(KEY, JSON.stringify(contacts));
}

export function deleteContact(id: string): void {
  const contacts = getContacts().filter((c) => c.id !== id);
  localStorage.setItem(KEY, JSON.stringify(contacts));
}

export function exportCSV(contacts: Contact[]): void {
  const headers = [
    "First name", "Last name", "Title", "Company", "Email",
    "Phone", "Website", "LinkedIn", "Event", "Follow-up", "Notes", "Added",
  ];
  const rows = contacts.map((c) =>
    [c.first_name, c.last_name, c.title, c.company, c.email, c.phone,
     c.website, c.linkedin, c.event, c.follow_up, c.notes, c.added]
      .map((v) => `"${(v || "").replace(/"/g, '""')}"`)
  );
  const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `cardstack-contacts-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function initials(c: Pick<Contact, "first_name" | "last_name">): string {
  return `${(c.first_name || "?")[0]}${(c.last_name || "")[0] || ""}`.toUpperCase();
}
