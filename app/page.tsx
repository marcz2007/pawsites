import { About } from "@/components/about";
import { Faq } from "@/components/faq";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/hero";
import { MarketingHome } from "@/components/marketing/marketing-home";
import { Pricing } from "@/components/pricing";
import { Reviews } from "@/components/reviews";
import { HOME_DOMAIN_SHOWS_MARKETING } from "@/lib/marketing/content";
import { resolveTenant } from "@/lib/tenant/server";
import { getDefaultTenant } from "@/lib/tenant/store";
import Script from "next/script";

export default async function Home() {
  const resolved = await resolveTenant();

  // Home / apex domain (no tenant) → the Pawsites marketing site. Flip
  // HOME_DOMAIN_SHOWS_MARKETING to revert the apex to the default tenant.
  if (!resolved && HOME_DOMAIN_SHOWS_MARKETING) {
    return <MarketingHome />;
  }

  const tenant = resolved ?? (await getDefaultTenant());

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: tenant.businessName,
    telephone: tenant.contact.phone,
    areaServed: tenant.serviceAreas,
    description: tenant.seo.description,
    slogan: tenant.tagline,
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: tenant.faqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <>
      <Script
        id="ld-localbusiness"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <Script
        id="ld-faq"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <main className="min-h-screen">
        <Hero tenant={tenant} />
        <About tenant={tenant} />
        <Reviews tenant={tenant} />
        <Pricing tenant={tenant} />
        <Faq tenant={tenant} />
        <Footer tenant={tenant} />
      </main>
    </>
  );
}
