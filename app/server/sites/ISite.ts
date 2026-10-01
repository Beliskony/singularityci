// ============ sites/ISite.ts ============

export enum SiteStatus {
  DRAFT = "DRAFT",
  PENDING_PAYMENT = "PENDING_PAYMENT",
  ACTIVE = "ACTIVE",
  EXPIRED = "EXPIRED",
  ARCHIVED = "ARCHIVED",
}

export enum SiteImageRole {
  HERO = "HERO",       // photo principale du couple (FirstSection)
  GALLERY = "GALLERY", // carousel de photos (FullSlideSection)
  VENUE = "VENUE",     // photos du lieu de réception (ThirdSection)
}


export interface ISiteImage {
  id: string;
  siteId: string;
  url: string;
  role: SiteImageRole;
  position: number;
  uploadedAt: Date;
}

export interface IProgramItem {
  time: string;   // "08:00"
  label: string;  // "Accueil des invités"
}

export interface ISite {
  id: string;
  clientId: string;
  templateId: string;

  subdomain: string;
  groomName: string;
  brideName: string;
  eventDate: Date;

  images: ISiteImage[];
  themeColors?: Record<string, string>;
  customTexts?: Record<string, string>;

  programItems?: IProgramItem[];

  status: SiteStatus;
  purchasedAt?: Date;
  expiresAt?: Date;
  archivedAt?: Date;

  lastPaymentId?: string;
  rsvpCount: number;

  createdAt: Date;
  updatedAt: Date;
}


