# CLAUDE PROJECT CONTEXT — The Elective Diaries
# Paste this at the start of a new chat, then upload the latest ZIP

---

## What This Project Is
A full-stack web app for **IFMSA Pakistan's KMC Local Council** (Khyber Medical College, Peshawar).
Students submit elective diary blog posts; admins manage content via a protected dashboard.

## GitHub Repo
https://github.com/Doctanaski/Elective-Diaries

---

## Tech Stack
| Layer        | Technology                        |
|---|---|
| Framework    | Next.js 14.2.29 (App Router)      |
| Styling      | Tailwind CSS (custom color system)|
| Database     | Supabase (PostgreSQL)             |
| Auth         | Supabase Auth (email/password)    |
| Rich Text    | Tiptap editor                     |
| Analytics    | Vercel Analytics                  |
| Hosting      | Vercel (region: sin1 — Singapore) |

---

## Project Structure
```
elective-diaries/
├── app/
│   ├── layout.tsx                       # Root layout — fonts, Analytics (NO ThemeProvider)
│   ├── globals.css                      # Light-mode CSS tokens + Tailwind base
│   ├── (public)/
│   │   ├── layout.tsx                   # Client layout: renders Navbar+Footer normally,
│   │   │                                # but renders children ONLY (no chrome) on /hospitals/[slug]
│   │   ├── page.tsx                     # Homepage — hospital card grid (ISR, revalidate 300s)
│   │   ├── about/page.tsx               # About page (static)
│   │   └── hospitals/[slug]/
│   │       ├── page.tsx                 # Cinematic scroll-snap diary viewer (SSG + ISR)
│   │       └── diaries/[id]/page.tsx    # Full diary reader (SSG + ISR)
│   ├── (admin)/admin/                   # Auth-protected admin panel (fully dynamic)
│   │   ├── layout.tsx                   # Admin layout with sidebar
│   │   ├── page.tsx                     # Dashboard with stats
│   │   ├── diaries/                     # List / create / edit diaries
│   │   └── hospitals/                   # List / create / edit hospitals
│   └── (admin-auth)/admin/login/        # Login page — separate route group, NO sidebar
│       ├── layout.tsx                   # Passthrough layout (no sidebar)
│       └── page.tsx                     # Login page
├── components/
│   ├── ui/                              # Navbar, Footer (ThemeProvider/Toggle REMOVED)
│   ├── public/                          # HospitalCard, DiaryCard
│   └── admin/                           # AdminSidebar, DiaryForm, HospitalForm, RichTextEditor
├── lib/supabase/
│   ├── client.ts                        # Browser client
│   ├── server.ts                        # Server client (cookies)
│   ├── middleware.ts                    # Middleware client
│   └── static.ts                        # Cookie-free client (generateStaticParams ONLY)
├── types/database.ts                    # TypeScript interfaces: Hospital, Diary
├── middleware.ts                        # Auth redirect middleware
└── supabase/schema.sql                  # DB schema (already run — do not run again)
```

---

## Database Tables (Supabase / PostgreSQL)
### hospitals
| Column      | Type      | Notes                              |
|---|---|---|
| id          | uuid      | Primary key                        |
| name        | text      | e.g. "Khyber Teaching Hospital"    |
| slug        | text      | URL slug, unique                   |
| description | text      | Optional                           |
| image_url   | text      | URL — uploaded to `hospital-images` Supabase bucket |
| status      | text      | 'active' / 'inactive' / 'new_data' |
| created_at  | timestamp |                                    |
| updated_at  | timestamp |                                    |

### diaries
| Column          | Type      | Notes                         |
|---|---|---|
| id              | uuid      | Primary key                   |
| title           | text      |                               |
| content         | text      | HTML from Tiptap editor       |
| excerpt         | text      | Short summary, optional       |
| hospital_id     | uuid      | FK → hospitals.id             |
| author_name     | text      |                               |
| author_year     | text      | e.g. "3rd Year, Batch 2022"   |
| specialty       | text      | e.g. "Surgery", optional      |
| cover_image_url | text      | URL — uploaded to `diary-images` Supabase bucket |
| published       | boolean   | false = draft, true = live    |
| created_at      | timestamp |                               |
| updated_at      | timestamp |                               |

---

## Supabase Storage Buckets
Both buckets must be created manually in Supabase Dashboard → Storage:

| Bucket           | Public | Used for                        | Upload path          |
|---|---|---|---|
| `hospital-images`| true   | Hospital tile cover images      | `hospitals/<timestamp>-<uuid>.<ext>` |
| `diary-images`   | true   | Diary entry cover images        | `covers/<timestamp>-<uuid>.<ext>`    |

For each bucket, add an INSERT policy allowing authenticated users to upload.

---

## Color System (light mode only — dark mode removed)
- Primary red: `#b52434` (class: `primary`)
- Background: `#fff8f8` (class: `surface`)
- Font: Plus Jakarta Sans
- Tokens defined as CSS custom properties in `globals.css` under `:root`
- Tailwind config maps classes to `var(--token-name)` — no `darkMode: 'class'`

