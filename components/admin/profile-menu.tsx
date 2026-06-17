"use client";

import { User } from "lucide-react";
import { useState } from "react";

export function ProfileMenu({
  email,
  isOperator,
  logoutAction,
}: {
  email: string | null;
  isOperator: boolean;
  logoutAction: string;
}) {
  const [open, setOpen] = useState(false);
  const displayName = email || "Operator";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-colors"
        aria-label="Account"
        aria-expanded={open}
      >
        <User className="w-5 h-5" />
      </button>

      {open ? (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-64 z-50 rounded-xl border bg-background shadow-lg p-4 space-y-3">
            <div>
              <p className="text-xs text-muted-foreground">Signed in as</p>
              <p className="text-sm font-medium break-all">{displayName}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isOperator ? "Operator · full access" : "Sitter"}
              </p>
            </div>
            <form action={logoutAction} method="post" className="border-t pt-3">
              <button className="text-sm text-red-600 hover:underline">Log out</button>
            </form>
          </div>
        </>
      ) : null}
    </div>
  );
}
