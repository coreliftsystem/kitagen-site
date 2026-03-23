"use client";

import { useRef, useState, useTransition } from "react";
import { Upload, Trash2, ExternalLink, Loader2, ImageIcon, CheckCircle2, Link2 } from "lucide-react";
import type { DocumentItem } from "../../../lib/adminDocuments";
import { DEFAULT_SITE_IMAGES } from "../../../lib/site-image-defaults";
import { uploadSiteImageAction, deleteSiteImageAction, registerSiteImageUrlAction } from "../actions";

// ── スロット定義 ──────────────────────────────────────────
// slot キーは getSiteImages() の SLOT_MAP と一致させること
const SLOTS = [
  {
    slot:   "hero.sp",
    type:   "top" as const,
    label:  "ヒーロー背景（スマホ用）",
    hint:   "縦長構図推奨 · 375×667px 以上",
    folder: "kitagen/top",
    defaultUrl: DEFAULT_SITE_IMAGES.hero.sp,
  },
  {
    slot:   "hero.pc",
    type:   "top" as const,
    label:  "ヒーロー背景（PC用）",
    hint:   "横長構図推奨 · 1440×900px 以上",
    folder: "kitagen/top",
    defaultUrl: DEFAULT_SITE_IMAGES.hero.pc,
  },
  {
    slot:   "about.shop",
    type:   "shop" as const,
    label:  "ABOUT — 店内の様子",
    hint:   "4:3 推奨 · 「きたげんについて」セクション右",
    folder: "kitagen/shop",
    defaultUrl: DEFAULT_SITE_IMAGES.about.shop,
  },
  {
    slot:   "food.main",
    type:   "shop" as const,
    label:  "FOOD — こだわりの料理",
    hint:   "4:3 推奨 · 「こだわりの料理」セクション左",
    folder: "kitagen/shop",
    defaultUrl: DEFAULT_SITE_IMAGES.food.main,
  },
  {
    slot:   "space.counter",
    type:   "shop" as const,
    label:  "SPACE — カウンター席",
    hint:   "4:3 推奨 · 「くつろぎの空間」セクション右",
    folder: "kitagen/shop",
    defaultUrl: DEFAULT_SITE_IMAGES.space.counter,
  },
] as const;

// ── スロットカード ─────────────────────────────────────────

