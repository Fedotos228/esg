import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, isValidAdminSessionToken } from "@/lib/admin-auth";
import { AdminLogin } from "@/components/admin-login";
import { QrGenerator } from "@/components/qr-generator";

export const metadata: Metadata = {
  title: "Generator QR — Declarația ESG",
  robots: { index: false, follow: false },
};

export default async function QrPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (!isValidAdminSessionToken(token)) {
    return <AdminLogin />;
  }

  const signUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/sign`;

  return <QrGenerator signUrl={signUrl} />;
}
