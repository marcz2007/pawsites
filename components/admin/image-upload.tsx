"use client";

import { Upload, X } from "lucide-react";
import { useRef, useState } from "react";

const inputCls = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm";

/**
 * Upload-from-device image picker. Uploads to Supabase Storage via
 * /api/admin/upload and stores the returned public URL. Falls back to a plain
 * URL field so a path can still be pasted.
 */
export function ImageUpload({
  label,
  value,
  onChange,
  tenantSlug,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  tenantSlug: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const pick = () => fileRef.current?.click();

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("tenant", tenantSlug);
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      onChange(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="space-y-1">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex items-center gap-3">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="h-14 w-14 rounded-lg object-cover border border-border" />
        ) : (
          <div className="h-14 w-14 rounded-lg border border-dashed border-border bg-muted/30" />
        )}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={pick}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-accent disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              {busy ? "Uploading…" : "Upload image"}
            </button>
            {value ? (
              <button
                type="button"
                onClick={() => onChange("")}
                className="rounded-lg border border-border p-2 text-muted-foreground hover:text-red-600"
                aria-label="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            ) : null}
          </div>
          <input
            className={inputCls}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="…or paste an image URL"
          />
        </div>
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
