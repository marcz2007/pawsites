import type { Tenant, Tier } from "@/lib/tenant/types";

/** Subdomains that can't be used as tenant slugs (platform/reserved hosts). */
export const RESERVED_SLUGS = new Set([
  "www", "admin", "api", "app", "mail", "pawsites", "accept", "login",
  "logout", "auth", "static", "assets", "dev", "status", "blog",
]);

export const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{0,30}[a-z0-9])?$/;

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);
}

/**
 * A sensible blank-but-valid starter tenant for a brand-new business. The
 * sitter then edits the content in the admin. Created as "draft".
 */
export function newTenant(input: {
  slug: string;
  businessName: string;
  locationLabel?: string;
  tier?: Tier;
}): Tenant {
  const { slug, businessName, locationLabel = "", tier = "free" } = input;
  return {
    slug,
    status: "draft",
    tier,
    businessName,
    tagline: "Trusted, loving pet care",
    locationLabel,
    branding: { primary: "oklch(0.55 0.13 152)" },
    contact: {},
    enquiry: {},
    hero: {
      ctaPrimaryLabel: "Get a Quote",
      ctaSecondaryLabel: "Check Availability",
      trustBadges: [
        { icon: "Heart", label: "Caring & reliable" },
        { icon: "ShieldCheck", label: "Trustworthy" },
      ],
      blurb: "Loving care for your pets while you're away.",
    },
    about: {
      heading: `About ${businessName}`,
      paragraphs: ["Tell your customers about your pet-care service here."],
      features: [
        { icon: "Heart", title: "Loving care", description: "Describe what makes your care special." },
        { icon: "Home", title: "Familiar surroundings", description: "Explain your approach to looking after pets." },
        { icon: "ShieldCheck", title: "Trustworthy", description: "Reassure customers they're in safe hands." },
      ],
    },
    reviews: { heading: "What pet parents say", subheading: "Add your reviews here.", items: [] },
    faqs: [
      { question: "Where are you based?", answer: "Add your answer here." },
      { question: "How do I book?", answer: "Add your answer here." },
    ],
    serviceAreas: [],
    pricing: {
      currency: "£",
      nightly: { baseStandard: 40, discounts: [] },
      addOns: {
        walkPerDay: 0,
        walkDiscounts: [],
        extraPetPerNight: 0,
        extraPetDiscounts: [],
        constantSupervisionPerNight: 0,
        hourlyOverage: 0,
        earlyStartFlat: 0,
        saturdayEndFlat: 0,
      },
      timings: { middayHour: 12, earlyStartCutoffHour: 10 },
    },
    seo: {
      title: businessName,
      description: `${businessName} — trusted pet care.`,
      keywords: [],
    },
  };
}
