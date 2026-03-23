// web/proxy.ts
//
// 役割：
//   管理画面認証 — /portal/* への未認証アクセスを /portal/auth へリダイレクト
//
// ドメイン正規化（www なし → www あり）は Vercel Domains 側で管理する。
// このファイルではドメイン判定・リダイレクトを一切行わない。

import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/session";

export const config = {
  matcher: ["/portal/:path*", "/admin/:path*"],
};

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 旧 /admin/* は /portal/auth へリダイレクト（削除済みルートへのアクセス対策）
  if (pathname.startsWith("/admin")) {
    const dest = req.nextUrl.clone();
    dest.pathname = "/portal/auth";
    return NextResponse.redirect(dest);
  }

  // 認証ページ自体は認証不要
  if (pathname.startsWith("/portal/auth")) {
    return NextResponse.next();
  }

  // セッション検証
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (token && (await verifySessionToken(token))) {
    return NextResponse.next();
  }

  // 未認証 → 認証ページへ
  const loginUrl = req.nextUrl.clone();
  loginUrl.pathname = "/portal/auth";
  return NextResponse.redirect(loginUrl);
}
