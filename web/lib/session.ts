// web/lib/session.ts
//
// セッション管理ユーティリティ。
//
// Web Crypto API を使用しているため Edge Runtime / Node.js 両方で動作する。
// HMAC-SHA256 で署名したトークンをクッキーに保存し、有効期限を検証する。
//
// 将来的な本格認証（DB認証・OAuth など）への差し替えは
// このファイルの verifyCredentials() と createSessionToken() を置き換えるだけで対応可能。
//
// 必要な環境変数：
//   SESSION_SECRET    ... トークン署名用シークレット（必須、本番は長いランダム文字列を設定）
//   ADMIN_USERNAME    ... 管理者ログインID
//   ADMIN_PASSWORD    ... 管理者パスワード

export const SESSION_COOKIE_NAME = "kitagen_admin_session";
const SESSION_DURATION_SEC = 60 * 60 * 24; // 24 時間

// ── 内部ユーティリティ ─────────────────────────────────────

function encodeBase64url(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function decodeBase64url(str: string): ArrayBuffer {
  const base64 = str
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(str.length + ((4 - (str.length % 4)) % 4), "=");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

async function getSigningKey(): Promise<CryptoKey> {
  const secret = process.env.SESSION_SECRET ?? "dev-only-insecure-fallback";
  const keyData = new TextEncoder().encode(secret);
  return crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

// ── 公開 API ──────────────────────────────────────────────

/**
 * ログイン成功時に呼び出す。クッキーにセットするトークン文字列を返す。
 * フォーマット: base64url(payload).base64url(hmac)
 */
export async function createSessionToken(): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + SESSION_DURATION_SEC;
  const payload = encodeBase64url(new TextEncoder().encode(JSON.stringify({ exp })));
  const key = await getSigningKey();
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return `${payload}.${encodeBase64url(sig)}`;
}

/**
 * ミドルウェア・サーバーサイドでセッションを検証する。
 * 有効なら true、不正・期限切れなら false を返す。
 */
export async function verifySessionToken(token: string): Promise<boolean> {
  try {
    const dot = token.lastIndexOf(".");
    if (dot === -1) return false;
    const payload = token.slice(0, dot);
    const sig = token.slice(dot + 1);
    const key = await getSigningKey();
    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      decodeBase64url(sig),
      new TextEncoder().encode(payload)
    );
    if (!isValid) return false;
    const decoded = JSON.parse(
      new TextDecoder().decode(decodeBase64url(payload))
    ) as { exp: number };
    return Math.floor(Date.now() / 1000) < decoded.exp;
  } catch {
    return false;
  }
}

/**
 * 認証情報を照合する（将来的な DB 認証への差し替えポイント）。
 * 現在は環境変数の固定ID/パスワードと照合する。
 */
export function verifyCredentials(username: string, password: string): boolean {
  const expectedUsername = process.env.ADMIN_USERNAME;
  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedUsername || !expectedPassword) {
    console.warn("[auth] ADMIN_USERNAME / ADMIN_PASSWORD が設定されていません。");
    return false;
  }
  return username === expectedUsername && password === expectedPassword;
}
