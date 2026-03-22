"use server";

// web/app/portal/auth/actions.ts
//
// ログイン・ログアウトの Server Actions。
// 認証ロジックは lib/session.ts に集約しており、ここは薄いグルーコードのみ。

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  SESSION_COOKIE_NAME,
  createSessionToken,
  verifyCredentials,
} from "@/lib/session";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24, // 24 時間
};

// ── ログイン ──────────────────────────────────────────────

export type LoginState = {
  error?: string;
};

export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!verifyCredentials(username, password)) {
    return { error: "IDまたはパスワードが正しくありません。" };
  }

  const token = await createSessionToken();
  (await cookies()).set(SESSION_COOKIE_NAME, token, COOKIE_OPTIONS);
  redirect("/portal");
}

// ── ログアウト ────────────────────────────────────────────

export async function logoutAction(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE_NAME);
  redirect("/portal/auth");
}
