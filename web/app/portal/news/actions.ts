"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isEffectivelyPublished } from "../../lib/adminAnnouncements";

const BASE_URL = process.env.MENU_API_BASE_URL ?? "http://localhost:3000";

// publishAt フォーム値（datetime-local: "YYYY-MM-DDTHH:mm"）を ISO8601 に変換する。
// 空文字 → null（即時公開 or 非公開）
function parsePublishAt(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const d = new Date(trimmed);
  if (isNaN(d.getTime())) return null;
  return d.toISOString();
}

// ── 新規作成 ───────────────────────────────────────────────

export async function createAnnouncement(formData: FormData) {
  const title       = String(formData.get("title") ?? "").trim();
  const body        = String(formData.get("body") ?? "").trim();
  const isPublished = formData.get("isPublished") === "on";
  const publishAt   = parsePublishAt(String(formData.get("publishAt") ?? ""));

  if (!title) {
    throw new Error("タイトルは必須です");
  }

  const res = await fetch(`${BASE_URL}/api/admin/announcements`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ title, body, isPublished, publishAt }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "作成に失敗しました");
  }

  revalidatePath("/portal/news");
  revalidatePath("/");
  revalidatePath("/news");
  redirect("/portal/news");
}

// ── 更新（実効公開前のみ可） ──────────────────────────────

export async function updateAnnouncement(id: string, formData: FormData) {
  // サーバー側でも公開済みチェック（UI をすり抜けた直接リクエスト対策）
  // 「実効公開済み」= isPublished=true かつ publishAt が過去（または null）
  const currentRes = await fetch(`${BASE_URL}/api/admin/announcements/${id}`, {
    cache: "no-store",
  });
  if (currentRes.ok) {
    const current = await currentRes.json();
    if (current.item && isEffectivelyPublished(current.item)) {
      throw new Error("公開済みのお知らせは編集できません");
    }
  }

  const title       = String(formData.get("title") ?? "").trim();
  const body        = String(formData.get("body") ?? "").trim();
  const isPublished = formData.get("isPublished") === "on";
  const publishAt   = parsePublishAt(String(formData.get("publishAt") ?? ""));

  if (!title) {
    throw new Error("タイトルは必須です");
  }

  const res = await fetch(`${BASE_URL}/api/admin/announcements/${id}`, {
    method:  "PUT",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ title, body, isPublished, publishAt }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "更新に失敗しました");
  }

  revalidatePath("/portal/news");
  revalidatePath("/");
  revalidatePath("/news");
  redirect("/portal/news");
}

// ── 削除（論理削除） ──────────────────────────────────────

export async function deleteAnnouncement(id: string) {
  const res = await fetch(`${BASE_URL}/api/admin/announcements/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "削除に失敗しました");
  }

  revalidatePath("/portal/news");
  revalidatePath("/");
  revalidatePath("/news");
}
