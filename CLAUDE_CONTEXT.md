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
│   ├── layout.tsx                       # Root layout — fonts, Analytics, <html class="dark"> hardcoded
│   ├── globals.css                      # Dark mode CSS tokens only (light mode removed)
│   ├── (public)/
│   │   ├── layout.tsx                   # Client layout: renders Navbar+Footer normally,
│   │   │                                # but renders children ONLY on /hospitals/[slug] and /hospitals/[slug]/diaries/[id]
│   │   ├── page.tsx                     # Homepage — hospital card grid (ISR, revalidate 300s)
│   │   ├── about/page.tsx               # About page (static)
│   │   └── hospitals/[slug]/
│   │       ├── page.tsx                 # Cinematic scroll-snap diary viewer (SSG + ISR)
│   │       └── diaries/[id]/page.tsx    # Bento-grid diary reader (SSG + ISR)
│   ├── (admin)/admin/                   # Auth-protected admin panel (fully dynamic)
│   │   ├── layout.tsx                   # Admin layout with sidebar
│   │   ├── page.tsx                     # Dashboard with stats
│   │   ├── diaries/                     # List / create / edit diaries
│   │   └── hospitals/                   # List / create / edit hospitals
│   └── (admin-auth)/admin/login/        # Login page — separate route group, NO sidebar
│       ├── layout.tsx                   # Passthrough layout
│       └── page.tsx                     # Login page
├── components/
│   ├── ui/Navbar.tsx                    # No ThemeToggle — dark mode is permanent
│   ├── ui/Footer.tsx
│   ├── public/HospitalCard.tsx
│   └── admin/AdminSidebar.tsx, DiaryForm.tsx, HospitalForm.tsx, RichTextEditor.tsx
├── lib/supabase/
│   ├── client.ts, server.ts, middleware.ts, static.ts
├── types/database.ts                    # Hospital, Diary (includes pros: string[], cons: string[])
├── middleware.ts
└── supabase/schema.sql
```

---

## Database Tables
### hospitals
| Column      | Type      | Notes                              |
|---|---|---|
| id          | uuid      | Primary key                        |
| name        | text      |                                    |
| slug        | text      | URL slug, unique                   |
| description | text      | Optional                           |
| image_url   | text      | Uploaded to `hospital-images` bucket |
| status      | text      | 'active' / 'inactive' / 'new_data' |
| created_at  | timestamp |                                    |

### diaries
| Column          | Type      | Notes                         |
|---|---|---|
| id              | uuid      | Primary key                   |
| title           | text      |                               |
| content         | text      | HTML from Tiptap editor       |
| excerpt         | text      | Optional                      |
| hospital_id     | uuid      | FK → hospitals.id             |
| author_name     | text      |                               |
| author_year     | text      |                               |
| specialty       | text      | Comma-separated, optional     |
| cover_image_url | text      | Uploaded to `diary-images` bucket |
| pros            | text[]    | Admin-editable pros list      |
| cons            | text[]    | Admin-editable cons list      |
| published       | boolean   |                               |
| created_at      | timestamp |                               |

**Required SQL migration (run once in Supabase SQL Editor):**
```sql
ALTER TABLE public.diaries ADD COLUMN IF NOT EXISTS pros text[] DEFAULT '{}';
ALTER TABLE public.diaries ADD COLUMN IF NOT EXISTS cons text[] DEFAULT '{}';
```

---

## Supabase Storage Buckets
| Bucket           | Public | Upload path                          |
|---|---|---|
| `hospital-images`| true   | `hospitals/<timestamp>-<uuid>.<ext>` |
| `diary-images`   | true   | `covers/<timestamp>-<uuid>.<ext>`    |

Add INSERT policy for authenticated users on both buckets.

---

## Design System — Dark Mode Only
- **Always dark** — `<html class="dark">` hardcoded in `app/layout.tsx`. No ThemeProvider, no ThemeToggle.
- Light mode tokens still exist in globals.css `:root` but are never used.
- Dark mode background: `#0d0d0d`, cards: `#141414` / `#1a1919`
- Primary red: `#e63c49` (dark mode), `#b52434` (light mode — inactive)
- **`text-on-surface-variant` is NOT used** — replaced with `text-primary` throughout the entire site
- **Card borders use `border-white/5`** — barely-visible dark borders, consistent across all pages
- Font: Plus Jakarta Sans (headline), Inter (body), Work Sans (label)
- Material Symbols loaded with `display=block` (no FOUT icon text flash)

