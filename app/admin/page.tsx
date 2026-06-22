import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, isValidAdminSessionToken } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/server";
import { AdminLogin } from "@/components/admin-login";
import { AdminDashboard } from "@/components/admin-dashboard";

export const metadata: Metadata = {
  title: "Admin — Declarația ESG",
  robots: { index: false, follow: false },
};

export const revalidate = 0;

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (!isValidAdminSessionToken(token)) {
    return <AdminLogin />;
  }

  const supabase = createAdminClient();
  const { data: signatures } = await supabase
    .from("signatures")
    .select("*")
    .order("signed_at", { ascending: false });

  return <AdminDashboard signatures={signatures ?? []} />;
}
