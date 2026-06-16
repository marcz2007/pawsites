import type { Tenant } from "@/lib/tenant/types";

/**
 * Seed tenants. These stand in for database rows until Supabase is wired up
 * (see supabase/migrations/0001_init.sql + SETUP.md). The store layer
 * (lib/tenant/store.ts) is the only thing that reads this, so replacing it
 * with a DB query later touches nothing else.
 *
 * Tenant #1 (happyathomepets) is the real first customer — Marcus's own
 * business — on the paid "plus" tier (email enquiries enabled).
 * Tenant #2 (pawsandstay) is a demo home-boarding business on the "free" tier
 * (WhatsApp only) to prove the template varies per tenant and gates by tier.
 */

const happyAtHomePets: Tenant = {
  slug: "happyathomepets",
  status: "active",
  tier: "plus",
  businessName: "Happy at Home Pets",
  founderName: "Marcus Watts",
  tagline: "Fully insured live-in pet sitting in London",
  locationLabel: "London",
  branding: {
    primary: "oklch(0.55 0.13 152)",
    logoSrc: "/logo.svg",
  },
  contact: {
    email: "contact@happyathomepets.co.uk",
    phone: "07804 377261",
    whatsapp: "447804377261",
    responseTime: "Usually within 30 minutes",
  },
  enquiry: {
    toEmail: "contact@happyathomepets.co.uk",
    // sheetWebhookUrl is read from env per-tenant in production; left undefined here.
  },
  hero: {
    priceFromLabel: "From £25 a night",
    ctaPrimaryLabel: "Get an Instant Quote",
    ctaSecondaryLabel: "Check Availability",
    trustBadges: [
      { icon: "ShieldCheck", label: "Fully insured" },
      { icon: "ShieldCheck", label: "DBS checked" },
      { icon: "Clock", label: "24/7 care for dogs & cats" },
    ],
    blurb:
      "Founder-led, fully insured and DBS-checked with 20+ years' pet care experience. Overnight live-in care. No kennels. No stress. Your pets stay happy at home.",
  },
  about: {
    heading: "Live-In Care: The Best Choice for Your Pets",
    paragraphs: [
      "At Happy at Home Pets, we provide fully insured, professional, live-in pet sitting so your dogs and cats remain calm in their familiar environment — no kennels, no stress, just happy pets in their own space.",
      "We specialise in sits of two nights or longer and regularly care for pets with special needs, including medication administration and anxiety-aware routines. Because we work remotely on site, your pets enjoy a genuinely consistent presence.",
      "Founded and operated by Marcus Watts, Happy at Home brings veterinary-adjacent experience alongside years of trusted sits across London and abroad — from lively Labradors in Seville to farm animals and horses on expeditions in Argentina.",
      "We treat your home with the utmost respect — security-conscious, tidy, and thoughtful. Plants watered, post collected, updates sent. Calm pets, a cared-for home, and peace of mind while you're away.",
    ],
    imageSrc: "/marcus-with-dog.jpg",
    features: [
      {
        icon: "Home",
        title: "No Stress for Your Pet",
        description:
          "We keep your pets in their own home with familiar routines, toys and comfort zones.",
      },
      {
        icon: "ShieldCheck",
        title: "Fully Insured",
        description:
          "Fully insured, so you are protected and never left in a difficult position.",
      },
      {
        icon: "Shield",
        title: "Clean & Trustworthy",
        description:
          "Background-checked and committed to maintaining your home's cleanliness and security.",
      },
      {
        icon: "Sparkles",
        title: "Home Security Included",
        description:
          "Your home stays occupied and cared for. We water plants, collect mail and keep a lived-in appearance.",
      },
      {
        icon: "Heart",
        title: "24/7 Companionship",
        description:
          "Round-the-clock care means your pets are never alone and always have someone to comfort them.",
      },
      {
        icon: "Clock",
        title: "Great with Anxious/Rescue Dogs",
        description:
          "Specialised, patient care for pets with anxiety or extra needs — gentle routines and consistent presence.",
      },
    ],
  },
  reviews: {
    heading: "What Pet Parents Say",
    subheading:
      "Don't just take our word for it — here's what happy pet owners have to say about their experience.",
    source: "rover",
    items: [
      {
        name: "Caitlin C.",
        initials: "CC",
        date: "Oct 20, 2025",
        rating: 5,
        text: "Marcus was so kind and patient with both Zoe & me. He came out of his way to do a meet & greet and talk with us first, which is so important when someone's staying in your home. Zoe was really comfortable and happy with him, and he left my apartment clean. Would definitely work with him again!",
      },
      {
        name: "Nina R.",
        initials: "NR",
        date: "Oct 02, 2025",
        rating: 5,
        text: "Marcus was professional and caring from the start. We received daily communication with photos and returned to a very calm, happy Elsa and an immaculate house. I thoroughly recommend Marcus — mature and capable.",
      },
      {
        name: "Katie H.",
        initials: "KH",
        date: "Oct 23, 2025",
        rating: 5,
        text: "Perfect first sitter experience! Brilliant communication, kept me updated and sent pictures, and left the flat nice and tidy. Will defo hire again.",
      },
      {
        name: "Karolina O.",
        initials: "KO",
        date: "Sep 23, 2025",
        rating: 5,
        text: "Marcus stayed with our dog for about a week in London and did an amazing job. Our dog has a bit of separation anxiety which Marcus managed really well. The apartment looked better than when we left it!",
      },
      {
        name: "Shyra S.",
        initials: "SS",
        date: "Jun 20, 2025",
        rating: 5,
        text: "Excellent care for our dog while we were away. Punctual, reliable, and professional. Gracielo was well looked after and returned home calm and content.",
      },
      {
        name: "Helen G.",
        initials: "HG",
        date: "Sep 09, 2025",
        rating: 5,
        text: "A repeat booking — Marcus does a great job looking after our dog Maisie who has separation anxiety. Great communication and a calming nature.",
      },
    ],
  },
  faqs: [
    {
      question: "Where do you offer live-in pet sitting?",
      answer:
        "We serve London zones 1–4 with frequent bookings in Hackney, Dalston, Whitechapel, Shoreditch, Stoke Newington, Clapham, Battersea, Islington, Kensington and Fulham.",
    },
    {
      question: "What makes live-in care better than kennels?",
      answer:
        "Your pets keep their routine, stay in their own safe space, and avoid stress from travel or unfamiliar smells. It also keeps your home occupied and secure.",
    },
    {
      question: "What do I need to prepare for the stay?",
      answer:
        "Food, water, and any medication your pet needs, plus a place to sleep with Wifi strong enough for remote working. Instructions for your pet's routine are also helpful.",
    },
    {
      question: "Are you verified and background checked?",
      answer:
        "Yes — verified with real reviews from clients on Rover.com and DBS checked. You can request certificates before confirming a booking.",
    },
    {
      question: "Do you handle medication or anxious pets?",
      answer:
        "Yes. We have veterinary-adjacent experience and regularly support anxious rescues and seniors, including medication schedules.",
    },
    {
      question: "How do we book or check availability?",
      answer:
        "Use the availability calendar or contact us directly on email or WhatsApp. We respond quickly and can arrange a meet-and-greet if you prefer.",
    },
  ],
  serviceAreas: [
    "Clapham",
    "Battersea",
    "Islington",
    "Hackney",
    "Kensington",
    "Fulham",
    "Shoreditch",
    "Stoke Newington",
    "Dalston",
    "Wandsworth",
    "Bermondsey",
    "Dulwich",
    "Chelsea",
  ],
  pricing: {
    currency: "£",
    nightly: {
      baseStandard: 54,
      discounts: [
        { minNights: 3, percentOff: 25 },
        { minNights: 4, percentOff: 37.5 },
        { minNights: 5, percentOff: 50 },
        { minNights: 8, percentOff: 55 },
        { minNights: 14, percentOff: 57.5 },
        { minNights: 21, percentOff: 60 },
        { minNights: 30, percentOff: 65 },
      ],
    },
    addOns: {
      walkPerDay: 5,
      walkDiscounts: [{ minNights: 4, percentOff: 30, maxWalksDiscounted: 2 }],
      extraPetPerNight: 10,
      extraPetDiscounts: [
        { minNights: 5, percentOff: 10 },
        { minNights: 8, percentOff: 20 },
        { minNights: 14, percentOff: 30 },
      ],
      constantSupervisionPerNight: 30,
      hourlyOverage: 2,
      earlyStartFlat: 10,
      saturdayEndFlat: 15,
    },
    timings: {
      middayHour: 12,
      earlyStartCutoffHour: 10,
    },
  },
  seo: {
    title: "Live-In Pet Sitting in London | Happy at Home Pets",
    description:
      "Founder-led, fully insured live-in pet sitting across London. Dogs and cats stay relaxed at home with 24/7 care, medication handling, daily updates, and £5m public liability + £75k pet injury cover.",
    keywords: [
      "live-in pet sitting London",
      "in-home dog sitter London",
      "in-home cat sitter London",
      "house sitter London",
      "DBS checked pet sitter",
      "fully insured pet sitter",
    ],
  },
};

