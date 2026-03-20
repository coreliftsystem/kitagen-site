"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import MobileNav from "./MobileNav";

const NAV_LINKS = [
  { href: "/",       label: "トップ"   },
  { href: "/menu",   label: "メニュー" },
  { href: "/info",   label: "店舗情報" },
  { href: "/news",   label: "お知らせ" },
  { href: "/survey", label: "アンケート" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#FBF8F2]/97 backdrop-blur-md border-b border-border shadow-[0_2px_24px_rgba(47,36,28,0.07)]"
          : "bg-[#FBF8F2]/90 backdrop-blur-sm border-b border-transparent"
      }`}
    >
      <nav className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">

        {/* ── ロゴ ─────────────────────────────────────────── */}
        <Link href="/" className="group flex items-center gap-3.5" aria-label="きたげん トップへ">
          {/* 店名 */}
          <div className="flex flex-col leading-none gap-1">
            <span className="text-[8px] tracking-[0.55em] text-accent/70 font-medium">
              IZAKAYA
            </span>
            <span className="text-xl font-bold tracking-[0.08em] text-foreground group-hover:text-accent transition-colors duration-200">
              きたげん
            </span>
          </div>

          {/* 縦区切り線 ＋ 所在地（PCのみ） */}
          <div className="hidden sm:flex items-center gap-3 ml-0.5">
            <div className="w-px h-7 bg-border" />
            <span className="text-[10px] text-muted/70 tracking-wide leading-[1.7]">
              桃谷の<br />居酒屋
            </span>
          </div>
        </Link>

        {/* ── デスクトップ ナビ ──────────────────────────────── */}
        <ul className="hidden md:flex items-center">
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className="relative px-4 py-1.5 text-sm text-muted hover:text-accent transition-colors duration-200 group"
              >
                {label}
                {/* hover時 — 下線スライドイン */}
                <span
                  className="absolute bottom-0 left-4 right-4 h-px bg-accent
                             scale-x-0 group-hover:scale-x-100
                             transition-transform duration-200 origin-left"
                />
              </Link>
            </li>
          ))}
        </ul>

        {/* ── モバイル ハンバーガー ──────────────────────────── */}
        <MobileNav />

      </nav>
    </header>
  );
}
