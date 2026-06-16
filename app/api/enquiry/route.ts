import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getDefaultTenant, getTenantByHost, getTenantBySlug } from "@/lib/tenant/store";
import type { Tenant } from "@/lib/tenant/types";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

type EnquiryPayload = {
  tenant?: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  message?: string;
  subject?: string;
  channel?: string;
};

type CaptureResult = true | false | null;

/** Per-tenant Google Sheet webhook, with a platform-wide fallback. */
function sheetWebhookFor(tenant: Tenant): string | undefined {
  return (
    tenant.enquiry.sheetWebhookUrl ||
    process.env[`GOOGLE_SHEET_WEBHOOK_URL_${tenant.slug.toUpperCase()}`] ||
    process.env.GOOGLE_SHEET_WEBHOOK_URL
  );
}

async function appendToSheet(
  tenant: Tenant,
  payload: EnquiryPayload,
  receivedAt: string
): Promise<CaptureResult> {
  const url = sheetWebhookFor(tenant);
  if (!url) return null;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: process.env.GOOGLE_SHEET_SHARED_SECRET || "",
        receivedAt,
        tenant: tenant.slug,
        channel: payload.channel || "email",
        name: payload.name || "",
        email: payload.email || "",
        phone: payload.phone || "",
        address: payload.address || "",
        message: payload.message || "",
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      console.error(`ENQUIRY_SHEET_FAILED [${tenant.slug}] HTTP ${res.status}`);
      return false;
    }
    const text = await res.text();
    if (text.includes('"ok":false')) {
      console.error(`ENQUIRY_SHEET_FAILED [${tenant.slug}] rejected: ${text}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`ENQUIRY_SHEET_ERROR [${tenant.slug}]`, err);
    return false;
  }
}

async function sendEmail(
  tenant: Tenant,
  payload: EnquiryPayload,
  receivedAt: string
): Promise<CaptureResult> {
  const to = tenant.enquiry.toEmail || tenant.contact.email;
  if (!to || !resend || !process.env.RESEND_API_KEY) return null;

  const from = process.env.RESEND_FROM || "enquiries@pawsites.co.uk";
  const subjectLine = (payload.subject || `${tenant.businessName} enquiry`).trim();
  const channelNote =
    payload.channel === "whatsapp"
      ? "⚠️ This enquiry was submitted via the WhatsApp option. The customer was handed off to WhatsApp but may NOT have pressed send there — treat this email as their full enquiry and follow up.\n\n"
      : "";

  try {
    const result = await resend.emails.send({
      from,
      to,
      subject: subjectLine,
      text: `${channelNote}${payload.message || ""}`,
      reply_to: payload.email ? [payload.email] : undefined,
    });
    if (result.error) {
      console.error(`ENQUIRY_EMAIL_FAILED [${tenant.slug}]`, result.error);
      return false;
    }
    console.log(`ENQUIRY_EMAILED ${JSON.stringify({ tenant: tenant.slug, receivedAt, id: result.data?.id || null })}`);
    return true;
  } catch (err) {
    console.error(`ENQUIRY_EMAIL_ERROR [${tenant.slug}]`, err);
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const data = (await request.json()) as EnquiryPayload;
    const { subject, message } = data || {};
    if (!subject || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const tenant =
      (data.tenant ? await getTenantBySlug(data.tenant) : null) ||
      (await getTenantByHost(request.headers.get("host"))) ||
      (await getDefaultTenant());

    const receivedAt = new Date().toISOString();
    console.log(
      "ENQUIRY_RECEIVED " +
        JSON.stringify({
          tenant: tenant.slug,
          receivedAt,
          channel: data.channel || "email",
          name: data.name || null,
          email: data.email || null,
          phone: data.phone || null,
        })
    );

    const [emailed, sheeted] = await Promise.all([
      sendEmail(tenant, data, receivedAt),
      appendToSheet(tenant, data, receivedAt),
    ]);

    const results: CaptureResult[] = [emailed, sheeted];
    const anyAttempted = results.some((r) => r !== null);
    const anySucceeded = results.some((r) => r === true);

    // If no transport is configured (e.g. free-tier WhatsApp-only tenant), the
    // lead is captured by the log above and delivered via WhatsApp — treat as ok.
    if (!anyAttempted) {
      console.log(`ENQUIRY_LOGGED_ONLY [${tenant.slug}] no email/sheet configured (WhatsApp lead).`);
      return NextResponse.json({ ok: true, capture: { emailed, sheeted } });
    }

    if (!anySucceeded) {
      console.error(`ENQUIRY_CAPTURE_FAILED [${tenant.slug}] ${JSON.stringify({ emailed, sheeted })}`);
      return NextResponse.json({ error: "Failed to record enquiry" }, { status: 500 });
    }

    if (results.some((r) => r === false)) {
      console.warn(`ENQUIRY_PARTIAL_CAPTURE [${tenant.slug}] ${JSON.stringify({ emailed, sheeted })}`);
    }

    return NextResponse.json({ ok: true, capture: { emailed, sheeted } });
  } catch (error) {
    console.error("ENQUIRY_ERROR — unexpected failure:", error);
    return NextResponse.json({ error: "Failed to record enquiry" }, { status: 500 });
  }
}
