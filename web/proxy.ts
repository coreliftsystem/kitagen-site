// web/proxy.ts
//
// 役割：
//   管理画面認証 — /admin/* への未認証アクセスを /admin/login へリダイレクト
//
// ドメイン正規化（www なし → www あり）は Vercel Domains 側で管理する。
// このファイルではドメイン判定・リダイレクトを一切行わない。

import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/session";

export const config = {
  // 管理画面パスのみに絞る（_next/ や静的アセットを巻き込まない）
  matcher: ["/admin/:path*"],
};

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ログインページ自体は認証不要
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  // セッション検証
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (token && (await verifySessionToken(token))) {
    return NextResponse.next();
  }

  // 未認証 → ログインページへ
  const loginUrl = req.nextUrl.clone();
  loginUrl.pathname = "/admin/login";
  return NextResponse.redirect(loginUrl);
}
