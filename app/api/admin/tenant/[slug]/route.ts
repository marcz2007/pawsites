import { NextResponse } from "next/server";
import { canEdit, getAccess } from "@/lib/admin/access";
import { getTenantBySlug, saveTenant } from "@/lib/tenant/store";
import type { Tenant } from "@/lib/tenant/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const access = await getAccess();
  if (!access || !canEdit(access, slug)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const tenant = await getTenantBySlug(slug);
  if (!tenant) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(tenant);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const access = await getAccess();
  if (!access || !canEdit(access, slug)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Tenant;
  try {
    body = (await request.json()) as Tenant;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // The slug is the identity key — never let the body change which row we write.
  body.slug = slug;

  if (!body.businessName || !body.pricing || !body.hero) {
    return NextResponse.json({ error: "Missing required tenant fields" }, { status: 400 });
  }

  const result = await saveTenant(body);
  if (!result.ok) {
    return NextResponse.json({ error: result.error || "Save failed" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
