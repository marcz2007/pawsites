"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Tenant } from "@/lib/tenant/types";
import { useState } from "react";

const TEXT_FIELDS: { key: string; label: string }[] = [
  { key: "businessName", label: "Business name" },
  { key: "founderName", label: "Founder name" },
  { key: "tagline", label: "Tagline" },
  { key: "locationLabel", label: "Location" },
  { key: "primary", label: "Brand colour (CSS)" },
  { key: "logoSrc", label: "Logo path (optional)" },
  { key: "contactEmail", label: "Contact email" },
  { key: "contactPhone", label: "Contact phone" },
  { key: "whatsapp", label: "WhatsApp number (digits, no +)" },
  { key: "responseTime", label: "Response time" },
  { key: "enquiryToEmail", label: "Enquiry → email (Plus tier)" },
];

const PRICE_FIELDS: { key: string; label: string }[] = [
  { key: "currency", label: "Currency symbol" },
  { key: "baseStandard", label: "Base nightly rate" },
  { key: "walkPerDay", label: "Walk price (per walk)" },
  { key: "extraPetPerNight", label: "Extra pet / night" },
  { key: "constantSupervisionPerNight", label: "Constant supervision / night" },
  { key: "hourlyOverage", label: "Hourly overage" },
  { key: "earlyStartFlat", label: "Early start flat fee" },
  { key: "saturdayEndFlat", label: "Saturday end-date fee" },
];

const JSON_FIELDS: { key: string; label: string }[] = [
  { key: "discounts", label: "Long-stay discounts" },
  { key: "walkDiscounts", label: "Walk discounts" },
  { key: "extraPetDiscounts", label: "Extra-pet discounts" },
  { key: "hero", label: "Hero block" },
  { key: "about", label: "About block" },
  { key: "reviews", label: "Reviews block" },
  { key: "faqs", label: "FAQs" },
  { key: "serviceAreas", label: "Service areas" },
  { key: "seo", label: "SEO" },
];

