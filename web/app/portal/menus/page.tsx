import { getAdminMenus } from "../../lib/adminMenus";
import LayoutEditor from "./_components/LayoutEditor";

export default async function AdminMenusPage() {
  const menus = await getAdminMenus();

  if (menus.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 py-16 text-center">
        <p className="text-slate-400 text-sm">メニューデータが取得できませんでした</p>
        <p className="text-xs text-slate-300 mt-1">バックエンドの接続設定を確認してください</p>
      </div>
    );
  }

  return <LayoutEditor items={menus} />;
}
