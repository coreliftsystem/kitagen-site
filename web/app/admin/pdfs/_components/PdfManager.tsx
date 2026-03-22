"use client";

import { useState, useTransition, useRef } from "react";
import {
  FileText,
  Upload,
  Trash2,
  Eye,
  EyeOff,
  GripVertical,
  ExternalLink,
  Loader2,
} from "lucide-react";
import type { PdfItem } from "../../../lib/adminPdfs";
import {
  uploadPdfAction,
  updatePdfAction,
  bulkSortPdfsAction,
  deletePdfAction,
} from "../actions";

// ── ドラッグ&ドロップ（シンプルな自前実装） ──────────────────

interface Props {
  menuPdfs: PdfItem[];
  calendarPdfs: PdfItem[];
}

export default function PdfManager({ menuPdfs: initMenu, calendarPdfs: initCal }: Props) {
  const [tab, setTab] = useState<"menu" | "calendar">("menu");
  const [menuPdfs, setMenuPdfs] = useState<PdfItem[]>(initMenu);
  const [calendarPdfs, setCalendarPdfs] = useState<PdfItem[]>(initCal);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const dragIdRef = useRef<string | null>(null);

  const items = tab === "menu" ? menuPdfs : calendarPdfs;
  const setItems = tab === "menu" ? setMenuPdfs : setCalendarPdfs;

  function showSuccess(msg: string) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  }

  // ── アップロード ──────────────────────────────────────────
  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("type", tab);
      fd.append("label", file.name.replace(/\.pdf$/i, ""));
      const result = await uploadPdfAction(fd);
      if (!result.ok) {
        setError(result.error ?? "アップロードに失敗しました");
      } else {
        showSuccess("アップロードしました");
        // 画面リフレッシュで再取得
        window.location.reload();
      }
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  // ── 公開/非公開切替 ───────────────────────────────────────
  function handleToggleActive(item: PdfItem) {
    startTransition(async () => {
      const next = !item.active;
      setItems((prev) =>
        prev.map((p) => (p._id === item._id ? { ...p, active: next } : p))
      );
      const result = await updatePdfAction(item._id, { active: next });
      if (!result.ok) {
        setError(result.error ?? "更新に失敗しました");
        // ロールバック
        setItems((prev) =>
          prev.map((p) => (p._id === item._id ? { ...p, active: item.active } : p))
        );
      } else {
        showSuccess(next ? "公開しました" : "非公開にしました");
      }
    });
  }

  // ── ラベル編集 ────────────────────────────────────────────
  function handleLabelChange(item: PdfItem, label: string) {
    setItems((prev) =>
      prev.map((p) => (p._id === item._id ? { ...p, label } : p))
    );
  }

  function handleLabelBlur(item: PdfItem, label: string) {
    if (label === item.label) return;
    startTransition(async () => {
      const result = await updatePdfAction(item._id, { label });
      if (!result.ok) setError(result.error ?? "更新に失敗しました");
    });
  }

  // ── 削除 ──────────────────────────────────────────────────
  function handleDelete(item: PdfItem) {
    if (!confirm(`「${item.label}」を削除しますか？\nCloudinaryからも削除されます。`)) return;
    startTransition(async () => {
      const prev = items;
      setItems((list) => list.filter((p) => p._id !== item._id));
      const result = await deletePdfAction(item._id);
      if (!result.ok) {
        setError(result.error ?? "削除に失敗しました");
        setItems(prev);
      } else {
        showSuccess("削除しました");
      }
    });
  }

  // ── ドラッグ&ドロップ（メニューPDFのみ並び替え可能） ────
  function handleDragStart(id: string) {
    dragIdRef.current = id;
  }

  function handleDragOver(e: React.DragEvent, id: string) {
    e.preventDefault();
    setDragOverId(id);
  }

  function handleDrop(targetId: string) {
    const srcId = dragIdRef.current;
    if (!srcId || srcId === targetId) {
      setDragOverId(null);
      return;
    }
    const newList = [...menuPdfs];
    const srcIdx = newList.findIndex((p) => p._id === srcId);
    const tgtIdx = newList.findIndex((p) => p._id === targetId);
    const [moved] = newList.splice(srcIdx, 1);
    newList.splice(tgtIdx, 0, moved);
    setMenuPdfs(newList);
    setDragOverId(null);
    dragIdRef.current = null;

    startTransition(async () => {
      const result = await bulkSortPdfsAction(newList.map((p) => p._id));
      if (!result.ok) setError(result.error ?? "並び順の保存に失敗しました");
      else showSuccess("並び順を保存しました");
    });
  }

  return (
    <div>
      {/* タブ */}
      <div className="flex gap-2 mb-6">
        {(["menu", "calendar"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              tab === t
                ? "bg-slate-800 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {t === "menu" ? "メニューPDF" : "カレンダーPDF"}
          </button>
        ))}
      </div>

      {/* トースト */}
      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex justify-between">
          {error}
          <button onClick={() => setError(null)} className="ml-4 text-red-400 hover:text-red-600">✕</button>
        </div>
      )}
      {successMsg && (
        <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
          {successMsg}
        </div>
      )}

      {/* アップロードボタン */}
      <div className="mb-6">
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleUpload}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || isPending}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 disabled:opacity-60 transition-colors"
        >
          {uploading ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Upload size={15} />
          )}
          {uploading ? "アップロード中..." : "PDFをアップロード"}
        </button>
        {tab === "calendar" && (
          <p className="text-xs text-slate-500 mt-2">
            ※ 新しいPDFをアップロードすると、現在公開中のものは自動的に非公開になります。
          </p>
        )}
        {tab === "menu" && (
          <p className="text-xs text-slate-500 mt-2">
            ※ ドラッグで並び順を変更できます。
          </p>
        )}
      </div>

      {/* PDFリスト */}
      {items.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <FileText size={32} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">PDFが登録されていません</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item._id}
              draggable={tab === "menu"}
              onDragStart={() => handleDragStart(item._id)}
              onDragOver={(e) => handleDragOver(e, item._id)}
              onDrop={() => handleDrop(item._id)}
              onDragLeave={() => setDragOverId(null)}
              className={`flex items-center gap-3 p-3 bg-white rounded-lg border transition-all ${
                dragOverId === item._id
                  ? "border-slate-400 bg-slate-50"
                  : "border-slate-200"
              } ${!item.active ? "opacity-60" : ""}`}
            >
              {/* ドラッグハンドル（メニューのみ） */}
              {tab === "menu" && (
                <GripVertical
                  size={16}
                  className="text-slate-300 cursor-grab shrink-0"
                />
              )}

              <FileText size={16} className="text-slate-400 shrink-0" />

              {/* ラベル */}
              <input
                type="text"
                value={item.label}
                onChange={(e) => handleLabelChange(item, e.target.value)}
                onBlur={(e) => handleLabelBlur(item, e.target.value)}
                className="flex-1 text-sm bg-transparent border-b border-transparent hover:border-slate-200 focus:border-slate-400 focus:outline-none px-1 py-0.5 text-slate-700"
              />

              {/* アクションボタン */}
              <div className="flex items-center gap-1 shrink-0">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
                  title="PDFを開く"
                >
                  <ExternalLink size={14} />
                </a>
                <button
                  onClick={() => handleToggleActive(item)}
                  disabled={isPending}
                  className={`p-1.5 transition-colors ${
                    item.active
                      ? "text-green-500 hover:text-green-700"
                      : "text-slate-300 hover:text-slate-500"
                  }`}
                  title={item.active ? "非公開にする" : "公開する"}
                >
                  {item.active ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                <button
                  onClick={() => handleDelete(item)}
                  disabled={isPending}
                  className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"
                  title="削除"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
