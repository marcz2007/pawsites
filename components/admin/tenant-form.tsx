"use client";

import { DiscountEditor } from "@/components/admin/discount-editor";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { IconName, Tenant } from "@/lib/tenant/types";
import { Plus, X } from "lucide-react";
import { useState } from "react";

const ICONS: IconName[] = ["Home", "ShieldCheck", "Shield", "Sparkles", "Heart", "Clock", "PawPrint", "Stethoscope"];
const inputCls = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm";

function Field({ label, value, onChange, type = "text", placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <label className="space-y-1 block">
      <span className="text-sm font-medium">{label}</span>
      <input type={type} className={inputCls} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </label>
  );
}

function NumField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="space-y-1 block">
      <span className="text-sm font-medium">{label}</span>
      <input type="number" className={inputCls} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  );
}

function Area({ label, value, onChange, rows = 3 }: { label?: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <label className="space-y-1 block">
      {label ? <span className="text-sm font-medium">{label}</span> : null}
      <textarea className={inputCls} rows={rows} value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function IconSelect({ value, onChange }: { value: IconName; onChange: (v: IconName) => void }) {
  return (
    <select className={inputCls} value={value} onChange={(e) => onChange(e.target.value as IconName)}>
      {ICONS.map((i) => (
        <option key={i} value={i}>{i}</option>
      ))}
    </select>
  );
}

function AddButton({ label, onClick, disabled }: { label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className="inline-flex items-center gap-1.5 text-sm font-medium text-primary disabled:opacity-40">
      <Plus className="w-4 h-4" /> {label}
    </button>
  );
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="mt-1 rounded-lg border border-border p-2 text-muted-foreground hover:text-red-600 hover:border-red-300 shrink-0" aria-label="Remove">
      <X className="w-4 h-4" />
    </button>
  );
}

export function TenantForm({ tenant, isOperator }: { tenant: Tenant; isOperator: boolean }) {
  const [t, setT] = useState<Tenant>(tenant);
  const [keywords, setKeywords] = useState(tenant.seo.keywords.join(", "));
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState("");

  /** Immutable update via a mutable-style draft. */
  const update = (fn: (d: Tenant) => void) =>
    setT((prev) => {
      const next = structuredClone(prev);
      fn(next);
      return next;
    });

  const save = async () => {
    setState("saving");
    setError("");
    const payload = structuredClone(t);
    payload.seo.keywords = keywords.split(",").map((s) => s.trim()).filter(Boolean);
    try {
      const res = await fetch(`/api/admin/tenant/${t.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Save failed");
      }
      setState("saved");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
      setState("error");
    }
  };

  return (
    <div className="space-y-6">
      {/* ---- Details ---- */}
      <Card className="p-6 space-y-4">
        <h2 className="font-semibold">Details</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Business name" value={t.businessName} onChange={(v) => update((d) => { d.businessName = v; })} />
          <Field label="Founder name" value={t.founderName ?? ""} onChange={(v) => update((d) => { d.founderName = v; })} />
          <Field label="Tagline" value={t.tagline} onChange={(v) => update((d) => { d.tagline = v; })} />
          <Field label="Location" value={t.locationLabel} onChange={(v) => update((d) => { d.locationLabel = v; })} />
          <label className="space-y-1 block">
            <span className="text-sm font-medium">Brand colour</span>
            <div className="flex items-center gap-3">
              <input type="color" className="h-10 w-14 rounded-lg border border-border bg-background" value={hexFrom(t.branding.primary)} onChange={(e) => update((d) => { d.branding.primary = e.target.value; })} />
              <input className={inputCls} value={t.branding.primary} onChange={(e) => update((d) => { d.branding.primary = e.target.value; })} />
            </div>
          </label>
          <label className="space-y-1 block">
            <span className="text-sm font-medium">Plan</span>
            {isOperator ? (
              <select className={inputCls} value={t.tier} onChange={(e) => update((d) => { d.tier = e.target.value as Tenant["tier"]; })}>
                <option value="free">free</option>
                <option value="plus">plus</option>
              </select>
            ) : (
              <p className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm">
                {t.tier === "plus" ? "Plus" : "Free"} <span className="text-muted-foreground">· contact us to change your plan</span>
              </p>
            )}
          </label>
          <Field label="Logo image path (upload coming soon)" value={t.branding.logoSrc ?? ""} onChange={(v) => update((d) => { d.branding.logoSrc = v || undefined; })} />
          <label className="space-y-1 block">
            <span className="text-sm font-medium">Status</span>
            <select className={inputCls} value={t.status} onChange={(e) => update((d) => { d.status = e.target.value as Tenant["status"]; })}>
              <option value="active">active</option>
              <option value="draft">draft</option>
            </select>
          </label>
        </div>
      </Card>

      {/* ---- Contact ---- */}
      <Card className="p-6 space-y-4">
        <h2 className="font-semibold">Contact</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Email" value={t.contact.email ?? ""} onChange={(v) => update((d) => { d.contact.email = v || undefined; })} />
          <Field label="Phone" value={t.contact.phone ?? ""} onChange={(v) => update((d) => { d.contact.phone = v || undefined; })} />
          <Field label="WhatsApp number (digits, no +)" value={t.contact.whatsapp ?? ""} onChange={(v) => update((d) => { d.contact.whatsapp = v || undefined; })} />
          <Field label="Response time" value={t.contact.responseTime ?? ""} onChange={(v) => update((d) => { d.contact.responseTime = v || undefined; })} />
          <Field label="Send enquiries to (Plus)" value={t.enquiry.toEmail ?? ""} onChange={(v) => update((d) => { d.enquiry.toEmail = v || undefined; })} />
        </div>
      </Card>

      {/* ---- Pricing ---- */}
      <Card className="p-6 space-y-5">
        <h2 className="font-semibold">Pricing (£)</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <NumField label="Base nightly rate" value={t.pricing.nightly.baseStandard} onChange={(v) => update((d) => { d.pricing.nightly.baseStandard = v; })} />
          <NumField label="Walk price (per walk)" value={t.pricing.addOns.walkPerDay} onChange={(v) => update((d) => { d.pricing.addOns.walkPerDay = v; })} />
          <NumField label="Extra pet / night" value={t.pricing.addOns.extraPetPerNight} onChange={(v) => update((d) => { d.pricing.addOns.extraPetPerNight = v; })} />
          <NumField label="Constant supervision / night" value={t.pricing.addOns.constantSupervisionPerNight} onChange={(v) => update((d) => { d.pricing.addOns.constantSupervisionPerNight = v; })} />
          <NumField label="Hourly overage" value={t.pricing.addOns.hourlyOverage} onChange={(v) => update((d) => { d.pricing.addOns.hourlyOverage = v; })} />
          <NumField label="Early start flat fee" value={t.pricing.addOns.earlyStartFlat} onChange={(v) => update((d) => { d.pricing.addOns.earlyStartFlat = v; })} />
          <NumField label="Saturday end-date fee" value={t.pricing.addOns.saturdayEndFlat} onChange={(v) => update((d) => { d.pricing.addOns.saturdayEndFlat = v; })} />
        </div>
        <div className="grid md:grid-cols-3 gap-6 pt-2">
          <DiscountEditor title="Long-stay discounts" hint="% off the nightly rate for longer stays" rows={t.pricing.nightly.discounts} onChange={(rows) => update((d) => { d.pricing.nightly.discounts = rows; })} />
          <DiscountEditor title="Walk discounts" hint="% off walks for longer stays" withMaxWalks rows={t.pricing.addOns.walkDiscounts} onChange={(rows) => update((d) => { d.pricing.addOns.walkDiscounts = rows; })} />
          <DiscountEditor title="Extra-pet discounts" hint="% off extra pets for longer stays" rows={t.pricing.addOns.extraPetDiscounts} onChange={(rows) => update((d) => { d.pricing.addOns.extraPetDiscounts = rows; })} />
        </div>
      </Card>

      {/* ---- Content ---- */}
      <Card className="p-6 space-y-6">
        <h2 className="font-semibold">Content</h2>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-primary">Hero</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Price-from label" value={t.hero.priceFromLabel ?? ""} onChange={(v) => update((d) => { d.hero.priceFromLabel = v || undefined; })} />
            <Field label="Primary button" value={t.hero.ctaPrimaryLabel} onChange={(v) => update((d) => { d.hero.ctaPrimaryLabel = v; })} />
            <Field label="Secondary button" value={t.hero.ctaSecondaryLabel} onChange={(v) => update((d) => { d.hero.ctaSecondaryLabel = v; })} />
          </div>
          <Area label="Intro blurb" value={t.hero.blurb ?? ""} onChange={(v) => update((d) => { d.hero.blurb = v || undefined; })} />
          <p className="text-sm font-medium">Trust badges</p>
          {t.hero.trustBadges.map((b, i) => (
            <div key={i} className="flex items-end gap-2">
              <div className="w-40"><IconSelect value={b.icon} onChange={(v) => update((d) => { d.hero.trustBadges[i].icon = v; })} /></div>
              <input className={inputCls} value={b.label} onChange={(e) => update((d) => { d.hero.trustBadges[i].label = e.target.value; })} />
              <RemoveButton onClick={() => update((d) => { d.hero.trustBadges.splice(i, 1); })} />
            </div>
          ))}
          <AddButton label="Add badge" onClick={() => update((d) => { d.hero.trustBadges.push({ icon: "PawPrint", label: "" }); })} />
        </div>

        <div className="space-y-3 border-t pt-4">
          <h3 className="text-sm font-semibold text-primary">About</h3>
          <Field label="Heading" value={t.about.heading} onChange={(v) => update((d) => { d.about.heading = v; })} />
          <Field label="Photo path (upload coming soon)" value={t.about.imageSrc ?? ""} onChange={(v) => update((d) => { d.about.imageSrc = v || undefined; })} />
          <p className="text-sm font-medium">Paragraphs</p>
          {t.about.paragraphs.map((p, i) => (
            <div key={i} className="flex items-start gap-2">
              <Area value={p} onChange={(v) => update((d) => { d.about.paragraphs[i] = v; })} />
              <RemoveButton onClick={() => update((d) => { d.about.paragraphs.splice(i, 1); })} />
            </div>
          ))}
          <AddButton label="Add paragraph" onClick={() => update((d) => { d.about.paragraphs.push(""); })} />

          <p className="text-sm font-medium pt-2">Features</p>
          {t.about.features.map((f, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="w-40 shrink-0"><IconSelect value={f.icon} onChange={(v) => update((d) => { d.about.features[i].icon = v; })} /></div>
              <div className="flex-1 space-y-2">
                <input className={inputCls} placeholder="Title" value={f.title} onChange={(e) => update((d) => { d.about.features[i].title = e.target.value; })} />
                <textarea className={inputCls} rows={2} placeholder="Description" value={f.description} onChange={(e) => update((d) => { d.about.features[i].description = e.target.value; })} />
              </div>
              <RemoveButton onClick={() => update((d) => { d.about.features.splice(i, 1); })} />
            </div>
          ))}
          <AddButton label="Add feature" onClick={() => update((d) => { d.about.features.push({ icon: "PawPrint", title: "", description: "" }); })} />
        </div>

        <div className="space-y-3 border-t pt-4">
          <h3 className="text-sm font-semibold text-primary">FAQs</h3>
          {t.faqs.map((f, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="flex-1 space-y-2">
                <input className={inputCls} placeholder="Question" value={f.question} onChange={(e) => update((d) => { d.faqs[i].question = e.target.value; })} />
                <textarea className={inputCls} rows={2} placeholder="Answer" value={f.answer} onChange={(e) => update((d) => { d.faqs[i].answer = e.target.value; })} />
              </div>
              <RemoveButton onClick={() => update((d) => { d.faqs.splice(i, 1); })} />
            </div>
          ))}
          <AddButton label="Add FAQ" onClick={() => update((d) => { d.faqs.push({ question: "", answer: "" }); })} />
        </div>
      </Card>

      {/* ---- Reviews ---- */}
      <Card className="p-6 space-y-4">
        <h2 className="font-semibold">Reviews</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <label className="space-y-1 block">
            <span className="text-sm font-medium">Source</span>
            <select className={inputCls} value={t.reviews.source ?? ""} onChange={(e) => update((d) => { d.reviews.source = (e.target.value || undefined) as Tenant["reviews"]["source"]; })}>
              <option value="">None</option>
              <option value="rover">Rover</option>
              <option value="ths">TrustedHousesitters</option>
              <option value="google">Google</option>
            </select>
          </label>
          <Field label="Heading" value={t.reviews.heading} onChange={(v) => update((d) => { d.reviews.heading = v; })} />
          <Field label="Subheading" value={t.reviews.subheading} onChange={(v) => update((d) => { d.reviews.subheading = v; })} />
        </div>
        {t.reviews.items.map((r, i) => (
          <div key={i} className="flex items-start gap-2 border-t pt-3">
            <div className="flex-1 space-y-2">
              <div className="grid sm:grid-cols-2 gap-2">
                <input className={inputCls} placeholder="Reviewer name" value={r.name} onChange={(e) => update((d) => { d.reviews.items[i].name = e.target.value; })} />
                <input className={inputCls} placeholder="Link to this review (optional)" value={r.link ?? ""} onChange={(e) => update((d) => { d.reviews.items[i].link = e.target.value || undefined; })} />
              </div>
              <textarea className={inputCls} rows={2} placeholder="Review text" value={r.text} onChange={(e) => update((d) => { d.reviews.items[i].text = e.target.value; })} />
            </div>
            <RemoveButton onClick={() => update((d) => { d.reviews.items.splice(i, 1); })} />
          </div>
        ))}
        <AddButton label="Add review" onClick={() => update((d) => { d.reviews.items.push({ name: "", text: "" }); })} />
      </Card>

      {/* ---- SEO ---- */}
      <Card className="p-6 space-y-4">
        <h2 className="font-semibold">SEO</h2>
        <Field label="Page title" value={t.seo.title} onChange={(v) => update((d) => { d.seo.title = v; })} />
        <Area label="Meta description" value={t.seo.description} onChange={(v) => update((d) => { d.seo.description = v; })} />
        <Area label="Keywords (comma-separated)" value={keywords} onChange={setKeywords} rows={2} />
      </Card>

      <div className="sticky bottom-4 flex items-center gap-3 bg-background/80 backdrop-blur p-3 rounded-xl border">
        <Button onClick={save} disabled={state === "saving"}>{state === "saving" ? "Saving…" : "Save changes"}</Button>
        {state === "saved" ? <span className="text-sm text-emerald-700">Saved ✓</span> : null}
        {state === "error" ? <span className="text-sm text-red-600">{error}</span> : null}
      </div>
    </div>
  );
}

/** Best-effort hex for the colour input; falls back to a neutral if non-hex. */
function hexFrom(value: string): string {
  return /^#[0-9a-fA-F]{6}$/.test(value) ? value : "#10b981";
}
