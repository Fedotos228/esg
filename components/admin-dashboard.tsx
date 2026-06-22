"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Signature } from "@/lib/types/signature";

interface AdminDashboardProps {
  signatures: Signature[];
}

export function AdminDashboard({ signatures }: AdminDashboardProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [resetting, setResetting] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return signatures;
    return signatures.filter(
      (signature) =>
        signature.full_name.toLowerCase().includes(query) ||
        signature.organization.toLowerCase().includes(query)
    );
  }, [signatures, search]);

  function handleExportCsv() {
    const csv = Papa.unparse(
      signatures.map((signature) => ({
        Nume: signature.full_name,
        Organizatie: signature.organization,
        Functie: signature.position ?? "",
        Email: signature.email ?? "",
        "Data semnarii": new Date(signature.signed_at).toLocaleString("ro-RO"),
      }))
    );

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `semnatari-esg-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function handleReset() {
    setResetting(true);
    const response = await fetch("/api/admin/reset", { method: "POST" });
    setResetting(false);
    setResetOpen(false);

    if (response.ok) {
      router.refresh();
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-neutral-50 to-white px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-white px-5 py-4 shadow-sm">
          <div className="flex items-center gap-4">
            <Image
              src="/esg-title-platforma.png"
              alt="ESG pentru afaceri puternice"
              width={2400}
              height={303}
              className="h-6 w-auto"
            />
            <div className="h-8 w-px bg-neutral-200" />
            <div>
              <h1 className="text-xl font-semibold text-neutral-900">Administrare semnături</h1>
              <Badge className="mt-1 bg-gradient-to-r from-brand-green to-brand-blue text-white">
                {signatures.length} semnatari
              </Badge>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href="/live-wall">Live Wall</Link>}
            />
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href="/sign">Pagina de semnare</Link>}
            />
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href="/admin/qr">Generator QR</Link>}
            />
            <Button variant="ghost" onClick={handleLogout}>
              Deconectare
            </Button>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <Input
            placeholder="Caută după nume sau organizație..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="max-w-xs"
          />
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportCsv}>
              Export CSV
            </Button>
            <Dialog open={resetOpen} onOpenChange={setResetOpen}>
              <DialogTrigger render={<Button variant="destructive">Resetează semnăturile</Button>} />
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ștergi toate semnăturile?</DialogTitle>
                  <DialogDescription>
                    Această acțiune este ireversibilă și va șterge definitiv toți cei{" "}
                    {signatures.length} semnatari înregistrați.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setResetOpen(false)}>
                    Anulează
                  </Button>
                  <Button variant="destructive" disabled={resetting} onClick={handleReset}>
                    {resetting ? "Se șterge..." : "Confirmă ștergerea"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nume</TableHead>
                <TableHead>Organizație</TableHead>
                <TableHead>Funcție</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Data semnării</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((signature) => (
                <TableRow key={signature.id}>
                  <TableCell className="font-medium">{signature.full_name}</TableCell>
                  <TableCell>{signature.organization}</TableCell>
                  <TableCell>{signature.position ?? "—"}</TableCell>
                  <TableCell>{signature.email ?? "—"}</TableCell>
                  <TableCell>
                    {new Date(signature.signed_at).toLocaleString("ro-RO")}
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-neutral-500">
                    Niciun rezultat.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </main>
  );
}
