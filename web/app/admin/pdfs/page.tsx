import type { Metadata } from "next";
import { listPdfs } from "../../lib/adminPdfs";
import PdfManager from "./_components/PdfManager";

export const metadata: Metadata = { title: "PDF管理 | きたげん管理画面" };

export default async function PdfsPage() {
  const [menuPdfs, calendarPdfs] = await Promise.all([
    listPdfs("menu"),
    listPdfs("calendar"),
  ]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-bold text-slate-800">PDF管理</h1>
        <p className="text-sm text-slate-500 mt-1">
          メニューPDFとカレンダーPDFを管理します。
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <PdfManager menuPdfs={menuPdfs} calendarPdfs={calendarPdfs} />
      </div>
    </div>
  );
}
