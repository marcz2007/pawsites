"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useState } from "react";

function slugify(input: string) {
  return input.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 32);
}

const inputCls = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm";

export function CreateTenantPanel() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [tier, setTier] = useState("free");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const effectiveSlug = slugEdited ? slug : slugify(name);

  const create = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/tenant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessName: name, slug: effectiveSlug, tier }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create site");
      router.push(`/admin/${data.slug}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create site");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <div>
        <h2 className="font-semibold">Create a new site</h2>
        <p className="text-sm text-muted-foreground">Sets up a blank site you (or the sitter) can then fill in.</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="space-y-1 block">
          <span className="text-sm font-medium">Business name</span>
          <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Lauren's Pet Care" />
        </label>
        <label className="space-y-1 block">
          <span className="text-sm font-medium">Subdomain</span>
          <div className="flex items-center gap-1">
            <input
              className={inputCls}
              value={effectiveSlug}
              onChange={(e) => { setSlugEdited(true); setSlug(slugify(e.target.value)); }}
              placeholder="lauren"
            />
            <span className="text-sm text-muted-foreground whitespace-nowrap">.pawsites.co.uk</span>
          </div>
        </label>
        <label className="space-y-1 block">
          <span className="text-sm font-medium">Plan</span>
          <select className={inputCls} value={tier} onChange={(e) => setTier(e.target.value)}>
            <option value="free">free</option>
            <option value="plus">plus</option>
          </select>
        </label>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button onClick={create} disabled={busy || !name || !effectiveSlug}>
        {busy ? "Creating…" : "Create site"}
      </Button>
    </Card>
  );
}
