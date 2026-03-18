"use client";

import { useState } from "react";
import Image from "next/image";
import { Utensils } from "lucide-react";
export interface PhotoStripItem {
  id:    string;
  image: string;
  name:  string;
}

// ── 1枚分のカード ─────────────────────────────────────────
function PhotoCard({ src, label }: { src: string; label: string }) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="shrink-0 w-[72vw] max-w-[260px] md:w-auto snap-start rounded-xl overflow-hidden border border-border card-lift bg-background group">
      {/* 画像エリア */}
      <div className="aspect-[4/3] bg-card-bg relative flex items-center justify-center overflow-hidden">
        {/* プレースホルダー（画像なし or ロード前） */}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center gap-2 transition-opacity duration-300 ${
            loaded && !error ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <Utensils size={26} strokeWidth={1.2} className="text-muted/40" />
          <span className="text-[10px] text-muted/50 tracking-wider">
            {label}
          </span>
        </div>

        {/* 写真本体 */}
        {!error && (
          <Image
            src={src}
            alt={label}
            fill
            className={`object-cover transition-[opacity,transform] duration-500 group-hover:scale-[1.04] ${
              loaded ? "opacity-100" : "opacity-0"
            }`}
            sizes="(max-width: 768px) 72vw, 33vw"
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
          />
        )}
      </div>

      {/* ラベル */}
      <div className="px-4 py-3">
        <p className="text-sm font-medium text-foreground/75 group-hover:text-accent transition-colors duration-200">
          {label}
        </p>
      </div>
    </div>
  );
}

// ── PhotoStrip（セクション内に埋め込む） ──────────────────
export default function PhotoStrip({ items }: { items: PhotoStripItem[] }) {
  return (
    // -mx-4 px-4 で section の横 padding を相殺し、スクロール端まで写真を見せる
    <div className="-mx-4 px-4 md:mx-0 md:px-0">
      <div className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-hide md:grid md:grid-cols-3 md:overflow-visible md:pb-0">
        {items.map((item) => (
          <PhotoCard key={item.id} src={item.image} label={item.name} />
        ))}
      </div>
      {/* スクロール誘導 — スマホのみ表示 */}
      <p className="mt-3 text-center text-[10px] text-muted/60 tracking-widest md:hidden">
        ← スワイプ →
      </p>
    </div>
  );
}
