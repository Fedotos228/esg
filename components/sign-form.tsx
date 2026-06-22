"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  signatureSchema,
  type SignatureFormValues,
} from "@/lib/validation/signature-schema";

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
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
        <CheckCircle2 className="h-16 w-16 text-emerald-600" aria-hidden="true" />
        <h1 className="text-2xl font-semibold text-neutral-900">
          Semnătura ta a fost înregistrată!
        </h1>
        {totalSignatures !== null && (
          <p className="text-neutral-600">
            Numărul curent de semnatari: <span className="font-semibold">{totalSignatures}</span>
          </p>
        )}
        <p className="max-w-sm text-sm text-neutral-500">
          Îți mulțumim pentru implicare în susținerea Declarației ESG.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center gap-2 border-b border-neutral-200 bg-white px-4 py-4">
        <Leaf className="h-5 w-5 text-emerald-600" aria-hidden="true" />
        <span className="text-sm font-medium text-neutral-700">
          {eventName ?? "Declarație ESG"}
        </span>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <h1 className="mb-3 text-xl font-semibold text-neutral-900">{title}</h1>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-700">{body}</p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="sticky bottom-0 flex flex-col gap-4 border-t border-neutral-200 bg-white px-4 py-5 shadow-[0_-4px_12px_rgba(0,0,0,0.04)]"
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

        <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700">
          {isSubmitting ? "Se trimite..." : "Semnează Declarația"}
        </Button>
      </form>
    </div>
  );
}
