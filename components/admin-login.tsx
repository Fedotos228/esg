"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    setLoading(false);

    if (!response.ok) {
      const result = await response.json();
      setError(result.error ?? "Parolă incorectă.");
      return;
    }

    router.refresh();
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-brand-blue/5 via-white to-brand-green/5 px-4">
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-brand-green/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-brand-blue/20 blur-3xl" />

      <Card className="relative w-full max-w-sm border-neutral-200 shadow-xl shadow-neutral-200/50">
        <CardHeader className="items-center text-center">
          <Image
            src="/esg-title-platforma.png"
            alt="ESG pentru afaceri puternice"
            width={2400}
            height={303}
            className="mb-3 h-6 w-auto"
          />
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-brand-green to-brand-blue">
            <ShieldCheck className="h-6 w-6 text-white" aria-hidden="true" />
          </div>
          <CardTitle>Acces administrare</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Parolă</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-brand-green to-brand-blue text-white shadow-md shadow-brand-blue/20 hover:from-brand-green hover:to-brand-blue"
            >
              {loading ? "Se verifică..." : "Autentificare"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
