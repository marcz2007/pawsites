"use client";

import { AvailabilityCalendar } from "@/components/availability-calendar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  getActiveDiscount,
  getActiveExtraPetDiscount,
  getActiveWalkDiscount,
  type SupervisionLevel,
} from "@/lib/pricing";
import { emailEnabled, type Tenant } from "@/lib/tenant/types";
import { differenceInCalendarDays, isSaturday, parseISO } from "date-fns";
import { CheckCircle2, Copy, Mail, Smartphone, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type Channel = "email" | "whatsapp";

export function Pricing({ tenant }: { tenant: Tenant }) {
  const P = tenant.pricing;
  const cur = P.currency;
  const formatCurrency = (value: number) => `${cur}${value.toFixed(2)}`;
  const businessWhatsapp = tenant.contact.whatsapp;
  const canEmail = emailEnabled(tenant);

  const today = useMemo(() => new Date(), []);
  const defaultEnd = useMemo(() => new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000), [today]);
  const [startDate, setStartDate] = useState(today.toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(defaultEnd.toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState("12:00");
  const [endTime, setEndTime] = useState("12:00");
  const [walksPerDay, setWalksPerDay] = useState(0);
  const [petCount, setPetCount] = useState(1);
  const [supervision, setSupervision] = useState<SupervisionLevel>("standard");
  const [copied, setCopied] = useState(false);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [customEdited, setCustomEdited] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<"idle" | "success" | "error">("idle");
  const [channel, setChannel] = useState<Channel>(canEmail ? "email" : "whatsapp");

  // Which optional add-ons this tenant offers (adapts the UI per business).
  const offersWalks = P.addOns.walkPerDay > 0;
  const offersExtraPet = P.addOns.extraPetPerNight > 0;
  const offersSupervision = P.addOns.constantSupervisionPerNight > 0;

  const timeStringToMinutes = (time: string | undefined) => {
    if (!time || !time.includes(":")) return null;
    const [h, m] = time.split(":").map((val) => Number(val));
    if (Number.isNaN(h) || Number.isNaN(m)) return null;
    return h * 60 + m;
  };

  const nights = useMemo(() => {
    try {
      if (!startDate || !endDate) return 4;
      const diff = differenceInCalendarDays(parseISO(endDate), parseISO(startDate));
      return Math.max(1, diff);
    } catch {
      return 4;
    }
  }, [startDate, endDate]);

  const activeDiscount = useMemo(() => getActiveDiscount(P, nights), [P, nights]);
  const discountMultiplier = activeDiscount ? 1 - activeDiscount.percentOff / 100 : 1;
  const isDiscounted = Boolean(activeDiscount);
  const nightlyRate = P.nightly.baseStandard * discountMultiplier;

  const activeWalkDiscount = useMemo(() => getActiveWalkDiscount(P, nights), [P, nights]);
  const walkBaseRate = P.addOns.walkPerDay;
  const walkDiscountedRate = activeWalkDiscount
    ? walkBaseRate * (1 - activeWalkDiscount.percentOff / 100)
    : walkBaseRate;
  const walkCostPerDay = useMemo(() => {
    if (walksPerDay === 0) return 0;
    if (!activeWalkDiscount) return walksPerDay * walkBaseRate;
    const maxDiscounted = activeWalkDiscount.maxWalksDiscounted ?? walksPerDay;
    const discountedWalks = Math.min(walksPerDay, maxDiscounted);
    const fullPriceWalks = Math.max(0, walksPerDay - maxDiscounted);
    return discountedWalks * walkDiscountedRate + fullPriceWalks * walkBaseRate;
  }, [walksPerDay, activeWalkDiscount, walkBaseRate, walkDiscountedRate]);
  const walkCostTotal = walkCostPerDay * nights;

  const activeExtraPetDiscount = useMemo(() => getActiveExtraPetDiscount(P, nights), [P, nights]);
  const perExtraPetRate = activeExtraPetDiscount
    ? P.addOns.extraPetPerNight * (1 - activeExtraPetDiscount.percentOff / 100)
    : P.addOns.extraPetPerNight;
  const supervisionRate = P.addOns.constantSupervisionPerNight;

  const hourlyAddon = useMemo(() => {
    const middayMinutes = P.timings.middayHour * 60;
    const startMinutes = timeStringToMinutes(startTime) ?? middayMinutes;
    const endMinutes = timeStringToMinutes(endTime) ?? middayMinutes;
    const before = Math.max(0, middayMinutes - startMinutes);
    const after = Math.max(0, endMinutes - middayMinutes);
    const hoursBefore = before === 0 ? 0 : Math.ceil(before / 60);
    const hoursAfter = after === 0 ? 0 : Math.ceil(after / 60);
    return (hoursBefore + hoursAfter) * P.addOns.hourlyOverage;
  }, [startTime, endTime, P]);

  const earlyStartFee = useMemo(() => {
    const startMinutes = timeStringToMinutes(startTime);
    const cutoffMinutes = P.timings.earlyStartCutoffHour * 60;
    return startMinutes !== null && startMinutes < cutoffMinutes ? P.addOns.earlyStartFlat : 0;
  }, [startTime, P]);

  const saturdayEndFee = useMemo(() => {
    if (!endDate) return 0;
    try {
      return isSaturday(parseISO(endDate)) ? P.addOns.saturdayEndFlat : 0;
    } catch {
      return 0;
    }
  }, [endDate, P]);

  const timingExtras = hourlyAddon + earlyStartFee + saturdayEndFee;

  const estimate = useMemo(() => {
    if (supervision === "special") return null;
    const base = nightlyRate * nights;
    const extraPets = petCount > 1 ? perExtraPetRate * (petCount - 1) * nights : 0;
    const supervisionCost = supervision === "constant" ? supervisionRate * nights : 0;
    return base + walkCostTotal + extraPets + supervisionCost + timingExtras;
  }, [nightlyRate, nights, petCount, supervision, perExtraPetRate, supervisionRate, walkCostTotal, timingExtras]);

  const supervisionLabel =
    supervision === "standard"
      ? "Can be left alone 3+ hours"
      : supervision === "constant"
      ? "Requires near-constant supervision (<2 hours alone)"
      : "Special care case";

  const plainMessage = [
    `👋 Hi ${tenant.businessName}!`,
    `I'm looking for pet care for ${nights} night${nights === 1 ? "" : "s"}.`,
    `My dates: ${startDate || "TBC"} ${startTime || "TBC"} to ${endDate || "TBC"} ${endTime || "TBC"}.`,
    `${offersWalks ? `${walksPerDay} walk${walksPerDay === 1 ? "" : "s"} a day, ` : ""}${petCount} pet${petCount === 1 ? "" : "s"}, can be left alone for: ${supervisionLabel}.`,
    ...(saturdayEndFee > 0
      ? [`Saturday end-date surcharge included: ${formatCurrency(P.addOns.saturdayEndFlat)} (reflected in the total below).`]
      : []),
    "",
    estimate
      ? `Estimated total for the stay (rough): ${formatCurrency(estimate)}`
      : "This looks like a special-care case — happy to agree a fixed price together.",
  ].join("\n");

  const composedMessage = [
    customEdited ? customMessage : plainMessage,
    "",
    "Contact details:",
    `Name: ${name}`,
    `Email: ${email || "N/A"}`,
    `Phone: ${phone || "N/A"}`,
    `Address: ${address}`,
  ].join("\n");

  useEffect(() => {
    if (!customEdited) setCustomMessage(plainMessage);
  }, [plainMessage, customEdited]);

  const copyMessage = async () => {
    setCopied(false);
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(composedMessage);
      setCopied(true);
      return;
    }
    if (messageRef.current) {
      messageRef.current.select();
      document.execCommand("copy");
      setCopied(true);
    }
  };

  const submit = async () => {
    setSending(true);
    setSendStatus("idle");

    // Open a placeholder tab synchronously for WhatsApp so the popup isn't
    // blocked; we only navigate it after the backend captures the lead.
    let waWindow: Window | null = null;
    if (channel === "whatsapp") waWindow = window.open("", "_blank");

    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenant: tenant.slug,
          name,
          email,
          phone,
          address,
          channel,
          subject:
            channel === "whatsapp"
              ? `${tenant.businessName} enquiry (via WhatsApp)`
              : `${tenant.businessName} enquiry`,
          message: composedMessage,
        }),
      });
      if (!res.ok) throw new Error(`Send failed (${res.status})`);

      if (channel === "whatsapp" && businessWhatsapp) {
        const waUrl = `https://wa.me/${businessWhatsapp}?text=${encodeURIComponent(composedMessage)}`;
        if (waWindow) waWindow.location.href = waUrl;
        else window.open(waUrl, "_blank");
      }
      setSendStatus("success");
    } catch (err) {
      if (waWindow) waWindow.close();
      console.error("Enquiry submission failed:", err);
      setSendStatus("error");
    } finally {
      setSending(false);
    }
  };

  const submitDisabled =
    sending || !name || !address || (channel === "email" && !email) || (channel === "whatsapp" && !phone);

  return (
    <section id="pricing" className="py-20 md:py-28 bg-[#f8f3e8]">
      <div className="container px-4 md:px-6 max-w-6xl mx-auto space-y-10">
        <div className="text-center space-y-3">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-balance">
            Request your quote
          </h2>
          <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
            Pick your dates, see the estimated total (with long-stay discounts), and send your
            enquiry to confirm availability.
          </p>
        </div>

        {/* Option cards (only those this business offers) */}
        <div className="grid lg:grid-cols-4 gap-4">
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-primary">Base nightly rate</p>
              {isDiscounted ? (
                <span className="rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold px-3 py-1">
                  {activeDiscount?.percentOff}% off ({activeDiscount?.minNights}+ nights)
                </span>
              ) : null}
            </div>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold">{formatCurrency(nightlyRate)}</p>
              {isDiscounted ? (
                <p className="text-sm text-muted-foreground line-through">
                  {formatCurrency(P.nightly.baseStandard)}
                </p>
              ) : null}
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-1 gap-3">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Start date</label>
                <div className="grid grid-cols-[1fr,auto] gap-2">
                  <input type="date" value={startDate} min={today.toISOString().slice(0, 10)} onChange={(e) => setStartDate(e.target.value)} className="rounded-md border border-border bg-background px-3 py-2 text-base" />
                  <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="rounded-md border border-border bg-background px-3 py-2 text-base max-w-[120px]" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">End date</label>
                <div className="grid grid-cols-[1fr,auto] gap-2">
                  <input type="date" value={endDate} min={startDate || today.toISOString().slice(0, 10)} onChange={(e) => setEndDate(e.target.value)} className="rounded-md border border-border bg-background px-3 py-2 text-base" />
                  <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="rounded-md border border-border bg-background px-3 py-2 text-base max-w-[120px]" />
                </div>
              </div>
            </div>
          </Card>

          {offersWalks ? (
            <Card className="p-6 space-y-4">
              <p className="text-sm font-medium text-primary">Walks per day</p>
              <p className="text-3xl font-bold">
                {walksPerDay > 0 ? `+${formatCurrency(walkCostPerDay)}` : `+${cur}0.00`}
                {walksPerDay > 0 ? <span className="text-sm font-normal ml-1">/day</span> : null}
              </p>
              <div className="grid grid-cols-5 gap-2">
                {[0, 1, 2, 3, 4].map((w) => (
                  <button key={w} type="button" onClick={() => setWalksPerDay(w)} className={`rounded-lg border px-2 py-2 text-sm font-medium transition-colors ${walksPerDay === w ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-accent"}`}>
                    {w}
                  </button>
                ))}
              </div>
            </Card>
          ) : null}

          {offersExtraPet ? (
            <Card className="p-6 space-y-4">
              <p className="text-sm font-medium text-primary">Number of pets</p>
              <p className="text-3xl font-bold">
                {petCount > 1 ? `+${formatCurrency(perExtraPetRate * (petCount - 1))}` : `+${cur}0.00`}
                {petCount > 1 ? <span className="text-sm font-normal ml-1">/night</span> : null}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((p) => (
                  <button key={p} type="button" onClick={() => setPetCount(p)} className={`rounded-lg border px-2 py-2 text-sm font-medium transition-colors ${petCount === p ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-accent"}`}>
                    {p === 1 ? "1 pet" : `${p} pets`}
                  </button>
                ))}
              </div>
            </Card>
          ) : null}

          {offersSupervision ? (
            <Card className="p-6 space-y-4">
              <p className="text-sm font-medium text-primary">Supervision</p>
              <p className="text-3xl font-bold">
                {supervision === "constant" ? `+${formatCurrency(supervisionRate)}` : `${cur}0.00`}
              </p>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { key: "standard", label: "Can be left 3+ hours (no extra)" },
                  { key: "constant", label: `Needs near-constant presence (+${formatCurrency(supervisionRate)}/night)` },
                  { key: "special", label: "Special care — custom quote" },
                ].map((option) => (
                  <button key={option.key} type="button" onClick={() => setSupervision(option.key as SupervisionLevel)} className={`rounded-lg border px-3 py-2 text-left text-sm font-medium transition-colors ${supervision === option.key ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-accent"}`}>
                    {option.label}
                  </button>
                ))}
              </div>
            </Card>
          ) : null}
        </div>

        {/* Estimate + enquiry */}
        <Card className="p-6 md:p-8 space-y-6">
          <div className="grid md:grid-cols-[1fr,1.2fr] gap-6">
            <div className="space-y-2 max-w-md">
              <p className="text-sm text-muted-foreground">Estimated total for this stay</p>
              <p className="text-4xl font-bold">
                {estimate ? `~${formatCurrency(estimate)}` : "Let's agree a custom rate together"}
              </p>
              <p className="text-sm text-muted-foreground">
                Rough estimate only. Longer bookings often receive reduced nightly rates.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Enquiry text</p>
                {copied ? <span className="text-xs text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full">Copied</span> : null}
              </div>
              <textarea
                ref={messageRef}
                value={customEdited ? customMessage : plainMessage}
                className="w-full h-44 rounded-lg border border-border bg-background px-3 py-2 text-sm leading-6"
                onFocus={() => setCustomEdited(true)}
                onChange={(e) => {
                  setCustomEdited(true);
                  setCustomMessage(e.target.value);
                }}
              />
              <div className="flex flex-wrap gap-3">
                <Button onClick={submit} size="sm" className="gap-2" disabled={submitDisabled}>
                  {channel === "email" ? <Mail className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
                  {sending ? "Sending..." : channel === "email" ? "Send via email" : "Send via WhatsApp"}
                </Button>
                <Button onClick={copyMessage} size="sm" variant="outline" className="gap-2">
                  <Copy className="w-4 h-4" />
                  {copied ? "Copied" : "Copy text"}
                </Button>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                {channel === "whatsapp" ? (
                  <p>
                    We'll record your enquiry first, then open WhatsApp with your message ready.{" "}
                    <strong>You still need to press send inside WhatsApp</strong> — but we've received your details either way.
                  </p>
                ) : (
                  <p>Send directly by email, or copy the text to paste into email/WhatsApp.</p>
                )}
                {sendStatus === "error" ? (
                  <p className="text-red-600">
                    Could not record your enquiry right now. Please copy the text above and send it
                    manually{tenant.contact.email ? ` to ${tenant.contact.email}` : ""}.
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          {/* Channel + contact fields */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Preferred channel</p>
              <div className="flex items-center gap-3">
                {(canEmail ? (["email", "whatsapp"] as Channel[]) : (["whatsapp"] as Channel[])).map((key) => (
                  <button key={key} type="button" onClick={() => setChannel(key)} className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${channel === key ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-accent"}`}>
                    {key === "email" ? "Email" : "WhatsApp"}
                  </button>
                ))}
              </div>
              {!canEmail ? (
                <p className="text-xs text-muted-foreground">This business takes enquiries via WhatsApp.</p>
              ) : null}
            </div>

            <label className="space-y-1">
              <span className="text-sm font-medium">Your name *</span>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" placeholder="Your name" />
            </label>
            {canEmail ? (
              <label className="space-y-1">
                <span className="text-sm font-medium">Email {channel === "email" ? "*" : "(optional)"}</span>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" placeholder="you@example.com" />
              </label>
            ) : null}
            <label className="space-y-1">
              <span className="text-sm font-medium">Phone {channel === "whatsapp" ? "*" : "(optional)"}</span>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" placeholder="Your number" />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium">Address *</span>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" placeholder="Your address" />
            </label>
          </div>
        </Card>

        <div id="calendar">
          <h3 className="text-xl font-semibold mb-4">Availability calendar</h3>
          <AvailabilityCalendar tenantSlug={tenant.slug} whatsapp={businessWhatsapp} />
        </div>
      </div>

      {/* Success modal */}
      {sendStatus === "success" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSendStatus("idle")}>
          <div className="relative bg-background rounded-2xl shadow-xl max-w-md w-full p-8 space-y-6" onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => setSendStatus("idle")} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground" aria-label="Close modal">
              <X className="w-5 h-5" />
            </button>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="rounded-full bg-emerald-100 p-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold">We've received your request!</h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                Nice one! 🎉 We've got your details and we'll get back to you within 24 hours
                (usually a lot sooner). We look forward to chatting with you!
              </p>
              {channel === "whatsapp" ? (
                <p className="text-base font-medium text-emerald-700 leading-relaxed">
                  💬 We've also opened WhatsApp with your message ready — press <strong>send</strong>{" "}
                  there to chat directly. (Either way, your enquiry is already with us.)
                </p>
              ) : null}
              <Button onClick={() => setSendStatus("idle")} className="mt-4 w-full">Got it, thanks!</Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
