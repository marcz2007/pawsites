import { TenantForm } from "@/components/admin/tenant-form";
import { requireAdmin } from "@/lib/admin/auth";
import { getTenantBySlug } from "@/lib/tenant/store";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditTenant({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await requireAdmin();
  const { slug } = await params;
  const tenant = await getTenantBySlug(slug);
  if (!tenant) notFound();

  return (
    <main className="min-h-screen bg-muted/30 p-6 md:p-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground">
              ← All tenants
            </Link>
            <h1 className="text-2xl font-bold mt-1">{tenant.businessName}</h1>
            <p className="text-sm text-muted-foreground">
              <a href={`/?tenant=${tenant.slug}`} target="_blank" rel="noreferrer" className="underline">
                Preview site ↗
              </a>
            </p>
          </div>
        </div>
        <TenantForm tenant={tenant} />
      </div>
    </main>
  );
}
