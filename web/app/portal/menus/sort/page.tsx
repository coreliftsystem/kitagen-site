import { redirect } from "next/navigation";

// レイアウト編集機能は /portal/menus に統合されました
export default function AdminMenusSortPage() {
  redirect("/portal/menus");
}
