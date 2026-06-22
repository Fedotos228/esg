"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface QrGeneratorProps {
  signUrl: string;
}

export function QrGenerator({ signUrl }: QrGeneratorProps) {
  const [pngDataUrl, setPngDataUrl] = useState<string | null>(null);
  const [svgMarkup, setSvgMarkup] = useState<string | null>(null);

  useEffect(() => {
    QRCode.toDataURL(signUrl, { width: 512, margin: 2 }).then(setPngDataUrl);
    QRCode.toString(signUrl, { type: "svg", width: 512, margin: 2 }).then(setSvgMarkup);
  }, [signUrl]);

  function downloadPng() {
    if (!pngDataUrl) return;
    const link = document.createElement("a");
    link.href = pngDataUrl;
    link.download = "qr-declaratie-esg.png";
    link.click();
  }

  function downloadSvg() {
    if (!svgMarkup) return;
    const blob = new Blob([svgMarkup], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "qr-declaratie-esg.svg";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="flex min-h-screen flex-col items-center gap-6 bg-neutral-50 px-4 py-10">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          className="mb-2"
          render={<Link href="/admin">← Înapoi la administrare</Link>}
        />
        <Card>
          <CardHeader>
            <CardTitle>Generator QR — Pagina de semnare</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <p className="break-all text-center text-sm text-neutral-500">{signUrl}</p>
            {pngDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={pngDataUrl}
                alt="Cod QR către pagina de semnare"
                width={256}
                height={256}
                className="rounded-lg border border-neutral-200"
              />
            ) : (
              <div className="flex h-64 w-64 items-center justify-center rounded-lg border border-neutral-200 text-sm text-neutral-400">
                Se generează...
              </div>
            )}
            <div className="flex w-full gap-2">
              <Button className="flex-1" onClick={downloadPng} disabled={!pngDataUrl}>
                Descarcă PNG
              </Button>
              <Button
                className="flex-1"
                variant="outline"
                onClick={downloadSvg}
                disabled={!svgMarkup}
              >
                Descarcă SVG
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
