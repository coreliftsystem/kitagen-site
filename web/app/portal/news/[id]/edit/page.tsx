import { notFound, redirect } from "next/navigation";
import {
  getAdminAnnouncement,
  isEffectivelyPublished,
} from "../../../../lib/adminAnnouncements";
import { updateAnnouncement } from "../../actions";
import NewsForm from "../../_components/NewsForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminNewsEditPage({ params }: Props) {
  const { id } = await params;
  const item = await getAdminAnnouncement(id);

  if (!item) {
    notFound();
  }

  // 実効公開済み（isPublished=true かつ publishAt が過去 or null）は編集不可
  if (isEffectivelyPublished(item)) {
    redirect("/portal/news");
  }

  async function updateAction(formData: FormData) {
    "use server";
    await updateAnnouncement(id, formData);
  }

  return (
    <div>
      {/* ── ページヘッダー ────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
          <a
            href="/portal/news"
            className="hover:text-slate-600 transition-colors"
          >
            お知らせ管理
          </a>
          <span>/</span>
          <span className="text-slate-600 truncate max-w-[200px]">
            {item.title}
          </span>
          <span>/</span>
          <span className="text-slate-600">編集</span>
        </div>
        <h1 className="text-xl font-bold text-slate-800">お知らせを編集</h1>
      </div>

      {/* ── フォーム ──────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8 max-w-2xl">
        <NewsForm
          action={updateAction}
          initialData={item}
          submitLabel="変更を保存する"
        />
      </div>
    </div>
  );
}
