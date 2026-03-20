// web/proxy.ts
//
// 役割：
//   1. ドメイン正規化 — vercel.app / www → 本番ドメインへ 301 リダイレクト
//   2. 管理画面認証  — /admin/* への未認証アクセスを /admin/login へリダイレクト
//
// ローカル開発（localhost / 127.0.0.1）ではリダイレクトをすべてスキップする。

import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/session";

const PROD_HOST = "kitagen-izakaya.com";
const PROD_ORIGIN = `https://${PROD_HOST}`;

export const config = {
  // _next/ 以下（HMR含む）と静的アセットは除外
  matcher: [
    "/((?!_next|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

export async function proxy(req: NextRequest) {
  const host = req.headers.get("host") ?? "";
  const { pathname, search } = req.nextUrl;

  // ── 1. ローカル開発環境はすべてスルー ──────────────────────────
  if (host.startsWith("localhost") || host.startsWith("127.0.0.1")) {
    return NextResponse.next();
  }

  // ── 2. ドメイン正規化リダイレクト ──────────────────────────────

  // *.vercel.app → 本番ドメイン
  if (host.endsWith(".vercel.app")) {
    return NextResponse.redirect(`${PROD_ORIGIN}${pathname}${search}`, 301);
  }

  // www.kitagen-izakaya.com → kitagen-izakaya.com
  if (host === `www.${PROD_HOST}`) {
    return NextResponse.redirect(`${PROD_ORIGIN}${pathname}${search}`, 301);
  }

  // ── 3. 管理画面認証 ────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    // ログインページ自体は認証不要
    if (pathname === "/admin/login") {
      return NextResponse.next();
    }

    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (token && (await verifySessionToken(token))) {
      return NextResponse.next();
    }

    // 未認証 → ログインページへ
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}
