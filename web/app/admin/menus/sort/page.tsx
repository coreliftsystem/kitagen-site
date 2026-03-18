import { redirect } from "next/navigation";

// レイアウト編集機能は /admin/menus に統合されました
export default function AdminMenusSortPage() {
  redirect("/admin/menus");
}
