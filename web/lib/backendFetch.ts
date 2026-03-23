// web/lib/backendFetch.ts
//
// バックエンド API へのリクエストに認証ヘッダーを自動付与する fetch ラッパー。
// BACKEND_ADMIN_TOKEN を Authorization: Bearer として送信する。

export function backendFetch(
  url: string | URL,
  init: RequestInit = {}
): Promise<Response> {
  const token = process.env.BACKEND_ADMIN_TOKEN ?? "";
  const authHeader: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
  return fetch(url, {
    ...init,
    headers: { ...authHeader, ...(init.headers as Record<string, string> ?? {}) },
  });
}
