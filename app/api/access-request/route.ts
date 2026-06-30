import { NextResponse } from "next/server";
import { Resend } from "resend";

/**
 * "Request a Pawsites site" leads from the marketing landing page
 * (components/marketing/request-access.tsx). Emails the operator via Resend
 * when configured; always logs so a lead is never lost even without email set
 * up. The form treats any 2xx as success.
 */

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

type AccessRequest = {
  plan?: string;
  name?: string;
  email?: string;
  business?: string;
  subdomain?: string;
  message?: string;
};

const PLAN_LABEL: Record<string, string> = {
  basic: "Basic (£4.99/mo)",
  plus: "Plus (£5.99/mo)",
};

const OPERATOR_EMAIL = process.env.OPERATOR_EMAIL || "contact@happyathomepets.co.uk";

export async function POST(request: Request) {
  try {
    const data = (await request.json()) as AccessRequest;
    const name = data.name?.trim();
    const email = data.email?.trim();

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    const receivedAt = new Date().toISOString();
    const planKey = data.plan?.trim().toLowerCase();
    const lead = {
      receivedAt,
      plan: planKey ? PLAN_LABEL[planKey] ?? planKey : null,
      name,
      email,
      business: data.business?.trim() || null,
      subdomain: data.subdomain?.trim() || null,
      message: data.message?.trim() || null,
    };
    console.log("ACCESS_REQUEST " + JSON.stringify(lead));

    if (resend && process.env.RESEND_API_KEY) {
      const from = process.env.RESEND_FROM || "enquiries@pawsites.co.uk";
      const lines = [
        `New Pawsites access request`,
        ``,
        `Plan:      ${lead.plan ?? "—"}`,
        `Name:      ${lead.name}`,
        `Email:     ${lead.email}`,
        `Business:  ${lead.business ?? "—"}`,
        `Subdomain: ${lead.subdomain ? `${lead.subdomain}.pawsites.co.uk` : "—"}`,
        ``,
        `Message:`,
        lead.message ?? "—",
        ``,
        `Received: ${receivedAt}`,
      ];
      const result = await resend.emails.send({
        from,
        to: OPERATOR_EMAIL,
        subject: `Pawsites signup — ${lead.name}${lead.business ? ` (${lead.business})` : ""}`,
        text: lines.join("\n"),
        reply_to: [lead.email],
      });
      if (result.error) {
        // The lead is already logged above; surface a soft failure but don't 500.
        console.error("ACCESS_REQUEST_EMAIL_FAILED", result.error);
      } else {
        console.log(`ACCESS_REQUEST_EMAILED ${JSON.stringify({ id: result.data?.id || null })}`);
      }
    } else {
      console.log("ACCESS_REQUEST_LOGGED_ONLY — RESEND_API_KEY not configured.");
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("ACCESS_REQUEST_ERROR — unexpected failure:", error);
    return NextResponse.json({ error: "Failed to submit request" }, { status: 500 });
  }
}
