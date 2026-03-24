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

  // マウスドラッグ用
  const isDragging      = useRef(false);
  const dragStartX      = useRef(0);
  const scrollStartLeft = useRef(0);
  const dragMoved       = useRef(false); // クリックとドラッグを区別

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

  // ── マウスドラッグ（PC対応） ──────────────────────────────────
  function handleMouseDown(e: React.MouseEvent) {
    if (!scrollRef.current) return;
    isDragging.current      = true;
    dragMoved.current       = false;
    dragStartX.current      = e.clientX;
    scrollStartLeft.current = scrollRef.current.scrollLeft;
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!isDragging.current || !scrollRef.current) return;
    const dx = e.clientX - dragStartX.current;
    if (Math.abs(dx) > 5) dragMoved.current = true;
    scrollRef.current.scrollLeft = scrollStartLeft.current - dx;
  }

  function handleMouseUp(e: React.MouseEvent) {
    if (!isDragging.current) return;
    isDragging.current = false;
    const dx = e.clientX - dragStartX.current;
    // 50px 以上動いたらスナップ移動
    if (Math.abs(dx) > 50) {
      if (dx < 0) scrollToIndex(Math.min(activeIndex + 1, count - 1));
      else        scrollToIndex(Math.max(activeIndex - 1, 0));
    } else {
      scrollToIndex(activeIndex); // 元の位置に戻す
    }
  }

  function handleMouseLeave() {
    if (isDragging.current) {
      isDragging.current = false;
      scrollToIndex(activeIndex);
    }
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

  // ── 複数枚: 横スクロールカルーセル（PC左右ボタン＋マウスドラッグ対応） ──
  return (
    <>
      {/* カルーセルラッパー（PCボタン配置用） */}
      <div className="relative group/carousel">

        {/* 左ボタン（PC: md以上で表示） */}
        <button
          onClick={() => scrollToIndex(Math.max(activeIndex - 1, 0))}
          disabled={activeIndex === 0}
          aria-label="前の画像"
          className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 z-10
                     w-10 h-10 items-center justify-center
                     bg-background border border-border rounded-full shadow-md
                     text-foreground hover:text-accent hover:border-accent/50
                     transition-all duration-200
                     disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-foreground disabled:hover:border-border"
        >
          <ChevronLeft size={20} />
        </button>

        {/* スクロールコンテナ */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          className="flex overflow-x-auto snap-x snap-mandatory gap-3 pb-3 select-none"
          style={{ scrollbarWidth: "none", cursor: isDragging.current ? "grabbing" : "grab" }}
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
                onClick={() => {
                  if (dragMoved.current) return; // ドラッグ後はモーダルを開かない
                  setModal(i);
                }}
                className="block w-full rounded-xl overflow-hidden border border-border
                           bg-stone-50 shadow-sm hover:shadow-md transition-shadow
                           active:scale-[0.99]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={img.alt}
                  className="w-full h-[50vh] md:h-[60vh] md:w-auto object-contain pointer-events-none"
                />
              </button>
            </div>
          ))}
        </div>

        {/* 右ボタン（PC: md以上で表示） */}
        <button
          onClick={() => scrollToIndex(Math.min(activeIndex + 1, count - 1))}
          disabled={activeIndex === count - 1}
          aria-label="次の画像"
          className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 z-10
                     w-10 h-10 items-center justify-center
                     bg-background border border-border rounded-full shadow-md
                     text-foreground hover:text-accent hover:border-accent/50
                     transition-all duration-200
                     disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-foreground disabled:hover:border-border"
        >
          <ChevronRight size={20} />
        </button>
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
