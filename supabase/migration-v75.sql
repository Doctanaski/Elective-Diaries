-- ============================================================
-- Elective Diaries — Site Content Setup (run once, safe to re-run)
-- Paste ALL of this into: Supabase Dashboard → SQL Editor → New Query
--
-- Includes:
--   · handle_updated_at() helper (in case it was never created)
--   · site_content table (the v68 step your database is missing)
--   · contributors table (v75) + seed data
--   · President section content keys (v75)
--   · 'site-images' public storage bucket + policies (v75)
--   · Row Level Security everywhere
-- ============================================================

-- ── 0. updated_at helper ─────────────────────────────────────
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── 1. SITE_CONTENT TABLE (key/value editable text blocks) ──
create table if not exists public.site_content (
  id          uuid primary key default gen_random_uuid(),
  key         text not null unique,
  value       text not null default '',
  updated_at  timestamptz default now()
);

alter table public.site_content enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='site_content' and policyname='Public read site content') then
    create policy "Public read site content"
      on public.site_content for select
      using (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='site_content' and policyname='Admins full access site content') then
    create policy "Admins full access site content"
      on public.site_content for all
      using (auth.role() = 'authenticated')
      with check (auth.role() = 'authenticated');
  end if;
end $$;

-- SCO section placeholders
insert into public.site_content (key, value) values
  ('sco_name',          'Standing Committee Officer'),
  ('sco_title',         'SCOPE · IFMSA-KMC'),
  ('sco_message',       'Add your message here. This text can be edited from the admin panel.'),
  ('sco_officer_image', ''),
  ('sco_group_image',   '')
on conflict (key) do nothing;

-- ── 2. CONTRIBUTORS TABLE ────────────────────────────────────
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

drop trigger if exists contributors_updated_at on public.contributors;
create trigger contributors_updated_at
  before update on public.contributors
  for each row execute function public.handle_updated_at();

alter table public.contributors enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='contributors' and policyname='Public read contributors') then
    create policy "Public read contributors"
      on public.contributors for select
      using (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='contributors' and policyname='Admins full access contributors') then
    create policy "Admins full access contributors"
      on public.contributors for all
      using (auth.role() = 'authenticated')
      with check (auth.role() = 'authenticated');
  end if;
end $$;

-- Seed the three default contributors (only if table is empty)
do $$
begin
  if not exists (select 1 from public.contributors limit 1) then
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
    );
  end if;
end $$;

-- ── 3. PRESIDENT SECTION KEYS ────────────────────────────────
insert into public.site_content (key, value) values
  ('president_message_1', 'Welcome to The Elective Diaries — a living archive of the clinical journeys undertaken by our students across affiliated hospitals.'),
  ('president_message_2', 'Every diary captures real experiences, hard-earned lessons, and the people met along the way. I encourage every KMC student to explore these pages, contribute their own story, and pass on the knowledge to those who follow.'),
  ('president_signoff',   'President, KMC Local Council'),
  ('president_image',     '')
on conflict (key) do nothing;

-- ── 4. STORAGE BUCKET + POLICIES ─────────────────────────────
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
