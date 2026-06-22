# Declarația ESG — Platformă de semnare colectivă

Platformă web pentru semnarea colectivă a unei Declarații ESG în cadrul unui eveniment de business: participanții scanează un cod QR, semnează de pe telefon, iar semnatarii apar în timp real pe ecranul din sală.

## Stack

- Next.js 14+ (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (PostgreSQL + Realtime)
- `qrcode`, `react-hook-form` + `zod`, `papaparse` (export CSV)

## Rute

- `/sign` — pagina publică de semnare (accesată din QR)
- `/live-wall` — ecran fullscreen proiectat în sală, actualizat în timp real
- `/admin` — dashboard protejat cu parolă (`ADMIN_PASSWORD`)
- `/admin/qr` — generator + descărcare cod QR (PNG/SVG)
- `POST /api/signatures` — salvare semnătură (rate limit 1 req/IP/10s)

## Setup

1. Creează un proiect [Supabase](https://supabase.com).
2. Rulează schema din `supabase/schema.sql` în SQL editor-ul Supabase (creează tabelele `signatures` și `declaration`, activează Realtime și RLS).
3. Copiază `.env.example` în `.env.local` și completează valorile:

   ```bash
   cp .env.example .env.local
   ```

   - `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — din Project Settings → API.
   - `SUPABASE_SERVICE_ROLE_KEY` — folosit doar server-side (API routes admin/signatures), nu îl expune public.
   - `NEXT_PUBLIC_APP_URL` — URL-ul de producție (folosit pentru generarea QR-ului).
   - `ADMIN_PASSWORD` — parola pentru `/admin` și `/admin/qr`.

4. Instalează dependențele și pornește serverul de dezvoltare:

   ```bash
   npm install
   npm run dev
   ```

5. Editează textul declarației direct în tabelul `declaration` din Supabase (rândul cu `id = 1`).

## Note

- Rate limiting-ul de pe `/api/signatures` este in-memory per instanță — suficient pentru un singur eveniment, dar nu garantează limitarea globală pe un deploy serverless cu mai multe instanțe concurente.
- `/live-wall` și `/admin*` au `robots: noindex`.

## Deploy

Conectează repo-ul la [Vercel](https://vercel.com/new) și adaugă variabilele de mediu de mai sus în setările proiectului.
