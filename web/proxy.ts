// web/proxy.ts
//
// /admin/* 配下への未認証アクセスを /admin/login へリダイレクトする。
// セッション検証は lib/session.ts に委譲しており、
// 認証方式を変更する場合はそちらを修正するだけでよい。

import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/session";

export const config = {
  matcher: ["/admin/:path*"],
};

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

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
