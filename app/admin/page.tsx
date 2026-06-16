import { InvitePanel } from "@/components/admin/invite-panel";
import { Card } from "@/components/ui/card";
import { requireAccess } from "@/lib/admin/access";
import { getAllTenants } from "@/lib/tenant/store";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const access = await requireAccess();
  const all = await getAllTenants();
  const tenants = access.isOperator
    ? all
    : all.filter((t) => access.tenantSlugs?.includes(t.slug));

  const logoutAction = access.isOperator && !access.user ? "/api/admin/logout" : "/api/auth/logout";

  return (
    <main className="min-h-screen bg-muted/30 p-6 md:p-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              {access.isOperator ? "Tenants" : "Your site"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {access.isOperator
                ? `${tenants.length} business${tenants.length === 1 ? "" : "es"}`
                : access.user?.email}
            </p>
          </div>
          <form action={logoutAction} method="post">
            <button className="text-sm text-muted-foreground hover:text-foreground underline">
              Log out
            </button>
          </form>
        </div>

        <div className="space-y-3">
          {tenants.map((t) => (
            <Link key={t.slug} href={`/admin/${t.slug}`}>
              <Card className="p-5 flex items-center justify-between hover:border-primary/50 transition-colors">
                <div>
                  <p className="font-semibold">{t.businessName}</p>
                  <p className="text-sm text-muted-foreground">
                    {t.slug}.pawsites.co.uk · {t.locationLabel}
                  </p>
                </div>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    t.tier === "plus" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {t.tier}
                </span>
              </Card>
            </Link>
          ))}
          {tenants.length === 0 ? (
            <Card className="p-5 text-sm text-muted-foreground">
              No site is linked to your account yet.
            </Card>
          ) : null}
        </div>

        {access.isOperator ? <InvitePanel tenants={all.map((t) => ({ slug: t.slug, name: t.businessName }))} /> : null}
      </div>
    </main>
  );
}
