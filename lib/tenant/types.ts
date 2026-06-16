/**
 * The Tenant model is the heart of the platform. Every pet-care business that
 * signs up is one Tenant. All site content, pricing, contact details, and
 * feature access are derived from this object.
 *
 * For now tenants are seeded in code (lib/tenant/seed.ts). The shape here maps
 * 1:1 to the planned Postgres schema (supabase/migrations/0001_init.sql), so
 * swapping the data source later is a store-layer change only — nothing that
 * consumes a Tenant needs to change.
 */

export type Tier = "free" | "plus";

export type TenantStatus = "active" | "draft";

/* ------------------------------------------------------------------ pricing */

export type SupervisionLevel = "standard" | "constant" | "special";

export interface DiscountTier {
  minNights: number;
  percentOff: number;
}

export interface WalkDiscount {
  minNights: number;
  percentOff: number;
  /** Only this many walks/day get the discount; extra walks are full price. */
  maxWalksDiscounted?: number;
}

/**
 * Per-tenant pricing. This generalises what used to be hardcoded in
 * lib/pricing.ts so each sitter can set their own rates and discounts.
 */
export interface PricingConfig {
  /** Display currency symbol, e.g. "£". */
  currency: string;
  nightly: {
    baseStandard: number;
    discounts: DiscountTier[];
  };
  addOns: {
    walkPerDay: number;
    walkDiscounts: WalkDiscount[];
    extraPetPerNight: number;
    extraPetDiscounts: DiscountTier[];
    constantSupervisionPerNight: number;
    hourlyOverage: number;
    earlyStartFlat: number;
    /** Flat surcharge when the stay ends on a Saturday. 0 disables it. */
    saturdayEndFlat: number;
  };
  timings: {
    middayHour: number;
    earlyStartCutoffHour: number;
  };
}

/* ----------------------------------------------------------------- content */

/** Lucide icon name (resolved to a component via lib/icons.ts). */
export type IconName =
  | "Home"
  | "ShieldCheck"
  | "Shield"
  | "Sparkles"
  | "Heart"
  | "Clock"
  | "PawPrint"
  | "Stethoscope";

export interface Feature {
  icon: IconName;
  title: string;
  description: string;
}

/** Where a tenant's reviews come from. */
export type ReviewSource = "rover" | "ths" | "google";

export interface Review {
  name: string;
  text: string;
  /** Link to this specific review on the source platform. */
  link?: string;
  /** Optional — derived from the name when absent. */
  initials?: string;
  date?: string;
  rating?: number;
}

export interface Faq {
  question: string;
  answer: string;
}

export interface TrustBadge {
  icon: IconName;
  label: string;
}

/* ------------------------------------------------------------------ tenant */

export interface Tenant {
  /** Subdomain slug, e.g. "happyathomepets" -> happyathomepets.pawsites.co.uk */
  slug: string;
  status: TenantStatus;
  tier: Tier;

  /** Identity */
  businessName: string;
  founderName?: string;
  /** Short hero strapline. */
  tagline: string;
  locationLabel: string;

  /** Branding — a primary brand hue (oklch/hsl/hex all fine via CSS var). */
  branding: {
    /** CSS colour applied to the --primary token for this tenant. */
    primary: string;
    logoSrc?: string;
  };

  /** Public contact details shown on the site. */
  contact: {
    email?: string;
    phone?: string;
    /** WhatsApp number, digits only, no "+". Enables the WhatsApp button. */
    whatsapp?: string;
    responseTime?: string;
  };

  /**
   * Where enquiries are delivered. Email capture is a paid-tier feature; if
   * `email` is unset (or tier is "free"), the enquiry form shows WhatsApp only.
   */
  enquiry: {
    toEmail?: string;
    sheetWebhookUrl?: string;
  };

  hero: {
    priceFromLabel?: string;
    ctaPrimaryLabel: string;
    ctaSecondaryLabel: string;
    trustBadges: TrustBadge[];
    /** Founder blurb shown under the CTAs (plain text). */
    blurb?: string;
  };

  about: {
    heading: string;
    paragraphs: string[];
    features: Feature[];
    imageSrc?: string;
  };

  reviews: {
    heading: string;
    subheading: string;
    /** Which platform the reviews are from (drives the verified-reviews label). */
    source?: ReviewSource;
    items: Review[];
  };

  faqs: Faq[];

  serviceAreas: string[];

  pricing: PricingConfig;

  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
}

/** Convenience: whether email enquiries are available for this tenant. */
export function emailEnabled(tenant: Tenant): boolean {
  return tenant.tier === "plus" && Boolean(tenant.enquiry.toEmail || tenant.contact.email);
}
