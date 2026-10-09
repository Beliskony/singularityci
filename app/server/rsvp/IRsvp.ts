// ============ rsvp/IRsvp.ts ============

export enum RsvpStatus {
  ATTENDING = "ATTENDING",
  NOT_ATTENDING = "NOT_ATTENDING",
  PENDING = "PENDING",
}

export interface IRsvp {
  id: string;
  siteId: string;
  guestName: string;
  guestPhone?: string;
  guestEmail?: string;
  numberOfGuests: number;
  status: RsvpStatus;
  message?: string;
  respondedAt: Date;
  createdAt: Date;
}