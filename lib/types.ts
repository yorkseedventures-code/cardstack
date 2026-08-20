export interface Contact {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  phone2: string;
  website: string;
  linkedin: string;
  instagram: string;
  x_handle: string;
  address: string;
  event: string;
  follow_up: string;
  notes: string;
  added: string;
  color: string;
  urgent?: boolean;
  card_image?: string;
  card_image_path?: string;
  image_migrated_at?: string;
  image_error?: boolean;
  created_at?: string;
}

export type ExtractedCard = Pick<Contact,
  "first_name" | "last_name" | "title" | "company" |
  "email" | "phone" | "phone2" | "website" | "linkedin" |
  "instagram" | "x_handle" | "address"
>;
