/** A CMO Speaker profile (stored in the "leaders" collection). */
export interface Speaker {
  id: string;
  name: string;
  designation: string;
  company: string;
  photoUrl: string;
  linkedinUrl?: string;
  bio?: string;
  order: number;
  published: boolean;
  createdAt?: string;
  updatedAt?: string;
}