function SlotCard({
  slotDef,
  doc,
  onUploaded,
  onDeleted,
}: {
  slotDef: (typeof SLOTS)[number];
  doc: DocumentItem | undefined;
  onUploaded: (slot: string, partial: Partial<DocumentItem>) => void;
  onDeleted:  (slot: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mode,        setMode]        = useState<"upload" | "url">("upload");
  const [urlInput,    setUrlInput]    = useState("");
  const [uploading,   setUploading]   = useState(false);
  const [urlSaving,   setUrlSaving]   = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  const [justSaved,   setJustSaved]   = useState(false);
  const [isPending, startTransition]  = useTransition();

  const activeUrl  = doc?.fileUrl ?? null;
  const previewUrl = activeUrl ?? slotDef.defaultUrl;
  const isDefault  = !activeUrl;
  const isBusy     = uploading || urlSaving || isPending;

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const result = await uploadSiteImageAction(slotDef.slot, slotDef.type, fd);
      if (!result.ok) {
        setError(result.error ?? "アップロードに失敗しました");
      } else {
        onUploaded(slotDef.slot, { fileUrl: result.fileUrl, _id: result.docId, isActive: true, sourceType: "upload" });
        setJustSaved(true);
        setTimeout(() => setJustSaved(false), 3000);
      }
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleUrlSave() {
    if (!urlInput.trim()) return;
    setError(null);
    setUrlSaving(true);
    try {
      const result = await registerSiteImageUrlAction(slotDef.slot, slotDef.type, urlInput.trim());
      if (!result.ok) {
        setError(result.error ?? "登録に失敗しました");
      } else {
        onUploaded(slotDef.slot, { fileUrl: result.fileUrl, _id: result.docId, isActive: true, sourceType: "url" });
        setMode("upload");
        setUrlInput("");
        setJustSaved(true);
        setTimeout(() => setJustSaved(false), 3000);
      }
    } finally {
      setUrlSaving(false);
    }
  }

  function handleDelete() {
    if (!doc?._id) return;
    if (!confirm(`「${slotDef.label}」の画像を削除しますか？\nデフォルト画像に戻ります。`)) return;
    startTransition(async () => {
      const result = await deleteSiteImageAction(doc._id);
      if (!result.ok) {
        setError(result.error ?? "削除に失敗しました");
      } else {
        onDeleted(slotDef.slot);
      }
    });
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* プレビューエリア */}
      <div className="relative h-52 bg-slate-100 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={previewUrl}
          alt={slotDef.label}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.opacity = "0";
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <ImageIcon size={28} className="text-slate-300 opacity-60" />
        </div>

        {/* ラベルバッジ */}
        <div className="absolute top-2 left-2">
          <span className="bg-slate-900/70 text-white text-[10px] px-2 py-1 rounded font-medium">
            {slotDef.label}
          </span>
        </div>

        {/* デフォルト使用中バッジ */}
        {isDefault && (
          <div className="absolute top-2 right-2">
            <span className="bg-amber-500/80 text-white text-[10px] px-2 py-1 rounded font-medium">
              デフォルト
            </span>
          </div>
        )}

        {/* 保存完了オーバーレイ */}
        {justSaved && (
          <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 size={36} className="text-emerald-600" />
          </div>
        )}

        {/* アップロード/URL登録中オーバーレイ */}
        {(uploading || urlSaving) && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <Loader2 size={28} className="animate-spin text-slate-500" />
          </div>
        )}
      </div>

      {/* コントロールエリア */}
      <div className="p-4">
        <p className="text-[11px] text-slate-400 mb-3">{slotDef.hint}</p>

        {error && (
          <p className="text-xs text-red-500 mb-2 bg-red-50 px-2 py-1.5 rounded">{error}</p>
        )}

        {/* モード切替 */}
        <div className="flex gap-0.5 mb-3 p-0.5 bg-slate-100 rounded-lg w-fit">
          <button
            onClick={() => setMode("upload")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              mode === "upload" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Upload size={11} />
            アップロード
          </button>
          <button
            onClick={() => setMode("url")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              mode === "url" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Link2 size={11} />
            URL入力
          </button>
        </div>

        {/* アップロードモード */}
        {mode === "upload" && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="flex items-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isBusy}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 text-white text-xs font-medium rounded-lg hover:bg-slate-700 disabled:opacity-60 transition-colors"
              >
                {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                {uploading ? "アップロード中…" : "画像をアップロード"}
              </button>
              {activeUrl && (
                <a
                  href={activeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 flex items-center justify-center w-9 h-9 border border-slate-200 rounded-lg text-slate-400 hover:text-slate-700 hover:border-slate-300 transition-colors"
                  title="現在の画像を開く"
                >
                  <ExternalLink size={13} />
                </a>
              )}
              {activeUrl && (
                <button
                  onClick={handleDelete}
                  disabled={isBusy}
                  title="削除してデフォルトに戻す"
                  className="flex-shrink-0 flex items-center justify-center w-9 h-9 border border-slate-200 rounded-lg text-slate-300 hover:text-red-500 hover:border-red-200 transition-colors disabled:opacity-60"
                >
                  {isPending ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                </button>
              )}
            </div>
            <p className="mt-2 text-[10px] text-slate-300">
              対応形式: JPG / PNG / WEBP · 最大 20MB
            </p>
          </>
        )}

        {/* URL入力モード */}
        {mode === "url" && (
          <div className="space-y-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://..."
              className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-400 placeholder:text-slate-300"
            />
            <div className="flex gap-2">
              <button
                onClick={handleUrlSave}
                disabled={!urlInput.trim() || isBusy}
                className="flex-1 py-2 bg-slate-800 text-white text-sm rounded-lg hover:bg-slate-700 disabled:opacity-50 transition-colors"
              >
                {urlSaving ? "登録中…" : "登録"}
              </button>
              <button
                onClick={() => { setMode("upload"); setUrlInput(""); setError(null); }}
                className="px-4 py-2 text-sm text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                キャンセル
              </button>
            </div>
            {activeUrl && (
              <div className="flex gap-2 pt-1">
                <a
                  href={activeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <ExternalLink size={12} />現在の画像を開く
                </a>
                <button
                  onClick={handleDelete}
                  disabled={isBusy}
                  className="flex items-center gap-1 text-xs text-slate-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={12} />削除
                </button>
              </div>
            )}
            <p className="text-[10px] text-slate-300">
              Cloudinaryに保存されません · 既存の同スロット画像は非公開になります
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── メインコンポーネント ──────────────────────────────────

interface Props {
  topDocs:     DocumentItem[];
  shopDocs:    DocumentItem[];
  takeoutDocs: DocumentItem[];
}

export default function SiteImageManager({ topDocs, shopDocs, takeoutDocs }: Props) {
  // slot → doc のマップを state で管理（楽観的更新用）
  const [docMap, setDocMap] = useState<Record<string, DocumentItem | undefined>>(() => {
    const all = [...topDocs, ...shopDocs, ...takeoutDocs];
    const map: Record<string, DocumentItem | undefined> = {};
    for (const doc of all) {
      if (doc.slot && doc.isActive) map[doc.slot] = doc;
    }
    return map;
  });

  function handleUploaded(slot: string, partial: Partial<DocumentItem>) {
    setDocMap((prev) => ({
      ...prev,
      [slot]: { ...prev[slot], ...partial, slot } as DocumentItem,
    }));
  }

  function handleDeleted(slot: string) {
    setDocMap((prev) => {
      const next = { ...prev };
      delete next[slot];
      return next;
    });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {SLOTS.map((slotDef) => (
        <SlotCard
          key={slotDef.slot}
          slotDef={slotDef}
          doc={docMap[slotDef.slot]}
          onUploaded={handleUploaded}
          onDeleted={handleDeleted}
        />
      ))}
    </div>
  );
}
