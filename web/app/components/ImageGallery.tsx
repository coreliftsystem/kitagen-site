"use client";

import { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

export interface GalleryImage {
  url: string;
  alt: string;
}

interface Props {
  images: GalleryImage[];
}

export default function ImageGallery({ images }: Props) {
  const [selected,     setSelected]     = useState(0);
  const [modal,        setModal]        = useState<number | null>(null);
  const [touchStartX,  setTouchStartX]  = useState<number | null>(null);

  const count = images.length;

  // キーボードナビゲーション
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (modal === null) return;
    if (e.key === "ArrowRight") setModal((i) => i !== null ? Math.min(i + 1, count - 1) : null);
    if (e.key === "ArrowLeft")  setModal((i) => i !== null ? Math.max(i - 1, 0)         : null);
    if (e.key === "Escape")     setModal(null);
  }, [modal, count]);

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  // モーダル中はスクロールをロック
  useEffect(() => {
    document.body.style.overflow = modal !== null ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [modal]);

  if (count === 0) return null;

  function openModal(i: number) {
    setModal(i);
  }

  function closeModal() {
    setModal(null);
  }

  function goPrev() {
    setModal((i) => i !== null && i > 0 ? i - 1 : i);
  }

  function goNext() {
    setModal((i) => i !== null && i < count - 1 ? i + 1 : i);
  }

  return (
    <>
      {/* ─────────── PC: サムネイル + メイン画像 ─────────── */}
      <div className="hidden md:flex gap-4 items-start">

        {/* サムネイル列（複数枚のときのみ） */}
        {count > 1 && (
          <div className="flex flex-col gap-2 shrink-0 w-[72px]">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelected(i)}
                className={`relative w-[72px] h-[56px] rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                  selected === i
                    ? "border-accent shadow-sm"
                    : "border-border opacity-50 hover:opacity-80 hover:border-accent/40"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={img.alt}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* メイン画像 */}
        <div
          className="flex-1 relative rounded-xl overflow-hidden cursor-zoom-in group border border-border bg-stone-50"
          onClick={() => openModal(selected)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[selected].url}
            alt={images[selected].alt}
            className="w-full object-contain max-h-[65vh]"
          />
          <div className="absolute inset-0 flex items-end justify-end p-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-black/30 rounded-full p-1.5 backdrop-blur-sm">
              <ZoomIn size={16} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* ─────────── スマホ: カード縦並び ─────────── */}
      <div className="md:hidden space-y-3">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => openModal(i)}
            className="w-full rounded-xl overflow-hidden border border-border bg-stone-50 shadow-sm active:scale-[0.99] transition-transform"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.url}
              alt={img.alt}
              className="w-full object-contain"
            />
            {img.alt && (
              <p className="text-xs text-muted text-left px-4 py-2 border-t border-border/50">
                {img.alt}
              </p>
            )}
          </button>
        ))}
      </div>

      {/* ─────────── モーダル ─────────── */}
      {modal !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm"
          onClick={closeModal}
        >
          {/* 閉じるボタン */}
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 z-10 p-2 text-white/80 hover:text-white bg-black/40 rounded-full transition-colors"
            aria-label="閉じる"
          >
            <X size={20} />
          </button>

          {/* 前へ */}
          {count > 1 && modal > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              className="absolute left-3 z-10 p-2.5 text-white/80 hover:text-white bg-black/40 rounded-full transition-colors"
              aria-label="前の画像"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {/* 画像（スワイプ対応） */}
          <div
            className="max-w-[90vw] max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => setTouchStartX(e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (touchStartX === null) return;
              const dx = e.changedTouches[0].clientX - touchStartX;
              if (dx < -50) goNext();
              if (dx >  50) goPrev();
              setTouchStartX(null);
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[modal].url}
              alt={images[modal].alt}
              className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
            />
          </div>

          {/* 次へ */}
          {count > 1 && modal < count - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              className="absolute right-3 z-10 p-2.5 text-white/80 hover:text-white bg-black/40 rounded-full transition-colors"
              aria-label="次の画像"
            >
              <ChevronRight size={24} />
            </button>
          )}

          {/* ドットインジケーター */}
          {count > 1 && (
            <div className="absolute bottom-5 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setModal(i); }}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                    i === modal ? "bg-white scale-125" : "bg-white/40 hover:bg-white/70"
                  }`}
                  aria-label={`${i + 1}枚目`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
