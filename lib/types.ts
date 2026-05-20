export interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  website: string;
  linkedin: string;
  event: string;
  follow_up: string;
  notes: string;
  added: string;
  card_image?: string;
}

export type ExtractedCard = Omit<Contact, "id" | "event" | "follow_up" | "notes" | "added" | "card_image">;
