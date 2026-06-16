import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Tenant } from "@/lib/tenant/types";
import { ExternalLink, Star } from "lucide-react";
import Link from "next/link";

export function Reviews({ tenant }: { tenant: Tenant }) {
  const { reviews } = tenant;

  return (
    <section id="reviews" className="bg-muted/50 py-24 md:py-32">
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-16 space-y-4 text-center">
          <h2 className="text-4xl font-bold tracking-tight text-balance md:text-5xl">
            {reviews.heading}
          </h2>
          <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
            {reviews.subheading}
          </p>
          {reviews.externalUrl ? (
            <div className="flex justify-center pt-2">
              <Button asChild variant="outline" className="gap-2 bg-transparent">
                <Link href={reviews.externalUrl} target="_blank" rel="noopener noreferrer">
                  <Star className="h-4 w-4 fill-accent text-accent" />
                  {reviews.externalLabel ?? "Verified Reviews"}
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          ) : null}
        </div>

        <div className="grid items-start gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reviews.items.map((review, index) => {
            const card = (
              <Card className="h-auto space-y-4 p-6 transition-all hover:scale-[1.02] hover:shadow-lg">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {review.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold">{review.name}</h3>
                    <p className="text-sm text-muted-foreground">{review.date}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-accent text-accent" />
                  ))}
                </div>
                <p className="leading-relaxed text-muted-foreground">"{review.text}"</p>
              </Card>
            );

            return reviews.externalUrl ? (
              <Link
                key={`${review.name}-${index}`}
                href={reviews.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block cursor-pointer"
              >
                {card}
              </Link>
            ) : (
              <div key={`${review.name}-${index}`}>{card}</div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
