"use client";

import { useState, useEffect } from "react";
import { CalendarDays, X, FileText } from "lucide-react";

interface Props {
  fileUrl:      string;
  resourceType: "image" | "raw";
  format:       string;
}

export default function CalendarViewer({ fileUrl, resourceType }: Props) {
  const [open, setOpen] = useState(false);
  const isImage = resourceType === "image";

  // モーダル中はスクロールをロック
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-sm text-accent border border-accent/40
                   px-4 py-2 rounded-sm hover:bg-accent/5 transition-colors duration-200"
      >
        <CalendarDays size={13} strokeWidth={1.8} />
        営業日カレンダーを見る
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          {/* 閉じるボタン */}
          <button
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-black/40 rounded-full transition-colors"
            aria-label="閉じる"
          >
            <X size={20} />
          </button>

          {isImage ? (
            /* 画像カレンダー */
            <div
              className="max-w-[90vw] max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={fileUrl}
                alt="営業日カレンダー"
                className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
              />
            </div>
          ) : (
            /* PDFカレンダー */
            <div
              className="bg-white rounded-xl p-8 text-center max-w-sm mx-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <FileText size={40} strokeWidth={1.2} className="text-accent/50 mx-auto mb-4" />
              <p className="text-sm font-medium text-foreground mb-1">営業日カレンダー</p>
              <p className="text-xs text-muted mb-6">タップしてPDFを開いてください</p>
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-accent hover:bg-accent/90
                           text-white rounded-sm text-sm tracking-wide transition-colors duration-200"
              >
                PDFを開く
              </a>
            </div>
          )}
        </div>
      )}
    </>
  );
}
