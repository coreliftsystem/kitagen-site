"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export default function ParallaxHero() {
  const ref = useRef<HTMLDivElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (ref.current) {
        ref.current.style.transform = `translateY(${window.scrollY * 0.4}px)`;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      ref={ref}
      // scale-[1.15] でパララックス移動時の端のはみ出しを防ぐ
      className="absolute inset-0 will-change-transform scale-[1.15]"
      aria-hidden="true"
    >
      {/* ── フォールバック背景 ─────────────────────────────
          写真が未配置 / 読み込みエラーのときに表示される温かいグラデーション */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#2c2215] via-[#1e1a0e] to-[#181408]" />

      {/* ── 店舗写真 (public/hero.jpg) ────────────────────
          写真を配置するとフェードインして表示される */}
      {!imageError && (
        <Image
          src="/beer.jpg"
          alt=""
          fill
          className={`object-cover transition-opacity duration-700 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          style={{ objectPosition: "center 30%" }}
          priority
          sizes="100vw"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        />
      )}
    </div>
  );
}
