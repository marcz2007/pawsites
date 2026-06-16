import { NextResponse } from "next/server";
import { canEdit, getAccess } from "@/lib/admin/access";
import { getSupabase } from "@/lib/supabase";

const BUCKET = "tenant-images";
const MAX_BYTES = 5 * 1024 * 1024; // 5MB

/**
 * Uploads an image for a tenant to Supabase Storage and returns its public URL.
 * Auth: operator, or the sitter who owns the tenant. Creates the public bucket
 * on first use, so there's no manual setup.
 */
export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  const slug = form?.get("tenant");

  if (!(file instanceof File) || typeof slug !== "string") {
    return NextResponse.json({ error: "file and tenant are required" }, { status: 400 });
  }

  const access = await getAccess();
  if (!access || !canEdit(access, slug)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image must be under 5MB" }, { status: 400 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Storage not configured" }, { status: 500 });
  }

  // Ensure the public bucket exists (ignore "already exists").
  await supabase.storage.createBucket(BUCKET, { public: true, fileSizeLimit: MAX_BYTES });

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${slug}/${Date.now()}.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, bytes, { contentType: file.type, upsert: true });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return NextResponse.json({ ok: true, url: data.publicUrl });
}
