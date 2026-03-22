import type { Metadata } from "next";
import AdminShell from "./_components/AdminShell";

export const metadata: Metadata = {
  title: "管理画面 | きたげん",
  icons: {
    icon: "/favicon.png",
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShell>{children}</AdminShell>;
}
