"use client";

import { useTransition } from "react";
import { deleteAnnouncement } from "../actions";

export default function DeleteButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm("このお知らせを削除しますか？\nこの操作は取り消せません。")) {
      return;
    }
    startTransition(async () => {
      await deleteAnnouncement(id);
      // revalidatePath により一覧ページが更新されるが、
      // クライアント側のリロードも保険として行う
      window.location.reload();
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="text-xs text-red-400 border border-red-200 rounded-md px-2.5 py-1 hover:bg-red-50 hover:text-red-600 hover:border-red-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
    >
      {isPending ? "削除中..." : "削除"}
    </button>
  );
}
