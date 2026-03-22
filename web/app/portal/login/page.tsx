import { redirect } from "next/navigation";

// /portal/login は /portal/auth に統合されました
export default function LoginRedirect() {
  redirect("/portal/auth");
}
