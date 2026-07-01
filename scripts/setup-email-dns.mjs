#!/usr/bin/env node
/**
 * Automate the pawsites.co.uk email setup — the same shape as happyathomepets:
 *   • Resend   → outbound sending (DKIM + send-subdomain SPF/MX, region eu-west-1)
 *   • ImprovMX → inbound forwarding for hello@  (apex MX + SPF)
 *   • Vercel   → authoritative DNS for the domain (every record is written here)
 *
 * It is IDEMPOTENT (skips records that already exist) and DRY-RUN by default —
 * pass --apply to actually create anything.
 *
 * Usage:
 *   VERCEL_TOKEN=...  RESEND_API_KEY=...  IMPROVMX_TOKEN=...  FORWARD_TO=you@gmail.com \
 *   [VERCEL_TEAM_ID=team_xxx] [DOMAIN=pawsites.co.uk] [REGION=eu-west-1] \
 *   node scripts/setup-email-dns.mjs            # dry run — shows the plan
 *   node scripts/setup-email-dns.mjs --apply    # actually do it
 *
 * Get the tokens once:
 *   VERCEL_TOKEN   → vercel.com/account/tokens   (VERCEL_TEAM_ID only if the domain is on a team)
 *   RESEND_API_KEY → resend.com/api-keys         (the same key already used by the app)
 *   IMPROVMX_TOKEN → improvmx.com → Account → API
 */

const APPLY = process.argv.includes("--apply");
const DOMAIN = process.env.DOMAIN || "pawsites.co.uk";
const REGION = process.env.REGION || "eu-west-1";
const FORWARD_TO = process.env.FORWARD_TO;
const ALIAS = process.env.ALIAS || "hello";

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const IMPROVMX_TOKEN = process.env.IMPROVMX_TOKEN;

const teamQS = VERCEL_TEAM_ID ? `?teamId=${VERCEL_TEAM_ID}` : "";

function die(msg) {
  console.error(`\n✖ ${msg}\n`);
  process.exit(1);
}
function log(msg) {
  console.log(msg);
}

if (!VERCEL_TOKEN) die("VERCEL_TOKEN is required (vercel.com/account/tokens).");
if (!RESEND_API_KEY) die("RESEND_API_KEY is required (resend.com/api-keys).");

// Inbound forwarding (ImprovMX) is optional — supply BOTH IMPROVMX_TOKEN and
// FORWARD_TO to set up hello@ forwarding, or omit them to do sending only.
const DO_FORWARDING = Boolean(IMPROVMX_TOKEN && FORWARD_TO);
if ((IMPROVMX_TOKEN && !FORWARD_TO) || (!IMPROVMX_TOKEN && FORWARD_TO)) {
  die("For forwarding, set BOTH IMPROVMX_TOKEN and FORWARD_TO — or neither (sending only).");
}

async function api(url, { method = "GET", headers = {}, body } = {}) {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json", ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }
  return { ok: res.ok, status: res.status, json };
}

const vercelHeaders = { Authorization: `Bearer ${VERCEL_TOKEN}` };
const resendHeaders = { Authorization: `Bearer ${RESEND_API_KEY}` };
const improvmxHeaders = {
  Authorization: `Basic ${Buffer.from(`api:${IMPROVMX_TOKEN}`).toString("base64")}`,
};

/** Turn a Resend FQDN (send.pawsites.co.uk) into a Vercel relative name (send); apex -> "". */
function relativeName(fqdn) {
  const n = fqdn.replace(/\.$/, "");
  if (n === DOMAIN) return "";
  if (n.endsWith(`.${DOMAIN}`)) return n.slice(0, -(DOMAIN.length + 1));
  return n; // already relative
}

// --------------------------------------------------------------- Vercel DNS

let _existing = null;
async function existingRecords() {
  if (_existing) return _existing;
  const { ok, json } = await api(
    `https://api.vercel.com/v4/domains/${DOMAIN}/records${teamQS}`,
    { headers: vercelHeaders }
  );
  if (!ok) die(`Could not list Vercel DNS records: ${JSON.stringify(json)}`);
  _existing = json.records || [];
  return _existing;
}

function recordExists(records, { type, name, value }) {
  const norm = (s) => (s || "").replace(/\s+/g, " ").trim().toLowerCase();
  return records.some(
    (r) => r.type === type && (r.name || "") === name && norm(r.value) === norm(value)
  );
}

async function addVercelRecord(rec) {
  const records = await existingRecords();
  const label = `${rec.type} ${rec.name || "@"} → ${rec.value}${rec.mxPriority != null ? ` (prio ${rec.mxPriority})` : ""}`;

  if (recordExists(records, rec)) {
    log(`   = exists, skip   ${label}`);
    return;
  }
  // Guard against a second SPF at the same name.
  if (rec.type === "TXT" && /^v=spf1/i.test(rec.value)) {
    const spfClash = records.find(
      (r) => r.type === "TXT" && (r.name || "") === rec.name && /^"?v=spf1/i.test(r.value)
    );
    if (spfClash) {
      log(`   ! SPF already present at "${rec.name || "@"}" — leaving it. Existing: ${spfClash.value}`);
      return;
    }
  }

  if (!APPLY) {
    log(`   + would add      ${label}`);
    return;
  }
  // Resend returns ttl as "Auto" (a string); Vercel needs a number ≥ 60.
  const ttlNum = Number(rec.ttl);
  const ttl = Number.isFinite(ttlNum) && ttlNum >= 60 ? ttlNum : 60;
  const body = { type: rec.type, name: rec.name, value: rec.value, ttl };
  if (rec.type === "MX") body.mxPriority = rec.mxPriority;
  const { ok, json } = await api(
    `https://api.vercel.com/v2/domains/${DOMAIN}/records${teamQS}`,
    { method: "POST", headers: vercelHeaders, body }
  );
  if (!ok) die(`Failed to add ${label}: ${JSON.stringify(json)}`);
  _existing.push({ type: rec.type, name: rec.name, value: rec.value });
  log(`   ✓ added          ${label}`);
}

