"use client";

import { useActionState, useEffect } from "react";
import { loginAction } from "./actions";
import type { LoginState } from "./actions";

const initialState: LoginState = {};

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  // cookie がブラウザに保存されてからハードナビゲーションする
  // (redirect() によるソフトナビゲーションはミドルウェアと競合するため使わない)
  useEffect(() => {
    if (state.success) {
      window.location.replace("/portal");
    }
  }, [state.success]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* ── タイトル ────────────────────────────────────── */}
        <div className="text-center mb-8">
          <p className="text-[10px] tracking-[0.35em] text-slate-400 uppercase mb-2">
            Admin
          </p>
          <h1 className="text-2xl font-bold text-slate-800 tracking-wide">
            きたげん
          </h1>
          <p className="text-xs text-slate-500 mt-1 tracking-widest">
            管理画面
          </p>
        </div>

        {/* ── フォームカード ──────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-8 py-8">
          <form action={formAction} className="space-y-5">

            {/* 管理者ID */}
            <div>
              <label
                htmlFor="username"
                className="block text-xs font-medium text-slate-600 mb-1.5 tracking-wide"
              >
                管理者ID
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                autoComplete="username"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-400 transition-all placeholder:text-slate-300"
                placeholder="admin"
              />
            </div>

            {/* パスワード */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-medium text-slate-600 mb-1.5 tracking-wide"
              >
                パスワード
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-400 transition-all placeholder:text-slate-300"
                placeholder="••••••••"
              />
            </div>

            {/* エラーメッセージ */}
            {state.error && (
              <div className="px-3.5 py-2.5 bg-red-50 border border-red-100 rounded-lg">
                <p className="text-xs text-red-600">{state.error}</p>
              </div>
            )}

            {/* ログインボタン */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-300 text-white text-sm font-medium rounded-lg transition-colors tracking-wide mt-1"
            >
              {isPending ? "確認中…" : "ログイン"}
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] text-slate-300 mt-6">
          © きたげん
        </p>
      </div>
    </div>
  );
}
