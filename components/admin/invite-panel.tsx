"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";

export function InvitePanel({ tenants }: { tenants: { slug: string; name: string }[] }) {
  const [email, setEmail] = useState("");
  const [slug, setSlug] = useState(tenants[0]?.slug ?? "");
  const [busy, setBusy] = useState(false);
  const [link, setLink] = useState("");
  const [error, setError] = useState("");

  const invite = async () => {
    setBusy(true);
    setError("");
    setLink("");
    try {
      const res = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, tenantSlug: slug }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invite failed");
      setLink(data.acceptUrl);
      setEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invite failed");
    } finally {
      setBusy(false);
    }
  };

  const input = "rounded-lg border border-border bg-background px-3 py-2 text-sm";

  return (
    <Card className="p-6 space-y-4">
      <div>
        <h2 className="font-semibold">Invite a sitter</h2>
        <p className="text-sm text-muted-foreground">
          Creates their login and links it to a tenant. Send them the link to set their password.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          placeholder="sitter@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`${input} flex-1`}
        />
        <select value={slug} onChange={(e) => setSlug(e.target.value)} className={input}>
          {tenants.map((t) => (
            <option key={t.slug} value={t.slug}>
              {t.name}
            </option>
          ))}
        </select>
        <Button onClick={invite} disabled={busy || !email || !slug}>
          {busy ? "Inviting…" : "Create invite"}
        </Button>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {link ? (
        <div className="space-y-1">
          <p className="text-sm font-medium text-emerald-700">Invite created — send this link:</p>
          <input readOnly value={link} onFocus={(e) => e.currentTarget.select()} className={`${input} w-full font-mono text-xs`} />
        </div>
      ) : null}
    </Card>
  );
}
