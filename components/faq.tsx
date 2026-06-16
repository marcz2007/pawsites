import { Card } from "@/components/ui/card";
import type { Tenant } from "@/lib/tenant/types";

export function Faq({ tenant }: { tenant: Tenant }) {
  return (
    <section id="faq" className="py-20 md:py-28 bg-white">
      <div className="container px-4 md:px-6 max-w-5xl mx-auto">
        <div className="text-center space-y-3 mb-10">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-balance">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground text-pretty">
            Quick answers to the most common questions.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {tenant.faqs.map((item) => (
            <Card key={item.question} className="p-6 space-y-2 h-full">
              <h3 className="font-semibold text-lg">{item.question}</h3>
              <p className="text-muted-foreground leading-relaxed">{item.answer}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
