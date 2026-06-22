import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { SignForm } from "@/components/sign-form";

export const metadata: Metadata = {
  title: "Semnează Declarația ESG",
  description:
    "Semnează colectiv Declarația ESG a evenimentului direct de pe telefon, scanând codul QR.",
};

export const revalidate = 0;

export default async function SignPage() {
  const supabase = await createClient();
  const { data: declaration } = await supabase
    .from("declaration")
    .select("title, body, event_name, event_date")
    .eq("id", 1)
    .maybeSingle();

  return (
    <main className="flex min-h-screen flex-col bg-neutral-50">
      <SignForm
        title={declaration?.title ?? "Declarația ESG"}
        body={
          declaration?.body ??
          "Conținutul declarației nu a putut fi încărcat. Contactează organizatorii evenimentului."
        }
        eventName={declaration?.event_name ?? null}
      />
    </main>
  );
}
