"use client";

import { useEffect, useState } from "react";
import { Leaf } from "lucide-react";
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
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <main className="flex min-h-screen flex-col bg-neutral-950 px-8 py-6 text-white">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Leaf className="h-8 w-8 text-emerald-400" aria-hidden="true" />
          <div>
            <h1 className="text-2xl font-semibold">{title}</h1>
            {eventName && <p className="text-sm text-neutral-400">{eventName}</p>}
          </div>
        </div>
        <div className="rounded-full bg-emerald-500/10 px-6 py-3 text-right">
          <span className="block text-3xl font-bold text-emerald-400">{count}</span>
          <span className="text-xs tracking-wide text-emerald-300">SEMNATARI</span>
        </div>
      </header>

      <div className="mt-8 grid flex-1 grid-cols-2 gap-4 overflow-y-auto sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {signatures.map((signature) => (
          <div
            key={signature.id}
            className="animate-in fade-in slide-in-from-bottom-4 rounded-xl border border-white/10 bg-white/5 p-4 duration-500"
          >
            <p className="truncate text-lg font-bold text-white">{signature.full_name}</p>
            <p className="truncate text-sm text-neutral-400">{signature.organization}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
