import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/types/signature";

export function createClient() {
  return createBrowserClient<Database, "public">(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
