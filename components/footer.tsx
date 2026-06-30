import type { Tenant } from "@/lib/tenant/types";
import { Mail, MapPin, MessageCircle } from "lucide-react";

export function Footer({ tenant }: { tenant: Tenant }) {
  const { businessName, locationLabel, contact, founderName, serviceAreas } = tenant;
  const year = 2026;

  const contactItems = [
    { icon: MapPin, label: "Based in", value: locationLabel, href: undefined as string | undefined },
    contact.email
      ? { icon: Mail, label: "Email", value: contact.email, href: `mailto:${contact.email}` }
      : null,
    contact.responseTime
      ? { icon: MessageCircle, label: "Response time", value: contact.responseTime, href: undefined }
      : null,
  ].filter(Boolean) as { icon: typeof MapPin; label: string; value: string; href?: string }[];

  return (
    <footer className="border-t bg-secondary/30">
      <div className="container px-4 md:px-6 py-12 max-w-6xl mx-auto">
        <div className="flex flex-col items-center gap-6 text-center">
          <h2 className="text-2xl font-bold">{businessName}</h2>

          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <a href="#about" className="hover:text-primary transition-colors">About</a>
            <a href="#reviews" className="hover:text-primary transition-colors">Reviews</a>
            <a href="#pricing" className="hover:text-primary transition-colors">Pricing & Enquiry</a>
            <a href="#faq" className="hover:text-primary transition-colors">FAQs</a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl">
            {contactItems.map(({ icon: Icon, label, value, href }) => (
              <div key={label} className="flex min-w-0 items-center gap-3 justify-center">
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary shrink-0">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 text-left">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground/80">{label}</p>
                  {href ? (
                    <a
                      href={href}
                      className="block break-words font-medium text-neutral-900 hover:text-primary transition-colors"
                    >
                      {value}
                    </a>
                  ) : (
                    <p className="break-words font-medium text-neutral-900">{value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {serviceAreas.length > 0 ? (
            <p className="text-sm text-neutral-700 max-w-2xl">
              Serving {locationLabel} areas incl. {serviceAreas.slice(0, 8).join(", ")}
              {serviceAreas.length > 8 ? " and more" : ""}.
            </p>
          ) : null}

          {founderName ? (
            <p className="text-xs text-neutral-700">
              {businessName} is a small, founder-led service — every booking personally delivered by {founderName}.
            </p>
          ) : null}

          <div className="pt-6 border-t w-full text-center text-sm text-muted-foreground">
            <p>© {year} {businessName}. All rights reserved.</p>
            <p className="mt-1 text-xs">
              Powered by{" "}
              <a href="https://pawsites.co.uk" className="hover:text-primary transition-colors">
                Pawsites
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
