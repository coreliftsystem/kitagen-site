"use client";

import { useFormStatus } from "react-dom";
import type { AdminAnnouncement } from "../../../lib/adminAnnouncements";

interface Props {
  action: (formData: FormData) => Promise<void>;
  initialData?: Partial<AdminAnnouncement>;
  submitLabel?: string;
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-5 py-2.5 bg-slate-800 text-white text-sm rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {pending ? "送信中..." : label}
    </button>
  );
}

/** datetime-local input の value 形式（"YYYY-MM-DDTHH:mm"）に変換する */
function toDatetimeLocalValue(iso: string | null | undefined): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    return (
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
      `T${pad(d.getHours())}:${pad(d.getMinutes())}`
    );
  } catch {
    return "";
  }
}

export default function NewsForm({
  action,
  initialData,
  submitLabel = "保存する",
}: Props) {
  return (
    <form action={action} className="space-y-6">
      {/* タイトル */}
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          タイトル
          <span className="ml-1 text-xs text-red-400">*必須</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          defaultValue={initialData?.title ?? ""}
          placeholder="例：年末年始の営業について"
          className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent transition"
        />
      </div>

      {/* 本文 */}
      <div>
        <label
          htmlFor="body"
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          本文
          <span className="ml-1.5 text-xs text-slate-400">任意</span>
        </label>
        <textarea
          id="body"
          name="body"
          rows={5}
          defaultValue={initialData?.body ?? ""}
          placeholder="お知らせの内容を入力してください"
          className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent transition resize-y"
        />
      </div>

      {/* 公開設定 */}
      <div className="border-t border-slate-100 pt-4 space-y-4">
        <p className="text-xs font-medium text-slate-500 tracking-wide uppercase">
          公開設定
        </p>

        {/* 公開チェックボックス */}
        <div>
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              name="isPublished"
              defaultChecked={initialData?.isPublished ?? false}
              className="w-4 h-4 rounded border-slate-300 text-slate-800 focus:ring-slate-300"
            />
            <span className="text-sm font-medium text-slate-700">公開する</span>
          </label>
          <p className="text-xs text-slate-400 mt-1.5 ml-6.5">
            チェックすると公式サイトに表示されます。公開後は編集できません。
          </p>
        </div>

        {/* 公開開始日時 */}
        <div>
          <label
            htmlFor="publishAt"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            公開開始日時
            <span className="ml-1.5 text-xs text-slate-400">任意</span>
          </label>
          <input
            id="publishAt"
            name="publishAt"
            type="datetime-local"
            defaultValue={toDatetimeLocalValue(initialData?.publishAt)}
            className="w-full sm:w-auto px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent transition"
          />
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            空欄の場合は「公開する」にチェックした時点で即時公開されます。<br />
            日時を設定すると、その日時を過ぎるまで表示されません（予約公開）。
          </p>
        </div>
      </div>

      {/* 送信ボタン */}
      <div className="flex items-center gap-3 pt-2">
        <SubmitButton label={submitLabel} />
        <a
          href="/admin/news"
          className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          キャンセル
        </a>
      </div>
    </form>
  );
}
