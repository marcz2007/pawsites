"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function AcceptForm() {
  const router = useRouter();
  const token = useSearchParams().get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords don't match");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Could not set password");
      }
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  };

  const input = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm";

  if (!token) {
    return <p className="text-sm text-red-600">Missing invite token.</p>;
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <input type="password" placeholder="Choose a password (8+ chars)" value={password} onChange={(e) => setPassword(e.target.value)} className={input} autoFocus />
      <input type="password" placeholder="Confirm password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={input} />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" className="w-full" disabled={busy || password.length < 8}>
        {busy ? "Setting up…" : "Set password & sign in"}
      </Button>
    </form>
  );
}

export default function AcceptInvite() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm p-8 space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold">Welcome to Pawsites</h1>
          <p className="text-sm text-muted-foreground">Set a password to access your site</p>
        </div>
        <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
          <AcceptForm />
        </Suspense>
      </Card>
    </main>
  );
}
