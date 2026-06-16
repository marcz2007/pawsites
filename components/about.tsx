import { Card } from "@/components/ui/card";
import { icon } from "@/lib/icons";
import type { Tenant } from "@/lib/tenant/types";
import Image from "next/image";

export function About({ tenant }: { tenant: Tenant }) {
  const { about, founderName } = tenant;

  return (
    <section id="about" className="pt-16 md:pt-24 pb-24 md:pb-32 bg-[rgba(235,228,214,1)]">
      <div className="container px-4 md:px-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start mb-16">
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-balance">
              {about.heading}
            </h2>
            <div className="space-y-4">
              {about.paragraphs.map((p, i) => (
                <p key={i} className="text-lg leading-relaxed">
                  {p}
                </p>
              ))}
            </div>
          </div>

          {about.imageSrc ? (
            <div className="space-y-6">
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src={about.imageSrc}
                  alt={founderName ? `${founderName} with a happy pet` : "Happy pet"}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          ) : null}
        </div>

        {/* Features */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
          {about.features.map((feature) => {
            const Icon = icon(feature.icon);
            return (
              <Card
                key={feature.title}
                className="p-6 space-y-3 border-2 hover:border-primary/50 transition-colors"
              >
                <Icon className="w-8 h-8 text-primary" />
                <h3 className="font-semibold text-lg">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default About;
