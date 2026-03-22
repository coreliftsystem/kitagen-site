import type { Metadata } from "next";
import { listDocuments } from "../../lib/adminDocuments";
import SiteImageManager from "./_components/SiteImageManager";

export const metadata: Metadata = { title: "サイト画像管理 | きたげん管理画面" };

export default async function TopAdminPage() {
  const [topDocs, shopDocs] = await Promise.all([
    listDocuments("top"),
    listDocuments("shop"),
  ]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-bold text-slate-800">サイト画像管理</h1>
        <p className="text-sm text-slate-500 mt-1">
          トップページの各セクションに表示する画像を管理します。
          画像はCloudinaryに保存され、アップロード後すぐに反映されます。
        </p>
      </div>

      <SiteImageManager topDocs={topDocs} shopDocs={shopDocs} />
    </div>
  );
}
