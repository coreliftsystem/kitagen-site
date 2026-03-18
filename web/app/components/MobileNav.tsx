"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";

const navLinks = [
  { href: "/",        ja: "トップ",      en: "Top"     },
  { href: "/menu",    ja: "メニュー",    en: "Menu"    },
  { href: "/info",    ja: "店舗情報",    en: "Info"    },
  { href: "/takeout", ja: "テイクアウト", en: "Takeout" },
  { href: "/news",    ja: "お知らせ",    en: "News"    },
  { href: "/survey",  ja: "アンケート",  en: "Survey"  },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // createPortal は SSR では使えないため mount 後のみ有効化
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const overlay = (
    <div className="md:hidden">
      {/* ── バックドロップ (z-80) ─────────────────────────── */}
      <div
        className={`fixed inset-0 z-[80] bg-foreground/40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* ── ドロワーパネル (z-90) ────────────────────────── */}
      <div
        className={`fixed top-0 right-0 h-full z-[90] w-[82vw] max-w-[320px] bg-background border-l border-border shadow-[−6px_0_32px_rgba(90,65,30,0.1)] flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* ドロワーヘッダー */}
        <div className="flex items-center justify-between px-6 h-[57px] border-b border-border shrink-0">
          <span className="text-sm font-bold text-accent tracking-wider">
            きたげん
          </span>
          <button
            onClick={() => setOpen(false)}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-border hover:border-accent transition-colors"
            aria-label="閉じる"
          >
            {/* × アイコン */}
            <svg
              className="w-4 h-4 text-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* ナビゲーション */}
        <nav className="flex-1 flex flex-col justify-center px-7">
          <p className="text-[9px] tracking-[0.5em] text-accent/60 mb-7 font-medium">
            NAVIGATION
          </p>
          <ul className="divide-y divide-border">
            {navLinks.map(({ href, ja, en }, i) => (
              <li
                key={href}
                style={{
                  transitionDelay: open ? `${i * 50 + 80}ms` : "0ms",
                }}
                className={`transition-all duration-300 ${
                  open
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 translate-x-6"
                }`}
              >
                <Link
                  href={href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between py-5 group"
                >
                  <span className="text-xl font-medium text-foreground group-hover:text-accent transition-colors duration-200">
                    {ja}
                  </span>
                  <span className="text-[10px] tracking-[0.3em] text-muted/50 group-hover:text-accent/60 transition-colors duration-200 uppercase">
                    {en}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* ドロワーフッター */}
        <div className="px-7 py-8 border-t border-border/50">
          <p className="text-xs text-muted leading-relaxed">
            落ち着いて飲める、ちゃんとした居酒屋。
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* ── ハンバーガーボタン (常にヘッダー内) ─── */}
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg border border-border hover:border-accent transition-all duration-200"
        aria-label={open ? "メニューを閉じる" : "メニューを開く"}
        aria-expanded={open}
      >
        <div className="flex flex-col gap-[5px] w-5">
          <span
            className={`block w-full h-[1.5px] bg-foreground origin-center transition-all duration-300 ${
              open ? "rotate-45 translate-y-[6.5px]" : ""
            }`}
          />
          <span
            className={`block w-full h-[1.5px] bg-foreground transition-all duration-200 ${
              open ? "opacity-0 scale-x-0" : ""
            }`}
          />
          <span
            className={`block w-full h-[1.5px] bg-foreground origin-center transition-all duration-300 ${
              open ? "-rotate-45 -translate-y-[6.5px]" : ""
            }`}
          />
        </div>
      </button>

      {/* createPortal で <body> 直下に配置 → ヘッダーのスタッキングコンテキスト外 */}
      {mounted && createPortal(overlay, document.body)}
    </>
  );
}
