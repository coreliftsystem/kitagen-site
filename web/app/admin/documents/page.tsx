import type { Metadata } from "next";
import { listDocuments } from "../../lib/adminDocuments";
import DocumentManager from "./_components/DocumentManager";

export const metadata: Metadata = { title: "資料管理 | きたげん管理画面" };

export default async function DocumentsPage() {
  const [menuDocs, calendarDocs] = await Promise.all([
    listDocuments("menu"),
    listDocuments("calendar"),
  ]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-bold text-slate-800">資料管理</h1>
        <p className="text-sm text-slate-500 mt-1">
          メニュー資料・カレンダー資料のアップロードと公開管理。
          PDF・JPG・PNG・WEBP に対応しています。
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <DocumentManager menuDocs={menuDocs} calendarDocs={calendarDocs} />
      </div>
    </div>
  );
}
