import { Button } from "@/components/ui/button";
import { LivePreview } from "@/components/marketing/live-preview";
import { RequestAccess } from "@/components/marketing/request-access";
import {
  DEMO_LIVE_URL,
  FEATURES,
  PRICING_CONTROL,
  STEPS,
  TIERS,
} from "@/lib/marketing/content";
import {
  ArrowRight,
  Calculator,
  CalendarDays,
  Check,
  ExternalLink,
  Footprints,
  Gauge,
  Globe,
  Heart,
  MessageCircle,
  PawPrint,
  Quote,
  Sparkles,
  Star,
  Wand2,
  type LucideIcon,
} from "lucide-react";

const FEATURE_ICONS: Record<string, LucideIcon> = {
  Sparkles,
  Calculator,
  CalendarDays,
  Star,
  Globe,
  Wand2,
  MessageCircle,
  Gauge,
  Heart,
  Footprints,
  PawPrint,
};

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#why", label: "Why Pawsites" },
  { href: "#how", label: "How it works" },
  { href: "#examples", label: "Live example" },
  { href: "#pricing", label: "Pricing" },
];

function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-bold tracking-tight ${className}`}>
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-black">
        <PawPrint className="h-5 w-5" />
      </span>
      Pawsites
    </span>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-[#f5f1e8]/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <a href="#top" className="text-lg text-neutral-900">
          <Wordmark />
        </a>
        <nav className="hidden items-center gap-7 text-sm font-medium text-neutral-600 md:flex">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} className="transition-colors hover:text-neutral-900">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" className="hidden text-neutral-700 hover:text-neutral-900 sm:inline-flex">
            <a href="/admin/login">Log in</a>
          </Button>
          <Button asChild className="bg-emerald-500 text-black hover:bg-emerald-400">
            <a href="#get-started">Get your site</a>
          </Button>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: "url(/abstract-paw-prints-pattern.jpg)",
          backgroundSize: "320px",
          backgroundRepeat: "repeat",
        }}
      />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-emerald-50/60 via-transparent to-[#f5f1e8]" />
      <div className="mx-auto max-w-4xl px-4 py-20 text-center md:px-6 md:py-28">
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-600/20 bg-white/70 px-4 py-1.5 text-sm font-medium text-emerald-800 shadow-sm">
          <Sparkles className="h-4 w-4" /> Built just for pet sitters &amp; dog sitters
        </span>
        <h1 className="mt-6 text-balance text-4xl font-bold tracking-tight text-neutral-900 md:text-6xl">
          Launch a beautiful pet‑sitting website{" "}
          <span className="text-emerald-600">in minutes</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-neutral-600 md:text-xl">
          Pawsites turns your pet‑care business into a polished, bookings‑ready website —
          instant‑quote calculator, availability calendar, reviews and enquiries built in.
          No code, no designer, no faff.
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="bg-emerald-500 px-8 text-base text-black hover:bg-emerald-400">
            <a href="#get-started">
              Get your site <ArrowRight className="ml-1 h-4 w-4" />
            </a>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-neutral-300 bg-white px-8 text-base">
            <a href="#examples">See a live example</a>
          </Button>
        </div>
        <p className="mt-5 text-sm text-neutral-500">
          From £4.99/month · Your own pawsites.co.uk address · Live in minutes
        </p>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="scroll-mt-20 bg-[#f5f1e8] py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl">
            Everything a pet sitter needs to win bookings
          </h2>
          <p className="mt-4 text-pretty text-lg text-neutral-600">
            One link does the selling for you — the same tools the pros use, ready out of the box.
          </p>
        </div>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => {
            const Icon = FEATURE_ICONS[f.icon] ?? Sparkles;
            return (
              <div
                key={f.title}
                className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-semibold text-neutral-900">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600">{f.body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function PricingControl() {
  return (
    <section id="why" className="scroll-mt-20 bg-emerald-900 py-20 text-white md:py-28">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-emerald-200">
            <Sparkles className="h-4 w-4" /> The Pawsites difference
          </span>
          <h2 className="mt-5 text-balance text-3xl font-bold tracking-tight md:text-4xl">
            Pricing that works the way you do
          </h2>
          <p className="mt-4 text-pretty text-lg text-emerald-100/85">
            The big marketplaces force every sitter into the same rigid box. Pawsites hands you
            the controls — charge for exactly what you offer, and clients see a fair, transparent
            price instantly.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PRICING_CONTROL.map((p) => {
            const Icon = FEATURE_ICONS[p.icon] ?? Sparkles;
            return (
              <div key={p.title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400/20 text-emerald-200">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-semibold text-white">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-emerald-100/75">{p.body}</p>
              </div>
            );
          })}
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-3">
          {[
            { stat: "0%", label: "booking commission — keep every penny you charge" },
            { stat: "More", label: "enquiries from clear, instant quotes" },
            { stat: "Happier", label: "clients and sitters with the right level of care" },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl bg-white/5 p-6 text-center">
              <p className="text-3xl font-bold text-emerald-300">{item.stat}</p>
              <p className="mt-1.5 text-sm text-emerald-100/80">{item.label}</p>
            </div>
          ))}
        </div>

        <figure className="mx-auto mt-12 max-w-3xl rounded-3xl border border-emerald-400/20 bg-white/5 p-8 text-center">
          <Quote className="mx-auto h-7 w-7 text-emerald-300" />
          <blockquote className="mt-4 text-pretty text-xl font-medium leading-relaxed text-white md:text-2xl">
            Pet sitters in the community have cheered the way the pricing is built — flexible,
            fair, and a world away from Rover and the big platforms.
          </blockquote>
          <figcaption className="mt-4 text-sm text-emerald-200/80">
            — what sitters are saying in the Facebook groups
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-20 bg-white py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl">
            From nothing to online in three steps
          </h2>
          <p className="mt-4 text-pretty text-lg text-neutral-600">
            No technical skills required. If you can fill in a form, you can build your site.
          </p>
        </div>
        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.title} className="relative">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-lg font-bold text-black">
                {i + 1}
              </span>
              <h3 className="mt-5 text-xl font-semibold text-neutral-900">{s.title}</h3>
              <p className="mt-2 leading-relaxed text-neutral-600">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ExampleSection() {
  return (
    <section id="examples" className="scroll-mt-20 bg-[#ebe4d6] py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1.5 text-sm font-medium text-emerald-800">
            <Star className="h-4 w-4" /> A real Pawsites site
          </span>
          <h2 className="mt-5 text-balance text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl">
            This is Happy at Home Pets — built on Pawsites
          </h2>
          <p className="mt-4 text-pretty text-lg text-neutral-700">
            Scroll the live site below. Your own could look just like this, with your story,
            your prices and your photos — and you&apos;d set it up in an afternoon.
          </p>
        </div>

        <div className="mt-12">
          <LivePreview />
        </div>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="bg-emerald-500 px-8 text-black hover:bg-emerald-400">
            <a href={DEMO_LIVE_URL} target="_blank" rel="noopener noreferrer">
              Open the live site <ExternalLink className="ml-1.5 h-4 w-4" />
            </a>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-neutral-400/40 bg-white px-8">
            <a href="#get-started">Build mine like this</a>
          </Button>
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="scroll-mt-20 bg-white py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl">
            Simple pricing, no surprises
          </h2>
          <p className="mt-4 text-pretty text-lg text-neutral-600">
            Two straightforward plans, billed monthly. Cancel anytime.
          </p>
        </div>
        <div className="mx-auto mt-14 grid max-w-3xl gap-6 md:grid-cols-2">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-3xl border p-8 ${
                tier.featured
                  ? "border-emerald-500/40 bg-emerald-50/40 shadow-lg ring-1 ring-emerald-500/20"
                  : "border-black/10 bg-white shadow-sm"
              }`}
            >
              {tier.featured ? (
                <span className="absolute -top-3 right-6 rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-black">
                  Most popular
                </span>
              ) : null}
              <h3 className="text-lg font-semibold text-neutral-900">{tier.name}</h3>
              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="text-4xl font-bold text-neutral-900">{tier.price}</span>
                {tier.cadence ? <span className="text-sm text-neutral-500">{tier.cadence}</span> : null}
              </div>
              <p className="mt-3 text-sm text-neutral-600">{tier.blurb}</p>
              <ul className="mt-6 space-y-3">
                {tier.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2.5 text-sm text-neutral-700">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    {feat}
                  </li>
                ))}
              </ul>
              <Button
                asChild
                className={`mt-8 w-full ${
                  tier.featured
                    ? "bg-emerald-500 text-black hover:bg-emerald-400"
                    : "bg-neutral-900 text-white hover:bg-neutral-800"
                }`}
              >
                <a href={`#plan-${tier.name.toLowerCase()}`}>{tier.ctaLabel}</a>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MarketingFooter() {
  return (
    <footer className="border-t border-black/5 bg-[#f5f1e8]">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-12 text-center md:px-6">
        <Wordmark className="text-lg text-neutral-900" />
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-neutral-600">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-neutral-900">
              {l.label}
            </a>
          ))}
          <a href="/admin/login" className="hover:text-neutral-900">
            Log in
          </a>
        </nav>
        <p className="text-sm text-neutral-500">
          © 2026 Pawsites · Beautiful websites for pet‑care businesses.
        </p>
      </div>
    </footer>
  );
}

export function MarketingHome() {
  return (
    <main id="top" className="min-h-screen scroll-smooth bg-[#f5f1e8] text-neutral-900">
      <Nav />
      <Hero />
      <Features />
      <PricingControl />
      <HowItWorks />
      <ExampleSection />
      <Pricing />
      <RequestAccess />
      <MarketingFooter />
    </main>
  );
}
