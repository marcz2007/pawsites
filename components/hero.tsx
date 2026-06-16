import { Button } from "@/components/ui/button";
import { icon } from "@/lib/icons";
import type { Tenant } from "@/lib/tenant/types";
import Image from "next/image";

export function Hero({ tenant }: { tenant: Tenant }) {
  const { businessName, tagline, hero, founderName, branding } = tenant;

  return (
    <section className="relative min-h-[105dvh] flex items-center justify-center overflow-hidden pb-28 md:pb-36">
      {/* SEO: keyworded H1 for crawlers, visually hidden */}
      <h1 className="sr-only">
        {businessName} — {tagline}
      </h1>

      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: "url(/abstract-paw-prints-pattern.jpg)",
          backgroundSize: "380px",
          backgroundRepeat: "repeat",
        }}
      />
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(70%_55%_at_50%_50%,rgba(0,0,0,0.7),transparent_70%)]" />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 via-transparent to-lime-400/10" />
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 md:h-72 bg-gradient-to-b from-transparent to-[#ebe4d6]" />

      <div className="container px-4 md:px-6 relative z-10">
        <div className="mx-auto max-w-3xl p-6 md:p-10 rounded-3xl bg-black/55 backdrop-blur-xl border border-white/15 ring-1 ring-inset ring-white/10 shadow-xl space-y-6">
          {/* Pills row */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white text-black text-sm font-medium shadow-sm">
              ⭐ {tagline}
            </span>
            {hero.priceFromLabel ? (
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white text-black text-sm font-medium shadow-sm">
                {hero.priceFromLabel}
              </span>
            ) : null}
          </div>

          {/* Logo or business name */}
          <div className="flex justify-center py-4">
            {branding.logoSrc ? (
              <Image
                src={branding.logoSrc}
                alt={businessName}
                width={560}
                height={140}
                className="w-full max-w-[420px] h-auto brightness-0 invert"
                priority
              />
            ) : (
              <h2 className="text-3xl md:text-5xl font-bold text-white text-center">
                {businessName}
              </h2>
            )}
          </div>

          {/* Trust bar */}
          <div className="flex flex-col flex-wrap sm:flex-row items-center justify-center gap-3 text-sm text-neutral-300">
            {hero.trustBadges.map((badge) => {
              const Icon = icon(badge.icon);
              return (
                <div key={badge.label} className="inline-flex items-center gap-2">
                  <Icon className="h-4 w-4 text-emerald-300" />
                  <span>{badge.label}</span>
                </div>
              );
            })}
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button
              size="lg"
              asChild
              className="text-base md:text-lg px-7 md:px-8 bg-emerald-500 text-black hover:bg-emerald-400"
            >
              <a href="#pricing">{hero.ctaPrimaryLabel}</a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="text-base md:text-lg px-7 md:px-8 bg-white/95 text-black hover:bg-white hover:text-black"
            >
              <a href="#calendar">{hero.ctaSecondaryLabel}</a>
            </Button>
          </div>

          {/* Nav pills */}
          <div className="flex flex-wrap justify-center gap-2 text-sm text-neutral-200">
            {["About", "Pricing & Enquiry", "Reviews", "FAQs"].map((label, i) => (
              <a
                key={label}
                href={["#about", "#pricing", "#reviews", "#faq"][i]}
                className="px-3 py-1 rounded-full border border-white/20 hover:border-white/40 transition"
              >
                {label}
              </a>
            ))}
          </div>

          <div className="mx-auto h-px w-16 bg-white/20" />

          {hero.blurb ? (
            <p className="text-center md:text-lg text-neutral-300 leading-relaxed">
              {founderName ? (
                <>
                  Founder-led by <span className="font-semibold">{founderName}</span>.{" "}
                </>
              ) : null}
              {hero.blurb}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
