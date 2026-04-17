-- ============================================================
-- Elective Diaries — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. HOSPITALS TABLE
create table if not exists public.hospitals (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  description text,
  image_url   text,
  status      text not null default 'active'
                check (status in ('active', 'inactive', 'new_data')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 2. DIARIES TABLE
create table if not exists public.diaries (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  content         text not null default '',
  excerpt         text,
  hospital_id     uuid not null references public.hospitals(id) on delete cascade,
  author_name     text not null,
  author_year     text not null,
  specialty       text,
  cover_image_url text,
  published       boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- 3. AUTO-UPDATE updated_at TRIGGER
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger hospitals_updated_at
  before update on public.hospitals
  for each row execute function public.handle_updated_at();

create trigger diaries_updated_at
  before update on public.diaries
  for each row execute function public.handle_updated_at();

-- 4. ROW LEVEL SECURITY
alter table public.hospitals enable row level security;
alter table public.diaries   enable row level security;

-- Public can read hospitals
create policy "Public read hospitals"
  on public.hospitals for select
  using (true);

-- Public can only read published diaries
create policy "Public read published diaries"
  on public.diaries for select
  using (published = true);

-- Authenticated users (admins) can do everything
create policy "Admins full access hospitals"
  on public.hospitals for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Admins full access diaries"
  on public.diaries for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- 5. SEED DATA (the 3 hospitals from the design)
insert into public.hospitals (name, slug, description, image_url, status) values
(
  'Khyber Teaching Hospital',
  'khyber-teaching-hospital',
  'The largest and oldest teaching hospital affiliated with Khyber Medical College, Peshawar.',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuB_DVYT5U_KKohXHqicWxSbV6421NrBsu8UDWDAFW1zfVSe7pTXf494WIIij43wh1KQVV8w_meDvy4yZgm1BLUcxWYAiJOn2VypMsWmBafT9TZyC3GiiFnEljYkWjPh-OlpmHuJ4e0NO5F9BlH_kkQjORkAvX8MyzM8HQBJ1SAawuKjJcH9L6SoO7CRy34XhhYZBvKT6G9lxS5GgvDfMTjRO-8k9jJLYw9HQzQ38-kHyIn8cEMgsgmUk7P3JkXhVQE541tkXZgFj_M',
  'active'
),
(
  'Hayatabad Medical Complex',
  'hayatabad-medical-complex',
  'A major tertiary care hospital serving patients from across Khyber Pakhtunkhwa.',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAYjzottT_FwW7PF30xTK3rP1q8tLSXcRZPbby8Bmw7FrUZOMImaZJMtOZlSP7elCyOVFC69IS7Uz0gxTHr-h6YVpvZLLVSX-qRJeHgbog3_yz4S1NlI4uv8IOrjQYXbGDkjsWleGc2-LdC4McRW0L7cRMmDe9WBllH9Ug_MFka5UoBd43y7pasULfb9xRTAB9ZwxuOfaoL8ZsnZtmVRSiljD_HH6L_3JKD-rAIHr_KjufTLQhxFbxTAqPuL0A03BeawssXxtGLclM',
  'inactive'
),
(
  'Lady Reading Hospital',
  'lady-reading-hospital',
  'One of the oldest and largest hospitals in Peshawar with a rich academic tradition.',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAk0WI8w-tcQ926vZwJMIkbD_H_i8vFWSbSfcOA8DCcriaTluGlkxkTzoX-ns8sTAVhSGBocFMEXRWN3AzH_kYkkNlWwboIUeipCcusQmk4n8-nk-CJs_ZxNOTwJK1RYEmlruPQqJKaQ6sMT3AG7lNEGY5q2RcPCchn4Wumynw2-q_3xUymd9d46T8xDDnVz0fYgQf4ibeZcXDcgj1G1LUk6WkMa6PmuhVzo69-F9etc3YSZuxRg8cMbG4fF989EdC6dcs8EMyz1tU',
  'new_data'
)
on conflict (slug) do nothing;
