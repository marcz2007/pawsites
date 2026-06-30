import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import type React from "react";
import "./globals.css";
import {
  HOME_DOMAIN_SHOWS_MARKETING,
  MARKETING_BRAND_PRIMARY,
  marketingMetadata,
} from "@/lib/marketing/content";
import { resolveTenant } from "@/lib/tenant/server";
import { getDefaultTenant } from "@/lib/tenant/store";

const geist = Geist({ subsets: ["latin"] });

/** Per-tenant SEO, or Pawsites SEO on the home/marketing domain. */
export async function generateMetadata(): Promise<Metadata> {
  const resolved = await resolveTenant();
  if (!resolved && HOME_DOMAIN_SHOWS_MARKETING) return marketingMetadata();

  const tenant = resolved ?? (await getDefaultTenant());
  return {
    title: tenant.seo.title,
    description: tenant.seo.description,
    keywords: tenant.seo.keywords,
    openGraph: {
      title: tenant.seo.title,
      description: tenant.seo.description,
      type: "website",
      locale: "en_GB",
      siteName: tenant.businessName,
    },
    robots: { index: true, follow: true },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const resolved = await resolveTenant();
  const isMarketing = !resolved && HOME_DOMAIN_SHOWS_MARKETING;
  // Apply the brand colour by overriding the --primary design token: the
  // tenant's hue for a tenant site, the Pawsites hue on the marketing domain.
  const primary = isMarketing
    ? MARKETING_BRAND_PRIMARY
    : (resolved ?? (await getDefaultTenant())).branding.primary;
  const brandStyle = { ["--primary" as string]: primary } as React.CSSProperties;

  return (
    <html lang="en">
      <body className={`${geist.className} font-sans antialiased`} style={brandStyle}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
