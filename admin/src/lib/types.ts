export type LeadStatus = "new" | "contacted" | "qualified" | "won" | "lost";

export const LEAD_STATUSES: LeadStatus[] = ["new", "contacted", "qualified", "won", "lost"];

export type LeadNote = {
  text: string;
  authorUid: string;
  authorEmail: string | null;
  createdAt: string;
};

export type Lead = {
  id: string;
  name: string;
  email: string;
  companySize: string;
  message: string;
  status: LeadStatus;
  createdAt: string | null;
  notes: LeadNote[];
};

export type LeadListResponse = {
  items: Lead[];
  nextCursor: string | null;
};

export type NewsletterStatus = "active" | "unsubscribed";

export const NEWSLETTER_STATUSES: NewsletterStatus[] = ["active", "unsubscribed"];

export type NewsletterSubscriber = {
  id: string;
  email: string;
  status: NewsletterStatus;
  subscribedAt: string | null;
};

export type NewsletterListResponse = {
  items: NewsletterSubscriber[];
  nextCursor: string | null;
};
