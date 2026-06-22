import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, isValidAdminSessionToken } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (!isValidAdminSessionToken(token)) {
    return NextResponse.json({ error: "Neautorizat." }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("signatures")
    .delete()
    .not("id", "is", null);

  if (error) {
    return NextResponse.json({ error: "Nu am putut reseta semnăturile." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