---

## Auth Flow
- All `/admin/*` routes protected by `middleware.ts`
- Unauthenticated → redirected to `/admin/login`
- Login lives in `(admin-auth)` route group — no sidebar rendered
- Uses Supabase email/password auth
- Sessions stored in secure HTTP-only cookies

---

## Rendering Strategy
| Page                        | Strategy         | Revalidate |
|---|---|---|
| Homepage                    | ISR              | 300s       |
| Hospital detail             | SSG + ISR        | 300s       |
| Diary reader                | SSG + ISR        | 300s       |
| About                       | Static           | —          |
| Admin dashboard             | Dynamic          | —          |
| Admin diaries/hospitals     | Dynamic          | —          |

**Important:** `generateStaticParams` must ALWAYS use `createStaticClient()` from
`lib/supabase/static.ts`, NOT `createClient()` from `lib/supabase/server.ts`.

---

## Hospital Detail Page — Cinematic Scroll Viewer
`app/(public)/hospitals/[slug]/page.tsx`

- Full-screen scroll-snap layout (`scroll-snap-type: y mandatory`, each slide `height: 100vh`)
- Each published diary = one full-screen slide
- Alternating layout: even slides text-left/image-right, odd slides reversed
- Each slide shows: author name (first/last split with primary colour), hospital badge,
  specialty strip with **dynamic icon** (see `getSpecialtyIcon()`), excerpt, "Read Diary" CTA
- Background: diary cover image at 30% opacity with gradient overlay
- Entry counter (e.g. "2 / 5") top-right; bounce arrow bottom-centre; "Back to Hospitals" on last slide
- Floating "All Hospitals" back button fixed top-left
- No Navbar or Footer — the public layout detects `/hospitals/[slug]` and renders children only
- `getSpecialtyIcon()` maps specialty strings to Material Symbols icons (cardiology, neurology,
  surgery, paediatrics, orthopaedics, ophthalmology, dermatology, obstetrics, oncology,
  psychiatry, radiology, ENT, urology, nephrology, gastroenterology, pulmonology,
  endocrinology, haematology, anaesthesiology, emergency, ICU, pathology, rheumatology,
  infectious disease, and a `stethoscope` fallback)

---

## Key Technical Decisions & Gotchas

1. **Supabase client casting**: `createClient()` in admin form components is cast
   `as any` to avoid TypeScript `never` errors on `.update()` / `.insert()` calls.

2. **Cookie type annotations**: `setAll` must be explicitly typed in both
   `lib/supabase/server.ts` and `lib/supabase/middleware.ts`.

3. **Static client separation**: `lib/supabase/static.ts` exists solely for
   `generateStaticParams`. Never use it in page render functions.

4. **Git push on Windows**: Use PowerShell.
   `git add -A`, `git commit -m "..."`, `git push`

5. **Public layout is a client component** (`'use client'`): Needed so it can call
   `usePathname()` to detect hospital detail pages and suppress Navbar/Footer there.

6. **No ThemeProvider in root layout**: Dark mode was removed. `app/layout.tsx` wraps
   only `{children}` and `<Analytics />`. No `suppressHydrationWarning` needed.

7. **Login sidebar fix**: Login page is in `app/(admin-auth)/admin/login/` (its own
   route group with a passthrough layout). The `(admin)` route group layout that renders
   `<AdminSidebar />` does NOT wrap the login route.

---

## Version History
| Version | What Changed |
|---|---|
| v1 | Initial build — full project scaffold |
| v2 | Fix: TypeScript `never` on Supabase query results |
| v3 | Fix: `never` on Database generic → rewrote `types/database.ts` |
| v4–v5 | Fix: `never` on `.update()/.insert()` → cast `createClient() as any` |
| v6 | Fix: Implicit `any` on `cookiesToSet` |
| v7 | Perf: SSG + ISR, image optimisation, Singapore region, narrowed middleware |
| v8 | Fix: `generateStaticParams` cookies error → new `static.ts` client |
| v9 | Feature: image upload (HospitalForm + DiaryForm → Supabase Storage); navbar logo removed; homepage h1 uses `text-primary`; login sidebar fix via `(admin-auth)` route group; cinematic scroll-snap hospital diary viewer; specialty-specific icons; dark mode removed; public layout is client component — suppresses Navbar/Footer on hospital detail pages for true full-screen |

## Current Version
**v9** — builds successfully, all features complete

---

## How to Resume in a New Chat
> "I'm continuing work on the Elective Diaries project for KMC LC IFMSA Pakistan.
> Here is the project context file. Please read it before we continue."

---

## Pending / Future Features
- [ ] Search/filter diaries by specialty or hospital
- [ ] Student submission form (public submits → admin approves)
- [ ] On-demand ISR revalidation when admin publishes a diary
