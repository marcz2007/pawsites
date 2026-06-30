"use client";

import { DEMO_LIVE_HOST, DEMO_PREVIEW_SRC } from "@/lib/marketing/content";
import { Lock } from "lucide-react";
import { useState } from "react";

/**
 * A mock browser window embedding the real demo tenant site (same-origin via
 * `?tenant=` so it renders in both dev and prod). Visitors can scroll the real
 * Pawsites site inside the frame.
 */
export function LivePreview() {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl">
      {/* Browser chrome */}
      <div className="flex items-center gap-3 border-b border-black/5 bg-neutral-100 px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-red-400" />
          <span className="h-3 w-3 rounded-full bg-amber-400" />
          <span className="h-3 w-3 rounded-full bg-emerald-400" />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="flex w-full max-w-sm items-center justify-center gap-1.5 rounded-md bg-white px-3 py-1 text-xs text-neutral-500 ring-1 ring-black/5">
            <Lock className="h-3 w-3 text-emerald-600" />
            {DEMO_LIVE_HOST}
          </div>
        </div>
      </div>

      {/* Live site */}
      <div className="relative h-[460px] w-full bg-[#ebe4d6] md:h-[600px]">
        {!loaded ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          </div>
        ) : null}
        <iframe
          src={DEMO_PREVIEW_SRC}
          title="Live Pawsites example — Happy at Home Pets"
          loading="lazy"
          onLoad={() => setLoaded(true)}
          className="h-full w-full"
        />
      </div>
    </div>
  );
}
