"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface Props {
  /** SP用画像パス（縦長構図） */
  srcSp: string;
  /** PC用画像パス（横長構図）。省略時は srcSp を使用 */
  srcPc?: string;
  /** SP用 object-position（デフォルト: "center 40%"） */
  positionSp?: string;
  /** PC用 object-position（デフォルト: "center 40%"） */
  positionPc?: string;
}

export default function ParallaxHero({
  srcSp,
  srcPc,
  positionSp = "center 40%",
  positionPc = "center 40%",
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [spLoaded, setSpLoaded] = useState(false);
  const [pcLoaded, setPcLoaded] = useState(false);
  const [spError, setSpError] = useState(false);
  const [pcError, setPcError] = useState(false);

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

      {/* ── SP用（md未満）：縦長構図 ─────────────────── */}
      {!spError && (
        <Image
          src={srcSp}
          alt=""
          fill
          className={`object-cover md:hidden transition-opacity duration-700 ${
            spLoaded ? "opacity-100" : "opacity-0"
          }`}
          style={{ objectPosition: positionSp }}
          priority
          sizes="100vw"
          onLoad={() => setSpLoaded(true)}
          onError={() => setSpError(true)}
        />
      )}

      {/* ── PC用（md以上）：横長構図 ─────────────────── */}
      {!pcError && (
        <Image
          src={srcPc ?? srcSp}
          alt=""
          fill
          className={`object-cover hidden md:block transition-opacity duration-700 ${
            pcLoaded ? "opacity-100" : "opacity-0"
          }`}
          style={{ objectPosition: positionPc }}
          priority
          sizes="100vw"
          onLoad={() => setPcLoaded(true)}
          onError={() => setPcError(true)}
        />
      )}
    </div>
  );
}