export function TenantForm({ tenant }: { tenant: Tenant }) {
  const [vals, setVals] = useState<Record<string, string>>({
    businessName: tenant.businessName,
    founderName: tenant.founderName ?? "",
    tagline: tenant.tagline,
    locationLabel: tenant.locationLabel,
    primary: tenant.branding.primary,
    logoSrc: tenant.branding.logoSrc ?? "",
    contactEmail: tenant.contact.email ?? "",
    contactPhone: tenant.contact.phone ?? "",
    whatsapp: tenant.contact.whatsapp ?? "",
    responseTime: tenant.contact.responseTime ?? "",
    enquiryToEmail: tenant.enquiry.toEmail ?? "",
    currency: tenant.pricing.currency,
    baseStandard: String(tenant.pricing.nightly.baseStandard),
    walkPerDay: String(tenant.pricing.addOns.walkPerDay),
    extraPetPerNight: String(tenant.pricing.addOns.extraPetPerNight),
    constantSupervisionPerNight: String(tenant.pricing.addOns.constantSupervisionPerNight),
    hourlyOverage: String(tenant.pricing.addOns.hourlyOverage),
    earlyStartFlat: String(tenant.pricing.addOns.earlyStartFlat),
    saturdayEndFlat: String(tenant.pricing.addOns.saturdayEndFlat),
  });

  const [tier, setTier] = useState(tenant.tier);
  const [status, setStatus] = useState(tenant.status);

  const [json, setJson] = useState<Record<string, string>>({
    discounts: JSON.stringify(tenant.pricing.nightly.discounts, null, 2),
    walkDiscounts: JSON.stringify(tenant.pricing.addOns.walkDiscounts, null, 2),
    extraPetDiscounts: JSON.stringify(tenant.pricing.addOns.extraPetDiscounts, null, 2),
    hero: JSON.stringify(tenant.hero, null, 2),
    about: JSON.stringify(tenant.about, null, 2),
    reviews: JSON.stringify(tenant.reviews, null, 2),
    faqs: JSON.stringify(tenant.faqs, null, 2),
    serviceAreas: JSON.stringify(tenant.serviceAreas, null, 2),
    seo: JSON.stringify(tenant.seo, null, 2),
  });

  const [status_, setStatus_] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState("");

  const setVal = (k: string, v: string) => setVals((s) => ({ ...s, [k]: v }));
  const setJ = (k: string, v: string) => setJson((s) => ({ ...s, [k]: v }));
  const num = (k: string) => Number(vals[k]) || 0;

  const save = async () => {
    setStatus_("saving");
    setError("");

    // Parse the JSON fields, reporting the first one that's malformed.
    const parsed: Record<string, unknown> = {};
    for (const { key, label } of JSON_FIELDS) {
      try {
        parsed[key] = JSON.parse(json[key]);
      } catch {
        setError(`Invalid JSON in "${label}"`);
        setStatus_("error");
        return;
      }
    }

    const updated: Tenant = {
      ...tenant,
      tier,
      status,
      businessName: vals.businessName,
      founderName: vals.founderName || undefined,
      tagline: vals.tagline,
      locationLabel: vals.locationLabel,
      branding: { primary: vals.primary, logoSrc: vals.logoSrc || undefined },
      contact: {
        email: vals.contactEmail || undefined,
        phone: vals.contactPhone || undefined,
        whatsapp: vals.whatsapp || undefined,
        responseTime: vals.responseTime || undefined,
      },
      enquiry: { ...tenant.enquiry, toEmail: vals.enquiryToEmail || undefined },
      pricing: {
        currency: vals.currency,
        nightly: {
          baseStandard: num("baseStandard"),
          discounts: parsed.discounts as Tenant["pricing"]["nightly"]["discounts"],
        },
        addOns: {
          walkPerDay: num("walkPerDay"),
          walkDiscounts: parsed.walkDiscounts as Tenant["pricing"]["addOns"]["walkDiscounts"],
          extraPetPerNight: num("extraPetPerNight"),
          extraPetDiscounts: parsed.extraPetDiscounts as Tenant["pricing"]["addOns"]["extraPetDiscounts"],
          constantSupervisionPerNight: num("constantSupervisionPerNight"),
          hourlyOverage: num("hourlyOverage"),
          earlyStartFlat: num("earlyStartFlat"),
          saturdayEndFlat: num("saturdayEndFlat"),
        },
        timings: tenant.pricing.timings,
      },
      hero: parsed.hero as Tenant["hero"],
      about: parsed.about as Tenant["about"],
      reviews: parsed.reviews as Tenant["reviews"],
      faqs: parsed.faqs as Tenant["faqs"],
      serviceAreas: parsed.serviceAreas as string[],
      seo: parsed.seo as Tenant["seo"],
    };

    try {
      const res = await fetch(`/api/admin/tenant/${tenant.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Save failed");
      }
      setStatus_("saved");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
      setStatus_("error");
    }
  };

  const input = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm";

  return (
    <div className="space-y-6">
      <Card className="p-6 space-y-4">
        <h2 className="font-semibold">Details</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {TEXT_FIELDS.map(({ key, label }) => (
            <label key={key} className="space-y-1 block">
              <span className="text-sm font-medium">{label}</span>
              <input className={input} value={vals[key]} onChange={(e) => setVal(key, e.target.value)} />
            </label>
          ))}
          <label className="space-y-1 block">
            <span className="text-sm font-medium">Tier</span>
            <select className={input} value={tier} onChange={(e) => setTier(e.target.value as Tenant["tier"])}>
              <option value="free">free</option>
              <option value="plus">plus</option>
            </select>
          </label>
          <label className="space-y-1 block">
            <span className="text-sm font-medium">Status</span>
            <select className={input} value={status} onChange={(e) => setStatus(e.target.value as Tenant["status"])}>
              <option value="active">active</option>
              <option value="draft">draft</option>
            </select>
          </label>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="font-semibold">Pricing</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {PRICE_FIELDS.map(({ key, label }) => (
            <label key={key} className="space-y-1 block">
              <span className="text-sm font-medium">{label}</span>
              <input className={input} value={vals[key]} onChange={(e) => setVal(key, e.target.value)} />
            </label>
          ))}
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="font-semibold">Content & advanced (JSON)</h2>
        <p className="text-sm text-muted-foreground">
          Structured content, edited as JSON for now. A friendlier editor comes later.
        </p>
        <div className="space-y-4">
          {JSON_FIELDS.map(({ key, label }) => (
            <label key={key} className="space-y-1 block">
              <span className="text-sm font-medium">{label}</span>
              <textarea
                className={`${input} font-mono text-xs h-40`}
                value={json[key]}
                onChange={(e) => setJ(key, e.target.value)}
                spellCheck={false}
              />
            </label>
          ))}
        </div>
      </Card>

      <div className="sticky bottom-4 flex items-center gap-3 bg-background/80 backdrop-blur p-3 rounded-xl border">
        <Button onClick={save} disabled={status_ === "saving"}>
          {status_ === "saving" ? "Saving…" : "Save changes"}
        </Button>
        {status_ === "saved" ? <span className="text-sm text-emerald-700">Saved ✓</span> : null}
        {status_ === "error" ? <span className="text-sm text-red-600">{error}</span> : null}
      </div>
    </div>
  );
}
