# Prompt: Platformă Digitală de Semnare a Declarației ESG

## Contextul proiectului

Construiește o platformă web pentru semnarea colectivă a unei Declarații ESG în cadrul unui eveniment de business. Reprezentanții asociațiilor de afaceri scanează un cod QR în timpul evenimentului, semnează declarația de pe telefon, iar lista semnatarilor apare în timp real pe ecranul principal din sală.

---

## Stack tehnic

- **Framework:** Next.js 14+ cu App Router
- **Limbaj:** TypeScript (strict mode)
- **Styling:** Tailwind CSS + shadcn/ui
- **Backend / DB:** Supabase (PostgreSQL + Realtime + Auth)
- **Deploy:** Vercel
- **QR Code:** librăria `qrcode` (npm)

---

## Schema bazei de date (Supabase)

```sql
-- Tabel principal semnatari
create table signatures (
  id uuid default gen_random_uuid() primary key,
  full_name text not null,
  organization text not null,
  position text,
  email text,
  agreed boolean not null default true,
  signed_at timestamp with time zone default now()
);

-- Tabel pentru declarație (conținut editabil)
create table declaration (
  id int primary key default 1,
  title text not null,
  body text not null,
  event_name text,
  event_date date,
  updated_at timestamp with time zone default now()
);

-- Enable Realtime pe tabelul signatures
alter publication supabase_realtime add table signatures;
```

---

## Structura rutelor (Next.js App Router)

```
app/
├── page.tsx                  → Redirect către /sign
├── sign/
│   └── page.tsx              → Pagina publică de semnare (accesată prin QR)
├── live-wall/
│   └── page.tsx              → Ecran fullscreen pentru proiectat în sală
├── admin/
│   ├── page.tsx              → Dashboard admin (protejat cu parolă)
│   └── qr/
│       └── page.tsx          → Generare și descărcare QR code
└── api/
    └── signatures/
        └── route.ts          → POST /api/signatures (salvare semnătură)
```

---

## Specificații pe pagini

### 1. `/sign` — Pagina de semnare

**Comportament:**
- Afișează titlul și textul complet al Declarației ESG
- Formular de semnare cu câmpurile:
  - Nume complet (required)
  - Organizație (required)
  - Funcție/Poziție (optional)
  - Email (optional, pentru trimiterea unei confirmări)
  - Checkbox: „Confirm că am citit și susțin această declarație" (required)
- Buton „Semnează Declarația"
- După submit: ecran de confirmare cu mesajul „Semnătura ta a fost înregistrată!" și numărul curent de semnatari
- Validare client-side cu React Hook Form + Zod
- Previne submisii duplicate (verificare după email sau localStorage flag)
- Design responsive, optimizat pentru mobil (majoritatea vor accesa de pe telefon)

**UI/UX:**
- Design sobru, profesional, culori neutre cu accent de verde (ESG = sustenabilitate)
- Textul declarației scroll-abil, formular ancorat jos
- Loading state pe buton în timpul submit-ului

---

### 2. `/live-wall` — Ecranul din sală

**Comportament:**
- Fullscreen, fără header/nav
- Afișează în timp real lista semnatarilor pe măsură ce aceștia semnează
- Fiecare semnătură nouă apare cu animație subtilă (fade-in + slide)
- Counter vizibil în colțul paginii: „X semnatari"
- Actualizare prin Supabase Realtime (fără polling, fără refresh)
- Nu necesită autentificare (pagină publică, dar obscurity prin URL)

**Implementare Realtime:**
```typescript
useEffect(() => {
  const channel = supabase
    .channel('signatures-live')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'signatures' },
      (payload) => {
        setSignatures((prev) => [payload.new as Signature, ...prev]);
      }
    )
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}, []);
```

**UI:**
- Background închis (dark mode) pentru lizibilitate pe proiector
- Grid cu carduri semnatari: Nume bold, Organizație sub
- Animație de intrare pentru fiecare card nou
- Logo eveniment / titlu declarație afișat permanent sus

---

### 3. `/admin` — Dashboard administrare

**Comportament:**
- Protejat cu parolă simplă (env variable `ADMIN_PASSWORD`)
- Afișează lista completă a semnatarilor în tabel
- Filtrare și căutare după nume / organizație
- Export CSV cu toți semnatarii
- Buton pentru resetare (ștergere toate semnăturile — cu confirmare)
- Link rapid către `/live-wall` și `/sign`

---

### 4. `/admin/qr` — Generator QR

**Comportament:**
- Generează automat QR code pentru URL-ul `/sign`
- Preview vizual al QR-ului
- Butoane: „Descarcă PNG" și „Descarcă SVG"
- Opțional: preview cum va arăta QR-ul pe un roll-up / slide de prezentare

---

## Variabile de mediu necesare

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
ADMIN_PASSWORD=
```

---

## Considerații tehnice suplimentare

1. **Rate limiting** pe `/api/signatures` — maxim 1 request / IP la 10 secunde pentru a preveni spam
2. **Input sanitization** — toate câmpurile text sunt sanitizate înainte de insert
3. **Mobile-first** — `/sign` testat și optimizat pentru viewport 375px+
4. **Accesibilitate** — focus management după submit, aria-labels pe toate câmpurile
5. **Error handling** — mesaje clare de eroare pentru utilizator (conexiune, câmpuri invalide)
6. **SEO** — `/sign` are meta tags adecvate, `/live-wall` și `/admin` sunt noindex

---

## Livrabile finale

- [ ] Repo GitHub cu cod complet
- [ ] Deploy activ pe Vercel
- [ ] Schema Supabase aplicată + Realtime activat
- [ ] Documentație `.env.example`
- [ ] README cu instrucțiuni de setup și utilizare
- [ ] QR code generat și exportat în PNG + SVG

---

## Note pentru AI coding assistant

- Folosește **App Router** (nu Pages Router)
- Toate componentele client care folosesc hooks sunt marcate cu `"use client"`
- Supabase client este inițializat în `lib/supabase/client.ts` (browser) și `lib/supabase/server.ts` (server components)
- Formularul de semnare folosește **React Hook Form** + **Zod** pentru validare
- Nu folosi `any` în TypeScript — definește tipuri explicite pentru toate datele din Supabase
- shadcn/ui componente folosite: `Button`, `Input`, `Checkbox`, `Card`, `Table`, `Badge`, `Dialog` (pentru confirmare reset)
