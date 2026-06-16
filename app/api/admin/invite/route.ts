import { NextResponse } from "next/server";
import { getAccess } from "@/lib/admin/access";
import { createAuthUser } from "@/lib/auth/supabase-auth";
import { addMembership, createInvite, getTenantIdBySlug } from "@/lib/tenant/members";

/**
 * Operator-only: invite a sitter to manage a tenant. Creates their Supabase
 * Auth user, links them to the tenant, and returns a one-time link they use to
 * set their password. (You send the link to them — no email infra required.)
 */
export async function POST(request: Request) {
  const access = await getAccess();
  if (!access?.isOperator) {
    return NextResponse.json({ error: "Operator only" }, { status: 403 });
  }

  const { email, tenantSlug } = (await request.json().catch(() => ({}))) as {
    email?: string;
    tenantSlug?: string;
  };
  if (!email || !tenantSlug) {
    return NextResponse.json({ error: "email and tenantSlug required" }, { status: 400 });
  }

  const tenantId = await getTenantIdBySlug(tenantSlug);
  if (!tenantId) {
    return NextResponse.json({ error: "Unknown tenant" }, { status: 404 });
  }

  const created = await createAuthUser(email);
  if ("error" in created) {
    return NextResponse.json({ error: created.error }, { status: 400 });
  }

  const membership = await addMembership(created.id, tenantId);
  if (membership.error) {
    return NextResponse.json({ error: membership.error }, { status: 500 });
  }

  const invite = await createInvite(created.id, tenantId, email);
  if ("error" in invite) {
    return NextResponse.json({ error: invite.error }, { status: 500 });
  }

  const acceptUrl = new URL(`/accept?token=${invite.token}`, request.url).toString();
  return NextResponse.json({ ok: true, acceptUrl });
}