// ------------------------------------------------------------------- Resend

async function resendDomain() {
  const list = await api("https://api.resend.com/domains", { headers: resendHeaders });
  const found = (list.json.data || []).find((d) => d.name === DOMAIN);
  if (found) {
    const detail = await api(`https://api.resend.com/domains/${found.id}`, {
      headers: resendHeaders,
    });
    log(`   • Resend domain exists (status: ${detail.json.status})`);
    return detail.json;
  }
  if (!APPLY) {
    log(`   + would create Resend domain ${DOMAIN} (region ${REGION}) and read back its DNS records`);
    return null;
  }
  const created = await api("https://api.resend.com/domains", {
    method: "POST",
    headers: resendHeaders,
    body: { name: DOMAIN, region: REGION },
  });
  if (!created.ok) die(`Failed to create Resend domain: ${JSON.stringify(created.json)}`);
  log(`   ✓ created Resend domain ${DOMAIN}`);
  return created.json;
}

async function resendVerify(id) {
  if (!APPLY || !id) return;
  const { ok, json } = await api(`https://api.resend.com/domains/${id}/verify`, {
    method: "POST",
    headers: resendHeaders,
  });
  log(ok ? "   ✓ asked Resend to verify (DNS may take a few minutes)" : `   ! verify call: ${JSON.stringify(json)}`);
}

// ----------------------------------------------------------------- ImprovMX

async function improvmxSetup() {
  // Create the domain (ignore "already exists").
  if (APPLY) {
    const created = await api("https://api.improvmx.com/v3/domains/", {
      method: "POST",
      headers: improvmxHeaders,
      body: { domain: DOMAIN },
    });
    if (created.ok) log(`   ✓ ImprovMX domain added`);
    else if (/already/i.test(JSON.stringify(created.json))) log(`   • ImprovMX domain already added`);
    else die(`ImprovMX add-domain failed: ${JSON.stringify(created.json)}`);

    const alias = await api(`https://api.improvmx.com/v3/domains/${DOMAIN}/aliases/`, {
      method: "POST",
      headers: improvmxHeaders,
      body: { alias: ALIAS, forward: FORWARD_TO },
    });
    if (alias.ok) log(`   ✓ alias ${ALIAS}@${DOMAIN} → ${FORWARD_TO}`);
    else if (/already/i.test(JSON.stringify(alias.json))) log(`   • alias ${ALIAS}@ already exists`);
    else log(`   ! alias create: ${JSON.stringify(alias.json)}`);
  } else {
    log(`   + would add ImprovMX domain + alias ${ALIAS}@${DOMAIN} → ${FORWARD_TO}`);
  }
}

// ---------------------------------------------------------------------- main

async function main() {
  log(`\nEmail setup for ${DOMAIN}  —  ${APPLY ? "APPLY (writing changes)" : "DRY RUN (no changes)"}\n`);

  log("1) Resend (outbound sending)");
  const domain = await resendDomain();
  if (domain?.records?.length) {
    for (const r of domain.records) {
      await addVercelRecord({
        type: r.type,
        name: relativeName(r.name),
        value: r.value,
        mxPriority: r.priority,
        ttl: r.ttl,
      });
    }
  } else if (domain) {
    log("   ! Resend returned no records to add (already verified?).");
  }

  if (DO_FORWARDING) {
    log("\n2) ImprovMX (inbound forwarding for hello@)");
    await improvmxSetup();
    for (const rec of [
      { type: "MX", name: "", value: "mx1.improvmx.com", mxPriority: 10 },
      { type: "MX", name: "", value: "mx2.improvmx.com", mxPriority: 20 },
      { type: "TXT", name: "", value: "v=spf1 include:spf.improvmx.com ~all" },
    ]) {
      await addVercelRecord(rec);
    }
  } else {
    log("\n2) ImprovMX (inbound forwarding) — SKIPPED (no IMPROVMX_TOKEN/FORWARD_TO). Sending only.");
  }

  log("\n3) Verify");
  await resendVerify(domain?.id);

  const opEmail = DO_FORWARDING ? `${ALIAS}@${DOMAIN}` : "your inbox";
  log(
    APPLY
      ? `\n✓ Done. Check the Resend${DO_FORWARDING ? " + ImprovMX" : ""} dashboard in a few minutes for verified status.\n  Then set RESEND_FROM=enquiries@${DOMAIN}${DO_FORWARDING ? ` and OPERATOR_EMAIL=${opEmail}` : ""} in Vercel.\n`
      : `\nDry run complete — no changes made. Re-run with --apply to do it for real.\n`
  );
}

main().catch((e) => die(e?.stack || String(e)));
