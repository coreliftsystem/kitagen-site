"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Upload,
  Link2,
  Trash2,
  Eye,
  EyeOff,
  GripVertical,
  ExternalLink,
  Loader2,
  ImageIcon,
  Pencil,
  Check,
  X,
} from "lucide-react";
import type { DocumentItem } from "../../../lib/adminDocuments";
import {
  uploadDocumentAction,
  registerDocumentUrlAction,
  updateDocumentAction,
  bulkSortDocumentsAction,
  deleteDocumentAction,
} from "../actions";

// ── ファイル種別バッジ ────────────────────────────────────
function FormatBadge({ format }: { format: string }) {
  const colors: Record<string, string> = {
    pdf:  "bg-red-50 text-red-500 border-red-200",
    jpg:  "bg-sky-50 text-sky-600 border-sky-200",
    png:  "bg-sky-50 text-sky-600 border-sky-200",
    webp: "bg-sky-50 text-sky-600 border-sky-200",
    url:  "bg-slate-50 text-slate-500 border-slate-200",
  };
  return (
    <span
      className={`text-[10px] font-medium px-1.5 py-0.5 rounded uppercase tracking-wide border ${
        colors[format] ?? colors.url
      }`}
    >
      {format || "?"}
    </span>
  );
}

function SourceBadge({ sourceType }: { sourceType: "upload" | "url" }) {
  if (sourceType !== "url") return null;
  return (
    <span className="text-[10px] text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded">
      URL
    </span>
  );
}

function FilePreview({ item }: { item: DocumentItem }) {
  if (item.resourceType === "image") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={item.fileUrl}
        alt={item.title}
        className="w-10 h-10 object-cover rounded border border-slate-200 shrink-0"
      />
    );
  }
  return (
    <div className="w-10 h-10 rounded border border-red-100 bg-red-50 flex items-center justify-center shrink-0">
      <FileText size={18} className="text-red-400" />
    </div>
  );
}

function UrlInputForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (url: string, title: string) => void;
  onCancel: () => void;
}) {
  const [url,   setUrl]   = useState("");
  const [title, setTitle] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    onSubmit(url.trim(), title.trim());
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://..."
        required
        className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-400 placeholder:text-slate-300"
      />
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="タイトル（省略可）"
        className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-400 placeholder:text-slate-300"
      />
      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={!url.trim()}
          className="flex-1 py-2 bg-slate-800 text-white text-sm rounded-lg hover:bg-slate-700 disabled:opacity-50 transition-colors"
        >
          登録
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}

// ── タブ定義 ──────────────────────────────────────────────
type TabKey = "lunch" | "dinner" | "takeout" | "calendar";

const TABS: { key: TabKey; label: string; desc: string }[] = [
  {
    key:   "lunch",
    label: "ランチ",
    desc:  "ランチメニューページに表示する画像を登録できます。ドラッグで並び順を変更できます。",
  },
  {
    key:   "dinner",
    label: "ディナー",
    desc:  "ディナーメニューページに表示する画像を登録できます。ドラッグで並び順を変更できます。",
  },
  {
    key:   "takeout",
    label: "テイクアウト",
    desc:  "テイクアウトページに表示するメニュー画像を登録できます。公開中のものを1件にする場合は、古いものを先に非公開にしてください。",
  },
  {
    key:   "calendar",
    label: "カレンダー",
    desc:  "常に1件のみ公開されます。差し替えると、現在公開中のものは自動的に非公開になります。",
  },
];

// ── メインコンポーネント ──────────────────────────────────

type InputMode = "upload" | "url";

interface Props {
  lunchDocs:    DocumentItem[];
  dinnerDocs:   DocumentItem[];
  calendarDocs: DocumentItem[];
  takeoutDocs:  DocumentItem[];
}

