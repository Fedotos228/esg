"use client";

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  signatureSchema,
  type SignatureFormValues,
} from "@/lib/validation/signature-schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { CheckCircle2 } from "lucide-react"
import Image from "next/image"
import { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"

const SIGNED_FLAG_KEY = "esg-declaration-signed";

interface SignFormProps {
  title: string;
  body: string;
  eventName: string | null;
}

export function SignForm({ title, body, eventName }: SignFormProps) {
  const [alreadySigned, setAlreadySigned] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [totalSignatures, setTotalSignatures] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SignatureFormValues>({
    resolver: zodResolver(signatureSchema),
    defaultValues: {
      full_name: "",
      organization: "",
      position: "",
      email: "",
      agreed: false,
    },
  });

  useEffect(() => {
    if (localStorage.getItem(SIGNED_FLAG_KEY)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync with localStorage on mount
      setAlreadySigned(true);
    }
  }, []);

  async function onSubmit(values: SignatureFormValues) {
    setSubmitError(null);

    try {
      const response = await fetch("/api/signatures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (!response.ok) {
        setSubmitError(result.error ?? "A apărut o eroare. Încearcă din nou.");
        return;
      }

      localStorage.setItem(SIGNED_FLAG_KEY, "1");
      setTotalSignatures(result.totalSignatures ?? null);
      setAlreadySigned(true);
    } catch {
      setSubmitError("Eroare de conexiune. Verifică internetul și încearcă din nou.");
    }
  }

  if (alreadySigned) {
    return (
      <div className="relative flex flex-1 flex-col items-center justify-center gap-5 overflow-hidden px-6 py-16 text-center">
        <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-brand-green/25 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-brand-blue/20 blur-3xl" />

        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-brand-green to-brand-blue shadow-lg shadow-brand-blue/20">
          <CheckCircle2 className="h-10 w-10 text-white" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-semibold text-neutral-900">
          Semnătura ta a fost înregistrată!
        </h1>
        {totalSignatures !== null && (
          <p className="rounded-full bg-neutral-100 px-4 py-1.5 text-sm text-neutral-700">
            Numărul curent de semnatari:{" "}
            <span className="font-semibold text-brand-blue">{totalSignatures}</span>
          </p>
        )}
        <p className="max-w-sm text-sm text-neutral-500">
          Îți mulțumim pentru implicare în susținerea Declarației ESG.
        </p>
        <div className="mt-2 w-full max-w-md rounded-2xl border border-neutral-200 bg-white/70 p-4">
          <p className="mb-2 text-[10px] font-semibold tracking-wider text-neutral-400 uppercase">
            Cu sprijinul
          </p>
          <Image
            src="/esg-logos-platforma.png"
            alt="Parteneri"
            width={2897}
            height={322}
            className="h-auto w-full"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-gradient-to-b from-brand-green/5 via-white to-brand-blue/5">
      <header className="sticky top-0 z-10 flex flex-col gap-1.5 border-b border-neutral-200/80 bg-white/80 px-4 py-4 backdrop-blur-md">
        <Image
          src="/esg-title-platforma.png"
          alt="ESG pentru afaceri puternice"
          width={300}
          height={32}
          className="h-5 w-fit"
          priority
        />
        {eventName && (
          <span className="text-xs font-medium text-neutral-500">{eventName}</span>
        )}
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <div className="h-1.5 w-full bg-gradient-to-r from-brand-green to-brand-blue" />
          <div className="p-5">
            <h1 className="mb-3 text-xl font-semibold text-neutral-900">{title}</h1>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-700">
              {body}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-neutral-200 bg-white/70 p-4">
          <p className="mb-2 text-[10px] font-semibold tracking-wider text-neutral-400 uppercase">
            Cu sprijinul
          </p>
          <Image
            src="/esg-logos-platforma.png"
            alt="Parteneri"
            width={2897}
            height={322}
            className="h-auto w-full"
          />
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="sticky bottom-0 flex flex-col gap-4 rounded-t-3xl border-t border-neutral-200 bg-white/95 px-4 py-5 shadow-[0_-8px_24px_rgba(0,0,0,0.06)] backdrop-blur-md"
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="full_name">Nume complet</Label>
          <Input
            id="full_name"
            autoComplete="name"
            aria-invalid={!!errors.full_name}
            aria-describedby={errors.full_name ? "full_name-error" : undefined}
            {...register("full_name")}
          />
          {errors.full_name && (
            <p id="full_name-error" className="text-xs text-red-600">
              {errors.full_name.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="organization">Organizație</Label>
          <Input
            id="organization"
            autoComplete="organization"
            aria-invalid={!!errors.organization}
            aria-describedby={errors.organization ? "organization-error" : undefined}
            {...register("organization")}
          />
          {errors.organization && (
            <p id="organization-error" className="text-xs text-red-600">
              {errors.organization.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="position">Funcție / Poziție (opțional)</Label>
          <Input
            id="position"
            autoComplete="organization-title"
            {...register("position")}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email (opțional)</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            {...register("email")}
          />
          {errors.email && (
            <p id="email-error" className="text-xs text-red-600">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="flex items-start gap-2">
          <Controller
            name="agreed"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="agreed"
                checked={field.value === true}
                aria-invalid={!!errors.agreed}
                aria-describedby={errors.agreed ? "agreed-error" : undefined}
                onCheckedChange={(checked) => field.onChange(checked === true)}
              />
            )}
          />
          <Label htmlFor="agreed" className="text-sm leading-snug font-normal">
            Confirm că am citit și susțin această declarație
          </Label>
        </div>
        {errors.agreed && <p className="text-xs text-red-600">{errors.agreed.message}</p>}

        {submitError && <p className="text-sm text-red-600">{submitError}</p>}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-gradient-to-r from-brand-green to-brand-blue text-white shadow-md shadow-brand-blue/20 transition-transform hover:scale-[1.01] hover:from-brand-green hover:to-brand-blue active:scale-[0.99]"
        >
          {isSubmitting ? "Se trimite..." : "Semnează Declarația"}
        </Button>
      </form>
    </div>
  );
}
