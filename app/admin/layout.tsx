import { ProfileMenu } from "@/components/admin/profile-menu";
import { getAccess } from "@/lib/admin/access";
import type { Metadata } from "next";
import Link from "next/link";
import type React from "react";

// Admin has its own title and is never indexed (overrides the tenant SEO
// metadata from the root layout).
export const metadata: Metadata = {
  title: "Pawsites Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const access = await getAccess();

  return (
    <>
      {access ? (
        <div className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
          <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
            <Link href="/admin" className="font-semibold">
              Pawsites
            </Link>
            <ProfileMenu
              email={access.user?.email ?? null}
              isOperator={access.isOperator}
              logoutAction={access.user ? "/api/auth/logout" : "/api/admin/logout"}
            />
          </div>
        </div>
      ) : null}
      {children}
    </>
  );
}
