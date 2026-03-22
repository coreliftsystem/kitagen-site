"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import AdminNav from "./AdminNav";
import LogoutButton from "./LogoutButton";

/**
 * 認証ページ（/admin/auth）ではサイドバー・ヘッダーを出さず、
 * それ以外の管理画面では共通レイアウトを表示するクライアント境界。
 */
export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith("/admin/auth");

  if (isAuthPage) {
    return <div className="min-h-screen bg-slate-50">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── 固定ヘッダー ─────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-white border-b border-slate-200 flex items-center px-5 gap-3">
        <span className="font-bold text-slate-800 text-sm tracking-wide">
          きたげん
        </span>
        <span className="text-slate-300 text-xs">|</span>
        <span className="text-xs text-slate-500 tracking-[0.15em]">
          管理画面
        </span>
        <div className="ml-auto flex items-center gap-4">
          <LogoutButton />
          <Link
            href="/"
            className="text-xs text-slate-400 hover:text-slate-700 transition-colors"
          >
            ← 公式サイトへ
          </Link>
        </div>
      </header>

      {/* ── モバイル: ヘッダー直下のナビタブ ─────────── */}
      <div className="md:hidden fixed top-14 left-0 right-0 z-40 bg-white border-b border-slate-200 px-4 py-2">
        <AdminNav orientation="horizontal" />
      </div>

      <div className="flex pt-14 min-h-screen">
        {/* ── デスクトップ: サイドバー ─────────────────── */}
        <aside className="hidden md:block w-52 shrink-0 fixed top-14 left-0 bottom-0 bg-white border-r border-slate-200 overflow-y-auto">
          <div className="px-3 py-5">
            <AdminNav orientation="vertical" />
          </div>
        </aside>

        {/* ── ページコンテンツ ──────────────────────────── */}
        <main className="flex-1 md:ml-52 px-5 md:px-8 pt-16 md:pt-8 pb-8">
          {children}
        </main>
      </div>
    </div>
  );
}
