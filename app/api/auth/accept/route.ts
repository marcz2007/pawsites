import { NextResponse } from "next/server";
import { setUserPassword } from "@/lib/auth/supabase-auth";
import { deleteInvite, getInvite } from "@/lib/tenant/members";
import { SESSION_COOKIE, createSessionToken } from "@/lib/auth/session";

/** A sitter sets their password from an invite token, then is logged in. */
export async function POST(request: Request) {
  const { token, password } = (await request.json().catch(() => ({}))) as {
    token?: string;
    password?: string;
  };
  if (!token || !password || password.length < 8) {
    return NextResponse.json(
      { error: "Token and a password of at least 8 characters are required" },
      { status: 400 }
    );
  }

  const invite = await getInvite(token);
  if (!invite) {
    return NextResponse.json({ error: "This invite is invalid or has expired" }, { status: 400 });
  }

  const setResult = await setUserPassword(invite.userId, password);
  if (setResult.error) {
    return NextResponse.json({ error: setResult.error }, { status: 500 });
  }
  await deleteInvite(token);

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, createSessionToken({ uid: invite.userId, email: invite.email }), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
