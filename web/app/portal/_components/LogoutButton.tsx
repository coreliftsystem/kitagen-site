"use client";

// web/app/portal/_components/LogoutButton.tsx

import { LogOut } from "lucide-react";
import { logoutAction } from "@/app/portal/auth/actions";

export default function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-700 transition-colors"
      >
        <LogOut size={13} strokeWidth={1.8} />
        ログアウト
      </button>
    </form>
  );
}
