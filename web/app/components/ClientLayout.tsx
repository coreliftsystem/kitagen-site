"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

interface Props {
  header: ReactNode;
  footer: ReactNode;
  children: ReactNode;
}

/**
 * パスに応じてサイト共通ヘッダー・フッターを出し分けるクライアント境界。
 * /admin 配下では公開サイトの Header/Footer を非表示にし、
 * 管理画面独自のレイアウトに完全に委ねる。
 */
export default function ClientLayout({ header, footer, children }: Props) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    // 管理画面: main ラッパーもヘッダー/フッターも外す
    return <>{children}</>;
  }

  return (
    <>
      {header}
      <main className="pt-16">{children}</main>
      {footer}
    </>
  );
}
