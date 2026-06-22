import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { LiveWall } from "@/components/live-wall";

export const metadata: Metadata = {
  title: "Live Wall — Declarația ESG",
  robots: { index: false, follow: false },
};

export const revalidate = 0;

export default async function LiveWallPage() {
  const supabase = await createClient();
  const { data: declaration } = await supabase
    .from("declaration")
    .select("title, event_name")
    .eq("id", 1)
    .maybeSingle();

  const { data: signatures, count } = await supabase
    .from("signatures")
    .select("id, full_name, organization, signed_at", { count: "exact" })
    .order("signed_at", { ascending: false });

  return (
    <LiveWall
      title={declaration?.title ?? "Declarația ESG"}
      eventName={declaration?.event_name ?? null}
      initialSignatures={signatures ?? []}
      initialCount={count ?? signatures?.length ?? 0}
    />
  );
}
