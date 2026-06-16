import type { Tenant } from "@/lib/tenant/types";

/**
 * Maps between the flat database row (snake_case columns + JSONB blocks) and
 * the Tenant object the app consumes. Keeping this in one place means the DB
 * shape and the app shape can evolve independently.
 */

/** A database row from the `tenants` table. */
export interface TenantRow {
  slug: string;
  status: string;
  tier: string;
  business_name: string;
  founder_name: string | null;
  tagline: string;
  location_label: string;
  primary_color: string;
  logo_src: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  whatsapp: string | null;
  response_time: string | null;
  enquiry_to_email: string | null;
  enquiry_sheet_webhook: string | null;
  hero: Tenant["hero"];
  about: Tenant["about"];
  reviews: Tenant["reviews"];
  faqs: Tenant["faqs"];
  service_areas: string[];
  seo: Tenant["seo"];
  pricing: Tenant["pricing"];
}

export function rowToTenant(row: TenantRow): Tenant {
  return {
    slug: row.slug,
    status: (row.status as Tenant["status"]) ?? "active",
    tier: (row.tier as Tenant["tier"]) ?? "free",
    businessName: row.business_name,
    founderName: row.founder_name ?? undefined,
    tagline: row.tagline,
    locationLabel: row.location_label,
    branding: { primary: row.primary_color, logoSrc: row.logo_src ?? undefined },
    contact: {
      email: row.contact_email ?? undefined,
      phone: row.contact_phone ?? undefined,
      whatsapp: row.whatsapp ?? undefined,
      responseTime: row.response_time ?? undefined,
    },
    enquiry: {
      toEmail: row.enquiry_to_email ?? undefined,
      sheetWebhookUrl: row.enquiry_sheet_webhook ?? undefined,
    },
    hero: row.hero,
    about: row.about,
    reviews: row.reviews,
    faqs: row.faqs,
    serviceAreas: row.service_areas ?? [],
    pricing: row.pricing,
    seo: row.seo,
  };
}

export function tenantToRow(t: Tenant): TenantRow {
  return {
    slug: t.slug,
    status: t.status,
    tier: t.tier,
    business_name: t.businessName,
    founder_name: t.founderName ?? null,
    tagline: t.tagline,
    location_label: t.locationLabel,
    primary_color: t.branding.primary,
    logo_src: t.branding.logoSrc ?? null,
    contact_email: t.contact.email ?? null,
    contact_phone: t.contact.phone ?? null,
    whatsapp: t.contact.whatsapp ?? null,
    response_time: t.contact.responseTime ?? null,
    enquiry_to_email: t.enquiry.toEmail ?? null,
    enquiry_sheet_webhook: t.enquiry.sheetWebhookUrl ?? null,
    hero: t.hero,
    about: t.about,
    reviews: t.reviews,
    faqs: t.faqs,
    service_areas: t.serviceAreas,
    seo: t.seo,
    pricing: t.pricing,
  };
}
