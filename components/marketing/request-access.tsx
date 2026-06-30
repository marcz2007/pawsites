"use client";

import { Button } from "@/components/ui/button";
import { TIERS } from "@/lib/marketing/content";
import { CheckCircle2, PawPrint } from "lucide-react";
import { useEffect, useState } from "react";

const FIELD =
  "w-full rounded-lg border border-black/10 bg-white px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30";

type PlanName = "basic" | "plus";

export function RequestAccess() {
  const [plan, setPlan] = useState<PlanName>("plus");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [business, setBusiness] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [error, setError] = useState("");

  // The pricing cards link to #plan-basic / #plan-plus. Reflect that choice in
  // the form and scroll the form into view (the hash has no element of its own).
  useEffect(() => {
    const applyFromHash = () => {
      const hash = window.location.hash;
      if (hash !== "#plan-basic" && hash !== "#plan-plus") return;
      setPlan(hash === "#plan-basic" ? "basic" : "plus");
      document.getElementById("get-started")?.scrollIntoView({ behavior: "smooth" });
    };
    applyFromHash();
    window.addEventListener("hashchange", applyFromHash);
    return () => window.removeEventListener("hashchange", applyFromHash);
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("busy");
    setError("");
    try {
      const res = await fetch("/api/access-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, name, email, business, subdomain, message }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Something went wrong");
      }
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  return (
    <section id="get-started" className="scroll-mt-20 bg-emerald-950 py-20 text-white md:py-28">
      <div className="mx-auto grid max-w-5xl gap-10 px-4 md:grid-cols-2 md:gap-16 md:px-6">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-emerald-200">
            <PawPrint className="h-4 w-4" /> Get early access
          </span>
          <h2 className="mt-5 text-balance text-3xl font-bold tracking-tight md:text-4xl">
            Ready to build your pet‑sitting website?
          </h2>
          <p className="mt-4 text-pretty text-lg text-emerald-100/80">
            Pawsites is invite‑only while we onboard our first sitters. Tell us a little about
            your business and we&apos;ll set up your site and send you the keys.
          </p>
          <p className="mt-6 text-sm text-emerald-200/70">
            Prefer email? Reach us at{" "}
            <a className="underline hover:text-white" href="mailto:hello@pawsites.co.uk">
              hello@pawsites.co.uk
            </a>
            .
          </p>
        </div>

        <div className="rounded-3xl bg-white p-6 text-neutral-900 shadow-xl md:p-8">
          {status === "done" ? (
            <div className="flex h-full min-h-[280px] flex-col items-center justify-center text-center">
              <CheckCircle2 className="h-12 w-12 text-emerald-500" />
              <h3 className="mt-4 text-xl font-semibold">You&apos;re on the list!</h3>
              <p className="mt-2 text-neutral-600">
                Thanks{name ? `, ${name.split(" ")[0]}` : ""} — we&apos;ll be in touch at{" "}
                <span className="font-medium">{email}</span> very soon.
              </p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <fieldset>
                <legend className="mb-1.5 block text-sm font-medium">Choose your plan</legend>
                <div className="grid grid-cols-2 gap-3">
                  {TIERS.map((tier) => {
                    const value = tier.name.toLowerCase() as PlanName;
                    const selected = plan === value;
                    return (
                      <label
                        key={value}
                        className={`flex cursor-pointer flex-col rounded-xl border-2 p-3 transition-colors ${
                          selected
                            ? "border-emerald-500 bg-emerald-50"
                            : "border-black/10 bg-white hover:border-black/20"
                        }`}
                      >
                        <span className="flex items-center justify-between">
                          <span className="font-semibold text-neutral-900">{tier.name}</span>
                          <input
                            type="radio"
                            name="plan"
                            value={value}
                            checked={selected}
                            onChange={() => setPlan(value)}
                            className="h-4 w-4 accent-emerald-500"
                          />
                        </span>
                        <span className="mt-0.5 text-sm text-neutral-600">
                          {tier.price}
                          <span className="text-neutral-400">{tier.cadence}</span>
                        </span>
                        <span className="mt-1 text-xs text-neutral-500">
                          {value === "plus" ? "Enquiries to your own email" : "WhatsApp & phone enquiries"}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Your name</label>
                  <input
                    className={FIELD}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Jane Sitter"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Email</label>
                  <input
                    type="email"
                    className={FIELD}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="jane@example.com"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Business name</label>
                  <input
                    className={FIELD}
                    value={business}
                    onChange={(e) => setBusiness(e.target.value)}
                    placeholder="Happy Paws"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Wanted address <span className="font-normal text-neutral-400">(optional)</span>
                  </label>
                  <div className="flex items-center rounded-lg border border-black/10 bg-white focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/30">
                    <input
                      className="w-full rounded-l-lg bg-transparent px-3.5 py-2.5 text-sm focus:outline-none"
                      value={subdomain}
                      onChange={(e) => setSubdomain(e.target.value)}
                      placeholder="happypaws"
                    />
                    <span className="whitespace-nowrap pr-3 text-sm text-neutral-400">.pawsites.co.uk</span>
                  </div>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Anything else? <span className="font-normal text-neutral-400">(optional)</span>
                </label>
                <textarea
                  className={`${FIELD} min-h-[88px] resize-y`}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us about your pet‑care business…"
                />
              </div>
              {status === "error" ? <p className="text-sm text-red-600">{error}</p> : null}
              <Button
                type="submit"
                disabled={status === "busy"}
                className="w-full bg-emerald-500 text-black hover:bg-emerald-400"
                size="lg"
              >
                {status === "busy" ? "Sending…" : "Request my site"}
              </Button>
              <p className="text-center text-xs text-neutral-400">
                No spam. We&apos;ll only use your details to set up your Pawsites site.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
