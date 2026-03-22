import Link from "next/link";
import { Plus, Lock, Clock } from "lucide-react";
import {
  getAdminAnnouncements,
  isEffectivelyPublished,
  type AdminAnnouncement,
} from "../../lib/adminAnnouncements";
import DeleteButton from "./_components/DeleteButton";

// ── ステータスバッジ ────────────────────────────────────────

function StatusBadge({ item }: { item: AdminAnnouncement }) {
  if (!item.isPublished) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
        下書き
      </span>
    );
  }

  if (item.publishAt && new Date(item.publishAt) > new Date()) {
    // 予約済み（将来公開）
    const d = new Date(item.publishAt);
    const label = d.toLocaleDateString("ja-JP", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    return (
      <span
        title={`${d.toLocaleString("ja-JP")} に公開予定`}
        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap"
      >
        <Clock size={10} strokeWidth={2} />
        {label}公開予定
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
      公開中
    </span>
  );
}

// ── ページ ─────────────────────────────────────────────────

export default async function AdminNewsPage() {
  const announcements = await getAdminAnnouncements();

  return (
    <div>
      {/* ── ページヘッダー ────────────────────────────── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold text-slate-800">お知らせ管理</h1>
          <p className="text-sm text-slate-500 mt-1">
            {announcements.length > 0
              ? `${announcements.length}件のお知らせ`
              : "お知らせはまだありません"}
          </p>
        </div>
        <Link
          href="/portal/news/new"
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm rounded-lg hover:bg-slate-700 transition-colors"
        >
          <Plus size={14} strokeWidth={2} />
          新規追加
        </Link>
      </div>

      {/* ── お知らせ一覧 ─────────────────────────────── */}
      {announcements.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 py-16 text-center">
          <p className="text-slate-400 text-sm mb-4">
            お知らせはまだありません
          </p>
          <Link
            href="/portal/news/new"
            className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 underline underline-offset-2 transition-colors"
          >
            <Plus size={13} strokeWidth={2} />
            最初のお知らせを作成する
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {/* テーブルヘッダー（デスクトップ） */}
          <div className="hidden md:grid grid-cols-[1fr_140px_130px] gap-4 px-5 py-3 bg-slate-50 border-b border-slate-100 text-xs font-medium text-slate-500 tracking-wider uppercase">
            <span>タイトル / 本文</span>
            <span className="text-center">公開状態</span>
            <span className="text-right">操作</span>
          </div>

          <div className="divide-y divide-slate-100">
            {announcements.map((item) => {
              const locked = isEffectivelyPublished(item);
              return (
                <div
                  key={item.id}
                  className="grid grid-cols-1 md:grid-cols-[1fr_140px_130px] gap-3 md:gap-4 items-center px-5 py-4 hover:bg-slate-50 transition-colors"
                >
                  {/* テキスト */}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 leading-snug truncate">
                      {item.title}
                    </p>
                    {item.body && (
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed line-clamp-1">
                        {item.body}
                      </p>
                    )}
                    {item.createdAt && (
                      <p className="text-[11px] text-slate-300 mt-1 tabular-nums">
                        {new Date(item.createdAt).toLocaleDateString("ja-JP", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    )}
                  </div>

                  {/* 公開状態 */}
                  <div className="md:flex md:justify-center">
                    <StatusBadge item={item} />
                  </div>

                  {/* 操作ボタン */}
                  <div className="flex items-center gap-2 md:justify-end">
                    {locked ? (
                      <span
                        title="公開済みのため編集できません"
                        className="inline-flex items-center gap-1 text-xs text-slate-300 border border-slate-100 rounded-md px-2.5 py-1 cursor-not-allowed select-none"
                      >
                        <Lock size={10} strokeWidth={2} />
                        編集不可
                      </span>
                    ) : (
                      <Link
                        href={`/portal/news/${item.id}/edit`}
                        className="text-xs text-slate-600 border border-slate-200 rounded-md px-2.5 py-1 hover:bg-slate-100 hover:border-slate-300 transition-colors"
                      >
                        編集
                      </Link>
                    )}
                    <DeleteButton id={item.id} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
