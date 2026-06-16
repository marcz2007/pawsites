import type { Metadata } from "next";
import type React from "react";

// Admin has its own title and is never indexed (overrides the tenant SEO
// metadata from the root layout).
export const metadata: Metadata = {
  title: "Pawsites Admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
