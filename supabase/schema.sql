-- Tabel principal semnatari
create table if not exists signatures (
  id uuid default gen_random_uuid() primary key,
  full_name text not null,
  organization text not null,
  position text,
  email text,
  agreed boolean not null default true,
  signed_at timestamp with time zone default now()
);

-- Tabel pentru declarație (conținut editabil)
create table if not exists declaration (
  id int primary key default 1,
  title text not null,
  body text not null,
  event_name text,
  event_date date,
  updated_at timestamp with time zone default now()
);

-- Enable Realtime pe tabelul signatures
alter publication supabase_realtime add table signatures;

-- Row Level Security
alter table signatures enable row level security;
alter table declaration enable row level security;

-- Public can read signatures (live wall + counters) and insert their own signature
create policy "Public can read signatures" on signatures
  for select using (true);

create policy "Public can insert signatures" on signatures
  for insert with check (true);

-- Public can read the declaration content
create policy "Public can read declaration" on declaration
  for select using (true);

-- Seed declaration content (edit as needed)
insert into declaration (id, title, body, event_name, event_date)
values (
  1,
  'Declarația ESG',
  'Noi, semnatarii acestei declarații, ne angajăm să promovăm principiile de mediu, sociale și de guvernanță (ESG) în activitatea organizațiilor pe care le reprezentăm.',
  'Evenimentul ESG',
  current_date
)
on conflict (id) do nothing;
