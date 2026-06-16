import { About } from "@/components/about";
import { Faq } from "@/components/faq";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/hero";
import { Pricing } from "@/components/pricing";
import { Reviews } from "@/components/reviews";
import { getCurrentTenant } from "@/lib/tenant/server";
import Script from "next/script";

export default async function Home() {
  const tenant = await getCurrentTenant();

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
