"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export interface GalleryImage {
  url: string;
  alt: string;
}

interface Props {
  images: GalleryImage[];
}

export default function ImageGallery({ images }: Props) {
  const [modal,       setModal]       = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const count      = images.length;
  const scrollRef  = useRef<HTMLDivElement>(null);
  const itemRefs   = useRef<(HTMLDivElement | null)[]>([]);

  // ── スクロール位置から現在インデックスを検出 ──────────────────
  function handleScroll() {
    const container = scrollRef.current;
    if (!container) return;
    const containerLeft = container.getBoundingClientRect().left;
    let closestIdx = 0;
    let closestDist = Infinity;
    itemRefs.current.forEach((el, i) => {
      if (!el) return;
      const dist = Math.abs(el.getBoundingClientRect().left - containerLeft);
      if (dist < closestDist) { closestDist = dist; closestIdx = i; }
    });
    setActiveIndex(closestIdx);
  }

  // ── ドットクリックでスクロール ────────────────────────────────
  function scrollToIndex(i: number) {
    itemRefs.current[i]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
  }

  // ── キーボードナビゲーション（モーダル内） ────────────────────
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

  // ── モーダル中はボディスクロールをロック ─────────────────────
  useEffect(() => {
    document.body.style.overflow = modal !== null ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [modal]);

  if (count === 0) return null;

  function goPrev() { setModal((i) => i !== null && i > 0         ? i - 1 : i); }
  function goNext() { setModal((i) => i !== null && i < count - 1 ? i + 1 : i); }

  // ── 1枚のみの場合は横スクロール不要 ──────────────────────────
  if (count === 1) {
    return (
      <>
        <button
          onClick={() => setModal(0)}
          className="block w-full max-w-xl mx-auto rounded-xl overflow-hidden border border-border
                     bg-stone-50 shadow-sm hover:shadow-md transition-shadow"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={images[0].url} alt={images[0].alt} className="w-full object-contain" />
        </button>

        {/* モーダル（1枚） */}
        {modal === 0 && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm"
            onClick={() => setModal(null)}
          >
            <button
              onClick={() => setModal(null)}
              className="absolute top-4 right-4 z-10 p-2 text-white/80 hover:text-white bg-black/40 rounded-full"
              aria-label="閉じる"
            >
              <X size={20} />
            </button>
            <div className="max-w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[0].url}
                alt={images[0].alt}
                className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
              />
            </div>
          </div>
        )}
      </>
    );
  }

  // ── 複数枚: 横スクロールギャラリー ───────────────────────────
  return (
    <>
      {/* スクロールコンテナ */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory gap-3 pb-3"
        style={{ scrollbarWidth: "none" }}
      >
        {/* WebKit スクロールバー非表示 */}
        <style>{`.img-gallery::-webkit-scrollbar { display: none; }`}</style>

        {images.map((img, i) => (
          <div
            key={i}
            ref={(el) => { itemRefs.current[i] = el; }}
            className="flex-none snap-start w-[85vw] md:w-auto"
          >
            <button
              onClick={() => setModal(i)}
              className="block w-full rounded-xl overflow-hidden border border-border
                         bg-stone-50 shadow-sm hover:shadow-md transition-shadow
                         active:scale-[0.99]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.alt}
                className="w-full md:h-[60vh] md:w-auto object-contain"
              />
            </button>
          </div>
        ))}
      </div>

      {/* ドットインジケーター */}
      <div className="flex justify-center gap-2 mt-3">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollToIndex(i)}
            aria-label={`${i + 1}枚目`}
            className={`rounded-full transition-all duration-200 ${
              i === activeIndex
                ? "w-4 h-1.5 bg-accent"
                : "w-1.5 h-1.5 bg-border hover:bg-accent/40"
            }`}
          />
        ))}
      </div>

      {/* ── モーダル ─────────────────────────────────────────── */}
      {modal !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm"
          onClick={() => setModal(null)}
        >
          <button
            onClick={() => setModal(null)}
            className="absolute top-4 right-4 z-10 p-2 text-white/80 hover:text-white bg-black/40 rounded-full transition-colors"
            aria-label="閉じる"
          >
            <X size={20} />
          </button>

          {modal > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              className="absolute left-3 z-10 p-2.5 text-white/80 hover:text-white bg-black/40 rounded-full transition-colors"
              aria-label="前の画像"
            >
              <ChevronLeft size={24} />
            </button>
          )}

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

          {modal < count - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              className="absolute right-3 z-10 p-2.5 text-white/80 hover:text-white bg-black/40 rounded-full transition-colors"
              aria-label="次の画像"
            >
              <ChevronRight size={24} />
            </button>
          )}

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
        </div>
      )}
    </>
  );
}
