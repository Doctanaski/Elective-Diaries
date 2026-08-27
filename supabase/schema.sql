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

-- ============================================================
-- v12 MIGRATION — Add elective_duration and supervisor columns
-- Run this once in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================
alter table public.diaries add column if not exists elective_duration text;
alter table public.diaries add column if not exists supervisor text;

-- ============================================================
-- v15 MIGRATION — Add skills column (Skills Matrix tags)
-- Run this once in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================
alter table public.diaries add column if not exists skills text[];

-- ============================================================
-- v25 MIGRATION — Add gallery_images column
-- Run this once in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================
alter table public.diaries add column if not exists gallery_images text[];

-- ============================================================
-- v42 MIGRATION — Add sketchfab_model_id column
-- Run this once in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================
alter table public.diaries add column if not exists sketchfab_model_id text;

-- ============================================================
-- v45 MIGRATION — Replace sketchfab_model_id with model_url
-- Run this once in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================
alter table public.diaries add column if not exists model_url text;
alter table public.diaries drop column if exists sketchfab_model_id;

-- ============================================================
-- v68 MIGRATION — site_content table for editable text blocks
-- Run this once in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================
create table if not exists public.site_content (
  id          uuid primary key default gen_random_uuid(),
  key         text not null unique,
  value       text not null default '',
  updated_at  timestamptz default now()
);

-- Seed the SCO section placeholders
insert into public.site_content (key, value) values
  ('sco_name',         'Standing Committee Officer'),
  ('sco_title',        'SCOPE · IFMSA-KMC'),
  ('sco_message',      'Add your message here. This text can be edited from the admin panel.'),
  ('sco_officer_image', ''),
  ('sco_group_image',   '')
on conflict (key) do nothing;

-- ============================================================
-- v80 MIGRATION — Add sort_order to diaries for per-hospital ordering
-- Run this once in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================
alter table public.diaries add column if not exists sort_order integer not null default 0;

-- Backfill sort_order for existing diaries per hospital (ordered by created_at)
do $$
declare
  h record;
  i integer;
  r record;
begin
  for h in select id from public.hospitals loop
    i := 1;
    for r in select id from public.diaries where hospital_id = h.id order by created_at asc loop
      update public.diaries set sort_order = i where id = r.id;
      i := i + 1;
    end loop;
  end loop;
end $$;

-- ============================================================
-- v75 MIGRATION — Editable President section + Contributors
-- Run this once in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. CONTRIBUTORS TABLE
create table if not exists public.contributors (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  role       text not null default '',
  tagline    text,
  bio        text,
  photo_url  text,
  details    jsonb not null default '[]'::jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger contributors_updated_at
  before update on public.contributors
  for each row execute function public.handle_updated_at();

alter table public.contributors enable row level security;

create policy "Public read contributors"
  on public.contributors for select
  using (true);

create policy "Admins full access contributors"
  on public.contributors for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Seed the three default contributors (matches the current homepage)
insert into public.contributors (name, role, tagline, bio, photo_url, details, sort_order) values
(
  'Ayesha Khan',
  'President · Project Lead',
  'Founded the archive to make elective planning transparent for every KMC student.',
  'Ayesha spearheaded The Elective Diaries after navigating her own elective with little first-hand guidance. She leads the council''s vision, reviews every submission before publication, and coordinates with hospital focal persons to keep facility information accurate and up to date. When she is not on wards, she mentors juniors preparing for their first clinical rotations.',
  '/contributor-placeholder-1.svg',
  '[{"icon":"school","label":"Batch","value":"KMC Batch 2023"},{"icon":"local_hospital","label":"Elective at","value":"Lady Reading Hospital, Peshawar"},{"icon":"interests","label":"Focus","value":"Internal Medicine · Medical Education"},{"icon":"mail","label":"Contact","value":"president.klc@ifmsapakistan.org"}]'::jsonb,
  1
),
(
  'Muhammad Haris',
  'Content Editor',
  'Turns raw rotation notes into polished, honest diary entries.',
  'Haris edits and fact-checks the diaries, working closely with contributors to preserve their voice while keeping entries practical and readable. He built the diary template that standardises sections like resources, workload, and tips for future electives. Outside the archive, he documents his own surgical rotations and contributes to the council''s exchange program.',
  '/contributor-placeholder-2.svg',
  '[{"icon":"school","label":"Batch","value":"KMC Batch 2024"},{"icon":"local_hospital","label":"Elective at","value":"Hayatabad Medical Complex, Peshawar"},{"icon":"interests","label":"Focus","value":"Surgery · Medical Writing"},{"icon":"mail","label":"Contact","value":"editorial.klc@ifmsapakistan.org"}]'::jsonb,
  2
),
(
  'Fatima Zahra',
  'Web Developer & Design',
  'Designed and built the platform you are reading this on.',
  'Fatima architected the site end to end — from the scrolling home page to the admin pipeline that publishes new diaries. She obsesses over performance and accessibility so the archive stays fast on any device a student carries to the wards. She also manages deployments, backups, and the hospital data that powers the directory.',
  '/contributor-placeholder-3.svg',
  '[{"icon":"school","label":"Batch","value":"KMC Batch 2025"},{"icon":"local_hospital","label":"Elective at","value":"Khyber Teaching Hospital, Peshawar"},{"icon":"interests","label":"Focus","value":"Paediatrics · Health Technology"},{"icon":"mail","label":"Contact","value":"tech.klc@ifmsapakistan.org"}]'::jsonb,
  3
)
on conflict do nothing;

-- 2. PRESIDENT SECTION KEYS in site_content
insert into public.site_content (key, value) values
  ('president_heading',   'A Message from the LEO'),
  ('president_message_1', 'Welcome to The Elective Diaries — a living archive of the clinical journeys undertaken by our students across affiliated hospitals.'),
  ('president_message_2', 'Every diary captures real experiences, hard-earned lessons, and the people met along the way. I encourage every KMC student to explore these pages, contribute their own story, and pass on the knowledge to those who follow.'),
  ('president_signoff',   'LEO, KMC Local Council'),
  ('president_image',     '')
on conflict (key) do nothing;

-- 3. STORAGE BUCKET for president + contributor photos
insert into storage.buckets (id, name, public)
values ('site-images', 'site-images', true)
on conflict (id) do nothing;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'Public read site images'
  ) then
    create policy "Public read site images"
      on storage.objects for select
      using (bucket_id = 'site-images');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'Admins upload site images'
  ) then
    create policy "Admins upload site images"
      on storage.objects for insert
      with check (bucket_id = 'site-images' and auth.role() = 'authenticated');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'Admins update site images'
  ) then
    create policy "Admins update site images"
      on storage.objects for update
      using (bucket_id = 'site-images' and auth.role() = 'authenticated');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'Admins delete site images'
  ) then
    create policy "Admins delete site images"
      on storage.objects for delete
      using (bucket_id = 'site-images' and auth.role() = 'authenticated');
  end if;
end $$;
