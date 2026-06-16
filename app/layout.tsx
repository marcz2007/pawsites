import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import type React from "react";
import "./globals.css";
import { getCurrentTenant } from "@/lib/tenant/server";

const geist = Geist({ subsets: ["latin"] });

/** Per-tenant SEO, generated from the resolved tenant. */
export async function generateMetadata(): Promise<Metadata> {
  const tenant = await getCurrentTenant();
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
  const tenant = await getCurrentTenant();
  // Apply the tenant's brand colour by overriding the --primary design token.
  const brandStyle = { ["--primary" as string]: tenant.branding.primary } as React.CSSProperties;

  return (
    <html lang="en">
      <body className={`${geist.className} font-sans antialiased`} style={brandStyle}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