export default function DocumentManager({
  lunchDocs:    initLunch,
  dinnerDocs:   initDinner,
  calendarDocs: initCal,
  takeoutDocs:  initTakeout,
}: Props) {
  const router = useRouter();
  const [tab,        setTab]        = useState<TabKey>("lunch");
  const [lunchDocs,  setLunchDocs]  = useState<DocumentItem[]>(initLunch);
  const [dinnerDocs, setDinnerDocs] = useState<DocumentItem[]>(initDinner);
  const [calDocs,    setCalDocs]    = useState<DocumentItem[]>(initCal);
  const [takeDocs,   setTakeDocs]   = useState<DocumentItem[]>(initTakeout);
  const [inputMode, setInputMode] = useState<InputMode>("upload");
  const [error,     setError]     = useState<string | null>(null);
  const [toast,     setToast]     = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [editingId,    setEditingId]    = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const dragIdRef    = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  // 編集モード開始時にinputへフォーカス
  useEffect(() => {
    if (editingId) editInputRef.current?.focus();
  }, [editingId]);

  const items    = tab === "lunch" ? lunchDocs    : tab === "dinner" ? dinnerDocs    : tab === "takeout" ? takeDocs : calDocs;
  const setItems = tab === "lunch" ? setLunchDocs : tab === "dinner" ? setDinnerDocs : tab === "takeout" ? setTakeDocs : setCalDocs;

  const currentTabDef = TABS.find((t) => t.key === tab)!;

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  // ── アップロード後にステート更新 ────────────────────────
  function addDocToState(doc: DocumentItem) {
    if (doc.type === "calendar") {
      setCalDocs((prev) => [...prev.map((d) => ({ ...d, isActive: false })), doc]);
    } else if (doc.type === "lunch") {
      setLunchDocs((prev) => [...prev, doc]);
    } else if (doc.type === "dinner") {
      setDinnerDocs((prev) => [...prev, doc]);
    } else if (doc.type === "takeout") {
      setTakeDocs((prev) => [...prev, doc]);
    }
  }

  // ── アップロード ────────────────────────────────────────
  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("type", tab);
      const result = await uploadDocumentAction(fd);
      if (!result.ok) {
        setError(result.error ?? "アップロードに失敗しました");
      } else if (result.document) {
        addDocToState(result.document);
        showToast("アップロードしました");
        router.refresh();
      }
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  // ── URL登録 ──────────────────────────────────────────────
  function handleUrlSubmit(url: string, title: string) {
    setError(null);
    startTransition(async () => {
      const result = await registerDocumentUrlAction(url, title, tab);
      if (!result.ok) {
        setError(result.error ?? "登録に失敗しました");
      } else {
        if (result.document) addDocToState(result.document);
        showToast("登録しました");
        setInputMode("upload");
        router.refresh();
      }
    });
  }

  // ── 公開/非公開 ─────────────────────────────────────────
  function handleToggleActive(item: DocumentItem) {
    const next = !item.isActive;
    startTransition(async () => {
      setItems((prev) =>
        prev.map((d) => (d._id === item._id ? { ...d, isActive: next } : d))
      );
      const result = await updateDocumentAction(item._id, { isActive: next });
      if (!result.ok) {
        setError(result.error ?? "更新に失敗しました");
        setItems((prev) =>
          prev.map((d) => (d._id === item._id ? { ...d, isActive: item.isActive } : d))
        );
      } else {
        showToast(next ? "公開しました" : "非公開にしました");
      }
    });
  }

  // ── タイトル編集 ─────────────────────────────────────────
  function startEditing(item: DocumentItem) {
    setEditingId(item._id);
    setEditingTitle(item.title);
  }

  function cancelEditing() {
    setEditingId(null);
    setEditingTitle("");
  }

  function commitEditing(item: DocumentItem) {
    const trimmed = editingTitle.trim();
    setEditingId(null);
    setEditingTitle("");
    if (!trimmed || trimmed === item.title) return;
    setItems((prev) => prev.map((d) => (d._id === item._id ? { ...d, title: trimmed } : d)));
    startTransition(async () => {
      const result = await updateDocumentAction(item._id, { title: trimmed });
      if (!result.ok) {
        setError(result.error ?? "更新に失敗しました");
        setItems((prev) => prev.map((d) => (d._id === item._id ? { ...d, title: item.title } : d)));
      } else {
        showToast("名前を保存しました");
      }
    });
  }

  // ── 削除 ────────────────────────────────────────────────
  function handleDelete(item: DocumentItem) {
    const isCloudinary = item.sourceType === "upload" && item.cloudinaryPublicId;
    const confirmMsg = isCloudinary
      ? `「${item.title}」を削除しますか？\nCloudinaryからも削除されます。`
      : `「${item.title}」をリストから削除しますか？\n（元のURLには影響しません）`;
    if (!confirm(confirmMsg)) return;

    const snapshot = items;
    setItems((prev) => prev.filter((d) => d._id !== item._id));
    startTransition(async () => {
      const result = await deleteDocumentAction(item._id);
      if (!result.ok) {
        setError(result.error ?? "削除に失敗しました");
        setItems(snapshot);
      } else {
        showToast("削除しました");
      }
    });
  }

  // ── ドラッグ&ドロップ（メニューのみ） ───────────────────
  function handleDragStart(id: string) { dragIdRef.current = id; }

  function handleDragOver(e: React.DragEvent, id: string) {
    e.preventDefault();
    setDragOverId(id);
  }

  function handleDrop(targetId: string) {
    const srcId = dragIdRef.current;
    setDragOverId(null);
    dragIdRef.current = null;
    if (!srcId || srcId === targetId) return;

    const next = [...items];
    const si = next.findIndex((d) => d._id === srcId);
    const ti = next.findIndex((d) => d._id === targetId);
    const [moved] = next.splice(si, 1);
    next.splice(ti, 0, moved);
    setItems(next);

    startTransition(async () => {
      const result = await bulkSortDocumentsAction(next.map((d) => d._id));
      if (!result.ok) setError(result.error ?? "並び順の保存に失敗しました");
      else showToast("並び順を保存しました");
    });
  }

  const activeCalendar = calDocs.find((d) => d.isActive);

  return (
    <div>
      {/* ── サブタブ ── */}
      <div className="flex gap-2 mb-6">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => { setTab(key); setInputMode("upload"); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === key
                ? "bg-slate-800 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {label}
            <span className="ml-1.5 text-xs opacity-60">
              ({key === "lunch" ? lunchDocs.length : key === "dinner" ? dinnerDocs.length : key === "takeout" ? takeDocs.length : calDocs.length})
            </span>
          </button>
        ))}
      </div>

      {/* ── トースト / エラー ── */}
      {toast && (
        <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
          {toast}
        </div>
      )}
      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex justify-between items-start gap-3">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 shrink-0">✕</button>
        </div>
      )}

      {/* ── カレンダー：公開中バナー ── */}
      {tab === "calendar" && activeCalendar && (
        <div className="mb-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-3">
          <span className="text-xs font-semibold text-amber-700 shrink-0">公開中</span>
          <FilePreview item={activeCalendar} />
          <span className="text-sm text-amber-800 truncate">{activeCalendar.title}</span>
          <a
            href={activeCalendar.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto text-amber-600 hover:text-amber-800 shrink-0"
          >
            <ExternalLink size={14} />
          </a>
        </div>
      )}

      {/* ── 登録エリア ── */}
      <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
        {/* 入力方法トグル */}
        <div className="flex gap-1 mb-4 p-1 bg-white rounded-lg border border-slate-200 w-fit">
          <button
            onClick={() => setInputMode("upload")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              inputMode === "upload"
                ? "bg-slate-800 text-white"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Upload size={12} />
            アップロード
          </button>
          <button
            onClick={() => setInputMode("url")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              inputMode === "url"
                ? "bg-slate-800 text-white"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Link2 size={12} />
            URL入力
          </button>
        </div>

        {/* アップロード */}
        {inputMode === "upload" && (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || isPending}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 disabled:opacity-60 transition-colors"
            >
              {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
              {uploading
                ? "アップロード中..."
                : tab === "calendar" && activeCalendar
                  ? "カレンダーを差し替える"
                  : "ファイルをアップロード"}
            </button>
            <p className="text-xs text-slate-400 mt-2">
              JPG / PNG / WEBP / PDF（最大 20MB）・{currentTabDef.desc}
            </p>
          </div>
        )}

        {/* URL入力 */}
        {inputMode === "url" && (
          <div>
            <p className="text-xs text-slate-500 mb-3">
              既存のURLをそのまま登録できます。ファイルはCloudinaryに保存されません。{" "}
              {currentTabDef.desc}
            </p>
            <UrlInputForm
              onSubmit={handleUrlSubmit}
              onCancel={() => setInputMode("upload")}
            />
          </div>
        )}
      </div>

      {/* ── 一覧 ── */}
      {items.length === 0 ? (
        <div className="text-center py-16 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
          <div className="flex items-center justify-center gap-2 mb-3 opacity-40">
            <ImageIcon size={24} />
            <FileText size={24} />
          </div>
          <p className="text-sm">登録されているファイルがありません</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item._id}
              draggable={tab === "lunch" || tab === "dinner"}
              onDragStart={() => handleDragStart(item._id)}
              onDragOver={(e) => handleDragOver(e, item._id)}
              onDrop={() => handleDrop(item._id)}
              onDragLeave={() => setDragOverId(null)}
              className={`flex items-center gap-3 p-3 bg-white rounded-xl border transition-all duration-150 ${
                dragOverId === item._id
                  ? "border-slate-400 shadow-md scale-[1.01]"
                  : "border-slate-200 hover:border-slate-300"
              } ${!item.isActive ? "opacity-50" : ""}`}
            >
              {(tab === "lunch" || tab === "dinner") && (
                <GripVertical size={15} className="text-slate-300 cursor-grab shrink-0" />
              )}

              <FilePreview item={item} />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                  <FormatBadge format={item.format} />
                  <SourceBadge sourceType={item.sourceType} />
                  {!item.isActive && (
                    <span className="text-[10px] text-slate-400">非公開</span>
                  )}
                </div>
                {editingId === item._id ? (
                  <div className="flex items-center gap-1">
                    <input
                      ref={editInputRef}
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitEditing(item);
                        if (e.key === "Escape") cancelEditing();
                      }}
                      className="flex-1 text-sm px-2 py-1 border border-slate-400 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-300 text-slate-700 min-w-0"
                    />
                    <button
                      onClick={() => commitEditing(item)}
                      className="p-1 text-emerald-600 hover:text-emerald-800 transition-colors shrink-0"
                      title="保存"
                    >
                      <Check size={15} />
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="p-1 text-slate-400 hover:text-slate-600 transition-colors shrink-0"
                      title="キャンセル"
                    >
                      <X size={15} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 group/title">
                    <span className="text-sm text-slate-700 truncate">{item.title}</span>
                    <button
                      onClick={() => startEditing(item)}
                      className="p-0.5 text-slate-300 hover:text-slate-500 opacity-0 group-hover/title:opacity-100 transition-all shrink-0"
                      title="名前を変更"
                    >
                      <Pencil size={12} />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-0.5 shrink-0">
                <a
                  href={item.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
                  title="ファイルを開く"
                >
                  <ExternalLink size={14} />
                </a>
                <button
                  onClick={() => handleToggleActive(item)}
                  disabled={isPending}
                  title={item.isActive ? "非公開にする" : "公開する"}
                  className={`p-1.5 transition-colors ${
                    item.isActive
                      ? "text-emerald-500 hover:text-emerald-700"
                      : "text-slate-300 hover:text-slate-500"
                  }`}
                >
                  {item.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                <button
                  onClick={() => handleDelete(item)}
                  disabled={isPending}
                  title="削除"
                  className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"
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
