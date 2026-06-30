import type { Metadata } from "next";

/**
 * Pawsites marketing site — the page shown on the apex / home domain when no
 * tenant is resolved from the host (see lib/tenant/server.ts `resolveTenant`).
 *
 * This is intentionally self-contained and SEPARATE from the tenant site so the
 * home domain can be reverted to rendering the default tenant at any time:
 * set HOME_DOMAIN_SHOWS_MARKETING = false and the apex falls back to the
 * happyathomepets tenant exactly as before. Happy at Home Pets remains a normal
 * tenant (its own subdomain / custom domain) regardless of this flag.
 */

/** Master switch. false ⇒ home domain renders the default tenant (legacy behaviour). */
export const HOME_DOMAIN_SHOWS_MARKETING = true;

/** The tenant we showcase as a live example — Marcus's own business. */
export const DEMO_TENANT_SLUG = "happyathomepets";

/** Public URL of the live example, shown in the preview's mock address bar + link. */
export const DEMO_LIVE_URL = "https://www.happyathomepets.co.uk";
export const DEMO_LIVE_HOST = "www.happyathomepets.co.uk";

/**
 * Same-origin source for the embedded live preview. Using `?tenant=` keeps the
 * iframe on the current origin so it works in local dev AND production without
 * depending on the subdomain being reachable from inside the frame.
 */
export const DEMO_PREVIEW_SRC = `/?tenant=${DEMO_TENANT_SLUG}`;

/** Pawsites brand hue, applied to --primary while marketing is shown. */
export const MARKETING_BRAND_PRIMARY = "oklch(0.55 0.15 160)";

export const MARKETING_TAGLINE =
  "The fastest way to launch a professional pet‑sitting website.";

export function marketingMetadata(): Metadata {
  const title = "Pawsites — Beautiful pet‑sitting websites, live in minutes";
  const description =
    "Pawsites gives dog sitters, pet sitters and home boarders a stunning, bookings‑ready website in minutes. Instant‑quote calculator, availability calendar, reviews and enquiries built in — no code.";
  return {
    title,
    description,
    keywords: [
      "pet sitting website",
      "dog sitting website builder",
      "pet sitter website",
      "home boarding website",
      "dog walker website",
      "Pawsites",
    ],
    openGraph: {
      title,
      description,
      type: "website",
      locale: "en_GB",
      siteName: "Pawsites",
    },
    robots: { index: true, follow: true },
  };
}

/* ----------------------------------------------------------------- content */

export const FEATURES: { icon: string; title: string; body: string }[] = [
  {
    icon: "Sparkles",
    title: "A template that sells for you",
    body: "A polished, mobile‑first design built specifically for pet care — calm, trustworthy and made to convert visitors into bookings.",
  },
  {
    icon: "Calculator",
    title: "Instant quote calculator",
    body: "Visitors pick dates, pets and add‑ons and see a price instantly. Your rates and discounts, your rules — no back‑and‑forth.",
  },
  {
    icon: "CalendarDays",
    title: "Availability calendar",
    body: "Show green / amber / red availability so clients only enquire for dates you can actually do.",
  },
  {
    icon: "Star",
    title: "Reviews that build trust",
    body: "Pull in your best reviews from Rover, Google or TrustedHousesitters and show them off front and centre.",
  },
  {
    icon: "Globe",
    title: "Your own web address",
    body: "Go live on yourname.pawsites.co.uk in seconds — or connect your own custom domain on the Plus plan.",
  },
  {
    icon: "Wand2",
    title: "Edit everything, no code",
    body: "A friendly editor for your story, prices and photos. No JSON, no HTML, no developer — just fill in the blanks.",
  },
  {
    icon: "MessageCircle",
    title: "Enquiries to email + WhatsApp",
    body: "Every enquiry lands in your inbox and can hand off to WhatsApp, so you never miss a potential client.",
  },
  {
    icon: "Gauge",
    title: "Fast & found on Google",
    body: "SEO, structured data and lightning‑fast pages are built in, so people searching for sitters near you find you.",
  },
];

/** The differentiator: pricing the sitter fully controls (vs marketplaces). */
export const PRICING_CONTROL: { icon: string; title: string; body: string }[] = [
  {
    icon: "Heart",
    title: "Price by level of care",
    body: "Standard, constant supervision or special‑needs care — each at your own rate. Charge fairly for the cover a pet actually needs.",
  },
  {
    icon: "Footprints",
    title: "Charge for walks, your way",
    body: "Set your per‑walk price and add bulk discounts for longer stays. The calculator adds it all up for the client automatically.",
  },
  {
    icon: "PawPrint",
    title: "Extra pets & long stays",
    body: "Multi‑pet rates and length‑of‑stay discounts that you decide — reward your best bookings without doing maths by hand.",
  },
  {
    icon: "Calculator",
    title: "Instant, transparent quotes",
    body: "Clients pick their options and see a clear, fair price on the spot — so they enquire already ready to book.",
  },
];

export const STEPS: { title: string; body: string }[] = [
  {
    title: "Claim your address",
    body: "Pick your subdomain — yourname.pawsites.co.uk — and your site exists instantly.",
  },
  {
    title: "Add your story, prices & photos",
    body: "Use the friendly editor to drop in your bio, rates, reviews and pictures. No code, ever.",
  },
  {
    title: "Share your link & take bookings",
    body: "Send your link anywhere. The quote calculator and calendar turn visitors into enquiries for you.",
  },
];

export type Tier = {
  name: string;
  price: string;
  cadence?: string;
  blurb: string;
  features: string[];
  featured?: boolean;
  ctaLabel: string;
};

export const TIERS: Tier[] = [
  {
    name: "Basic",
    price: "£4.99",
    cadence: "/month",
    blurb: "Everything you need to get online and start taking enquiries.",
    features: [
      "The full pet‑care template",
      "Instant quote calculator",
      "Availability calendar",
      "Reviews & FAQs",
      "yourname.pawsites.co.uk address",
      "WhatsApp & phone enquiries",
    ],
    ctaLabel: "Get started",
  },
  {
    name: "Plus",
    price: "£5.99",
    cadence: "/month",
    blurb: "For sitters who want enquiries straight to their own inbox.",
    features: [
      "Everything in Basic",
      "Enquiries to your own email inbox",
      "Connect your own custom domain",
      "Lead capture to a spreadsheet",
      "Priority support",
    ],
    featured: true,
    ctaLabel: "Get started",
  },
];