const pawsAndStay: Tenant = {
  slug: "pawsandstay",
  status: "active",
  tier: "free",
  businessName: "Paws & Stay",
  founderName: "Priya Sharma",
  tagline: "Cosy home dog boarding in Bristol",
  locationLabel: "Bristol",
  branding: {
    primary: "oklch(0.58 0.15 25)",
  },
  contact: {
    phone: "07700 900123",
    whatsapp: "447700900123",
    responseTime: "Usually within an hour",
  },
  // Free tier: no email routing — the enquiry form will offer WhatsApp only.
  enquiry: {},
  hero: {
    priceFromLabel: "From £30 a night",
    ctaPrimaryLabel: "Get a Quote",
    ctaSecondaryLabel: "Check Availability",
    trustBadges: [
      { icon: "Heart", label: "Small home, big love" },
      { icon: "Home", label: "Only one booking at a time" },
      { icon: "PawPrint", label: "Dogs treated like family" },
    ],
    blurb:
      "A relaxed, dog-friendly home in Bristol where your dog is the only guest. Garden access, daily walks, and constant company while you're away.",
  },
  about: {
    heading: "Home Boarding, Not a Kennel",
    paragraphs: [
      "At Paws & Stay your dog stays in my home as part of the family — sofas, garden, walks and cuddles included. I only take one booking at a time so your dog gets my full attention.",
      "I've boarded dogs for over eight years and am comfortable with puppies, seniors, and anxious rescues. Daily photo updates come as standard so you always know how they're getting on.",
    ],
    features: [
      {
        icon: "Home",
        title: "One Dog at a Time",
        description:
          "Your dog is never one of a crowd — they get the whole house and my full attention.",
      },
      {
        icon: "PawPrint",
        title: "Garden & Daily Walks",
        description:
          "A secure garden plus daily walks around Bristol's parks and green spaces.",
      },
      {
        icon: "Heart",
        title: "Calm & Patient",
        description:
          "Gentle, patient care for nervous dogs, puppies and seniors alike.",
      },
    ],
  },
  reviews: {
    heading: "Happy Tails",
    subheading: "A few words from dog parents who've stayed with us.",
    items: [
      {
        name: "Tom B.",
        initials: "TB",
        date: "May 12, 2025",
        rating: 5,
        text: "Priya looked after Bingo for two weeks and he came home happy and tired in the best way. Loads of photos and clearly very loved.",
      },
      {
        name: "Sofia L.",
        initials: "SL",
        date: "Apr 03, 2025",
        rating: 5,
        text: "Our anxious rescue settled in within a day. Couldn't recommend Paws & Stay more highly.",
      },
      {
        name: "James W.",
        initials: "JW",
        date: "Mar 20, 2025",
        rating: 5,
        text: "Lovely home, lovely person, and a very happy spaniel. Will book again every time.",
      },
    ],
  },
  faqs: [
    {
      question: "Where are you based?",
      answer:
        "I'm in Bishopston, Bristol, with easy access to the Downs and several parks for walks.",
    },
    {
      question: "How many dogs do you take?",
      answer:
        "Just one booking at a time, so your dog (or dogs from the same family) gets my full attention.",
    },
    {
      question: "Do you send updates?",
      answer:
        "Yes — daily photos and messages so you can relax knowing your dog is happy.",
    },
    {
      question: "How do I book?",
      answer:
        "Message me on WhatsApp with your dates and I'll confirm availability, usually within an hour.",
    },
  ],
  serviceAreas: ["Bishopston", "Redland", "Clifton", "Horfield", "Cotham"],
  pricing: {
    currency: "£",
    nightly: {
      baseStandard: 35,
      discounts: [
        { minNights: 5, percentOff: 10 },
        { minNights: 10, percentOff: 15 },
      ],
    },
    addOns: {
      walkPerDay: 0,
      walkDiscounts: [],
      extraPetPerNight: 15,
      extraPetDiscounts: [],
      constantSupervisionPerNight: 0,
      hourlyOverage: 0,
      earlyStartFlat: 0,
      saturdayEndFlat: 0,
    },
    timings: {
      middayHour: 12,
      earlyStartCutoffHour: 10,
    },
  },
  seo: {
    title: "Home Dog Boarding in Bristol | Paws & Stay",
    description:
      "Cosy, one-at-a-time home dog boarding in Bristol. Garden access, daily walks, photo updates and lots of love while you're away.",
    keywords: [
      "dog boarding Bristol",
      "home dog boarding",
      "dog sitter Bristol",
    ],
  },
};

export const SEED_TENANTS: Tenant[] = [happyAtHomePets, pawsAndStay];

/** The tenant served when no subdomain is present (apex/local dev fallback). */
export const DEFAULT_TENANT_SLUG = "happyathomepets";
