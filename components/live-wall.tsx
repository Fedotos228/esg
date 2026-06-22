"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import type { Signature } from "@/lib/types/signature";

type LiveSignature = Pick<Signature, "id" | "full_name" | "organization" | "signed_at">;

interface LiveWallProps {
  title: string;
  eventName: string | null;
  initialSignatures: LiveSignature[];
  initialCount: number;
}

export function LiveWall({ title, eventName, initialSignatures, initialCount }: LiveWallProps) {
  const [signatures, setSignatures] = useState<LiveSignature[]>(initialSignatures);
  const [count, setCount] = useState(initialCount);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("signatures-live")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "signatures" },
        (payload) => {
          const newSignature = payload.new as Signature;
          setSignatures((prev) => [newSignature, ...prev]);
          setCount((prev) => prev + 1);
          setPulse(true);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-radial-[at_top] from-neutral-800 via-neutral-950 to-black px-8 py-6 text-white">
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-brand-green/10 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-32 h-96 w-96 rounded-full bg-brand-blue/15 blur-3xl" />

      <header className="relative z-10 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-6 py-4 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Image
            src="/esg-title-platforma.png"
            alt="ESG pentru afaceri puternice"
            width={2400}
            height={303}
            className="h-7 w-auto"
            priority
          />
          <div>
            <h1 className="text-2xl font-semibold">{title}</h1>
            {eventName && <p className="text-sm text-neutral-400">{eventName}</p>}
          </div>
        </div>
        <div
          onAnimationEnd={() => setPulse(false)}
          className={`rounded-2xl bg-gradient-to-br from-brand-green/20 to-brand-blue/20 px-7 py-3 text-right ring-1 ring-white/10 ${
            pulse ? "animate-counter-pulse" : ""
          }`}
        >
          <span className="block text-4xl font-bold text-white">{count}</span>
          <span className="text-xs tracking-wide text-neutral-300">SEMNATARI</span>
        </div>
      </header>

      <div className="relative z-10 mt-8 grid flex-1 grid-cols-2 gap-4 overflow-y-auto sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {signatures.map((signature) => (
          <div
            key={signature.id}
            className="animate-in fade-in slide-in-from-bottom-4 rounded-xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-black/20 duration-500"
          >
            <p className="truncate text-lg font-bold text-white">{signature.full_name}</p>
            <p className="truncate text-sm text-neutral-400">{signature.organization}</p>
          </div>
        ))}
      </div>

      <div className="relative z-10 mt-6 rounded-2xl bg-white px-6 py-3 shadow-lg">
        <Image
          src="/esg-logos-platforma.png"
          alt="Parteneri"
          width={2897}
          height={322}
          className="h-auto w-full"
        />
      </div>
    </main>
  );
}
