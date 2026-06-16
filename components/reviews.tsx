import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import type { Review, ReviewSource, Tenant } from "@/lib/tenant/types";
import { Star } from "lucide-react";
import Link from "next/link";

const SOURCE_LABEL: Record<ReviewSource, string> = {
  rover: "Rover",
  ths: "TrustedHousesitters",
  google: "Google",
};

function initialsOf(review: Review): string {
  if (review.initials) return review.initials;
  return review.name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Reviews({ tenant }: { tenant: Tenant }) {
  const { reviews } = tenant;
  const sourceLabel = reviews.source ? SOURCE_LABEL[reviews.source] : null;

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
          {sourceLabel ? (
            <p className="text-sm font-medium text-muted-foreground">
              ⭐ Verified reviews from {sourceLabel}
            </p>
          ) : null}
        </div>

        <div className="grid items-start gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reviews.items.map((review, index) => {
            const rating = review.rating ?? 5;
            const card = (
              <Card className="h-auto space-y-4 p-6 transition-all hover:scale-[1.02] hover:shadow-lg">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {initialsOf(review)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold">{review.name}</h3>
                    {review.date ? (
                      <p className="text-sm text-muted-foreground">{review.date}</p>
                    ) : null}
                  </div>
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-accent text-accent" />
                  ))}
                </div>
                <p className="leading-relaxed text-muted-foreground">"{review.text}"</p>
              </Card>
            );

            return review.link ? (
              <Link
                key={`${review.name}-${index}`}
                href={review.link}
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
