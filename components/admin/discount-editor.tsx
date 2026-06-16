"use client";

import { Plus, X } from "lucide-react";

export interface DiscountRow {
  minNights: number;
  percentOff: number;
  maxWalksDiscounted?: number;
}

const MAX_ROWS = 15;
const input = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm";

/**
 * Friendly editor for a list of discount tiers — "Min nights" + "% off" rows
 * with add/remove. Replaces hand-edited JSON. Optionally shows a third
 * "Max walks discounted" field (walk discounts only).
 */
export function DiscountEditor({
  title,
  hint,
  rows,
  onChange,
  withMaxWalks = false,
}: {
  title: string;
  hint?: string;
  rows: DiscountRow[];
  onChange: (rows: DiscountRow[]) => void;
  withMaxWalks?: boolean;
}) {
  const setRow = (i: number, patch: Partial<DiscountRow>) => {
    onChange(rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  };
  const add = () => {
    if (rows.length < MAX_ROWS) onChange([...rows, { minNights: 1, percentOff: 0 }]);
  };
  const remove = (i: number) => onChange(rows.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-2">
      <div>
        <p className="text-sm font-medium">{title}</p>
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </div>

      {rows.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">No discounts yet.</p>
      ) : null}

      <div className="space-y-2">
        {rows.map((row, i) => (
          <div key={i} className="flex items-end gap-2">
            <label className="flex-1 space-y-1">
              <span className="text-xs text-muted-foreground">Min nights</span>
              <input
                type="number"
                min={1}
                className={input}
                value={row.minNights}
                onChange={(e) => setRow(i, { minNights: Number(e.target.value) })}
              />
            </label>
            <label className="flex-1 space-y-1">
              <span className="text-xs text-muted-foreground">% off</span>
              <input
                type="number"
                min={0}
                max={100}
                className={input}
                value={row.percentOff}
                onChange={(e) => setRow(i, { percentOff: Number(e.target.value) })}
              />
            </label>
            {withMaxWalks ? (
              <label className="flex-1 space-y-1">
                <span className="text-xs text-muted-foreground">Max walks (optional)</span>
                <input
                  type="number"
                  min={0}
                  className={input}
                  value={row.maxWalksDiscounted ?? ""}
                  onChange={(e) =>
                    setRow(i, {
                      maxWalksDiscounted: e.target.value === "" ? undefined : Number(e.target.value),
                    })
                  }
                />
              </label>
            ) : null}
            <button
              type="button"
              onClick={() => remove(i)}
              className="mb-1 rounded-lg border border-border p-2 text-muted-foreground hover:text-red-600 hover:border-red-300"
              aria-label="Remove discount"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={add}
        disabled={rows.length >= MAX_ROWS}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary disabled:opacity-40"
      >
        <Plus className="w-4 h-4" /> Add discount
      </button>
    </div>
  );
}
