import { TenantForm } from "@/components/admin/tenant-form";
import { Button } from "@/components/ui/button";
import { canEdit, requireAccess } from "@/lib/admin/access";
import { getTenantBySlug } from "@/lib/tenant/store";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const BASE_DOMAIN = "pawsites.co.uk";

/**
 * The tenant's public site URL. In production this is their real subdomain
 * (slug.pawsites.co.uk); elsewhere (localhost / preview deploys) we fall back
 * to the host-agnostic ?tenant= override so preview still works.
 */
async function previewUrl(slug: string): Promise<string> {
  const host = (await headers()).get("host")?.split(":")[0].toLowerCase() ?? "";
  if (host === BASE_DOMAIN || host.endsWith(`.${BASE_DOMAIN}`)) {
    return `https://${slug}.${BASE_DOMAIN}`;
  }
  return `/?tenant=${slug}`;
}

export default async function EditTenant({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const access = await requireAccess();
  const { slug } = await params;
  if (!canEdit(access, slug)) redirect("/admin");
  const tenant = await getTenantBySlug(slug);
  if (!tenant) notFound();

  const preview = await previewUrl(slug);

  return (
    <main className="min-h-screen bg-muted/30 p-6 md:p-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground">
              ← All tenants
            </Link>
            <h1 className="text-2xl font-bold mt-1">{tenant.businessName}</h1>
          </div>
          <Button asChild variant="outline" className="gap-2 shrink-0">
            <a href={preview} target="_blank" rel="noreferrer">
              View live site ↗
            </a>
          </Button>
        </div>
        <p className="text-xs text-muted-foreground -mt-2">
          Opens your published site in a new tab — save your changes first to see them.
        </p>
        <TenantForm tenant={tenant} isOperator={access.isOperator} previewUrl={preview} />
      </div>
    </main>
  );
}
