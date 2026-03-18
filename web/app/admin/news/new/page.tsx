import { createAnnouncement } from "../actions";
import NewsForm from "../_components/NewsForm";

export default function AdminNewsNewPage() {
  return (
    <div>
      {/* ── ページヘッダー ────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
          <a
            href="/admin/news"
            className="hover:text-slate-600 transition-colors"
          >
            お知らせ管理
          </a>
          <span>/</span>
          <span className="text-slate-600">新規追加</span>
        </div>
        <h1 className="text-xl font-bold text-slate-800">
          お知らせを新規作成
        </h1>
      </div>

      {/* ── フォーム ──────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8 max-w-2xl">
        <NewsForm action={createAnnouncement} submitLabel="作成する" />
      </div>
    </div>
  );
}