---

## Page Architecture

### Homepage (`/`)
- Dark hero with "The Elective Diaries" in `text-primary` red
- KMC badge and description text also `text-primary`
- Hospital card grid (ISR 300s)

### Hospital Detail (`/hospitals/[slug]`)
- Full-screen scroll-snap, no Navbar/Footer (suppressed by public layout)
- Each diary = one slide, alternating left/right layout
- Mobile: 45vh image top + scrollable text bottom
- `getSpecialtyIcon()` maps 25+ specialties to Material Symbols icons

### Diary Reader (`/hospitals/[slug]/diaries/[id]`)
- Full-screen, no Navbar/Footer
- Bento grid: 8-col narrative + 4-col sidebar (Skills Matrix only)
- Hero banner (300px) with cover image at 30% opacity + deep dark gradient
- Clinical Narrative card (red left-border stripe)
- Pivotal Observations (from excerpt)
- Skills Matrix sidebar (specialty tags as pills)
- Rotation Analysis section — Pros (green top border) + Cons (red top border) — from DB, only shown if data exists
- No breadcrumb, no author/hospital/date modals

### Admin Panel (`/admin/*`)
- Protected by middleware, redirects to `/admin/login` if unauthenticated
- Sidebar uses `text-primary/70` for inactive nav, `text-primary` for active
- All table headers, subtitles, and metadata use `text-primary`
- Card/table borders use `border-white/5`

---

## Key Technical Decisions & Gotchas

1. **Supabase client casting**: `createClient()` in admin form components is cast
   `as any` to avoid TypeScript `never` errors on `.update()` / `.insert()` calls.

2. **Static client separation**: `lib/supabase/static.ts` is ONLY for `generateStaticParams`.
   Never use it in page render functions.

3. **Login sidebar fix**: Login page is in `app/(admin-auth)/admin/login/` (own route group).
   The `(admin)` layout with `<AdminSidebar />` does NOT wrap the login route.

4. **Public layout is a client component** (`'use client'`): Uses `usePathname()` to suppress
   Navbar/Footer on `/hospitals/[slug]` and `/hospitals/[slug]/diaries/[id]`.

5. **No ThemeProvider**: Dark mode is permanent. `<html class="dark">` is hardcoded.
   Do NOT add ThemeProvider or ThemeToggle — they were intentionally removed.

6. **Material Symbols FOUT fix**: Font loaded with `display=block` in `<head>` via `app/layout.tsx`
   with `preconnect` hints. Do NOT use `@import` in CSS for this font.

7. **`text-on-surface-variant` is banned**: All instances replaced with `text-primary`.
   Use `text-primary/70` for slightly muted states (e.g. inactive nav items).

8. **Git push on Windows**:
   `D: && cd "New Folder\Elective Diaries\elective-diaries" && git add -A && git commit -m "msg" && git push`

---

## Version History
| Version | What Changed |
|---|---|
| v1–v7 | Initial build, TypeScript fixes, SSG/ISR, image optimisation |
| v8 | Fix: `generateStaticParams` cookies error → `static.ts` client |
| v9 | Image upload (HospitalForm + DiaryForm → Supabase Storage); navbar logo removed; homepage h1 `text-primary`; login sidebar fix; cinematic scroll-snap hospital viewer; specialty icons; dark mode only (permanent); public layout client component; bento-grid diary reader; pros/cons on diaries (admin-editable); Material Symbols FOUT fix; `text-on-surface-variant` → `text-primary` everywhere; `border-outline-variant` → `border-white/5` on cards; diary page has no navbar/breadcrumb |

## Current Version
**v9** — fully functional, dark mode only

---

## Pending / Future Features
- [ ] Search/filter diaries by specialty or hospital
- [ ] Student submission form (public submits → admin approves)
- [ ] On-demand ISR revalidation when admin publishes a diary
