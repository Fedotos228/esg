import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { signatureSchema } from "@/lib/validation/signature-schema";
import { sanitizeText } from "@/lib/sanitize";
import { isRateLimited } from "@/lib/rate-limit";

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Prea multe cereri. Încearcă din nou în câteva secunde." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corp de cerere invalid." }, { status: 400 });
  }

  const parsed = signatureSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Date invalide.", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { full_name, organization, position, email, agreed } = parsed.data;

  const supabase = createAdminClient();

  if (email) {
    const { data: existing } = await supabase
      .from("signatures")
      .select("id")
      .eq("email", sanitizeText(email))
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "Această adresă de email a semnat deja declarația." },
        { status: 409 }
      );
    }
  }

  const { data, error } = await supabase
    .from("signatures")
    .insert({
      full_name: sanitizeText(full_name),
      organization: sanitizeText(organization),
      position: position ? sanitizeText(position) : null,
      email: email ? sanitizeText(email) : null,
      agreed,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Nu am putut salva semnătura. Încearcă din nou." },
      { status: 500 }
    );
  }

  const { count } = await supabase
    .from("signatures")
    .select("id", { count: "exact", head: true });

  return NextResponse.json({ id: data.id, totalSignatures: count ?? 0 }, { status: 201 });
}
