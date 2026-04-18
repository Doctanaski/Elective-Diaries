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
| Hosting      | Vercel (region: sin1 — Singapore) |

---

## Project Structure
```
elective-diaries/
├── app/
│   ├── (public)/                        # Public pages (no auth required)
│   │   ├── page.tsx                     # Homepage — hospital card grid (ISR, revalidate 300s)
│   │   ├── about/page.tsx               # About page (static)
│   │   └── hospitals/[slug]/
│   │       ├── page.tsx                 # Hospital detail + diary list (SSG + ISR)
│   │       └── diaries/[id]/page.tsx    # Full diary reader (SSG + ISR)
│   └── (admin)/admin/                   # Auth-protected admin panel (fully dynamic)
│       ├── page.tsx                     # Dashboard with stats
│       ├── login/page.tsx               # Login page
│       ├── diaries/                     # List / create / edit diaries
│       └── hospitals/                   # List / create / edit hospitals
├── components/
│   ├── ui/                              # Navbar, Footer
│   ├── public/                          # HospitalCard, DiaryCard
│   └── admin/                           # AdminSidebar, DiaryForm, HospitalForm, RichTextEditor
├── lib/supabase/
│   ├── client.ts                        # Browser client (for 'use client' components)
│   ├── server.ts                        # Server client (uses cookies — for page rendering)
│   ├── middleware.ts                    # Middleware client (for auth session refresh)
│   └── static.ts                        # Cookie-free client (ONLY for generateStaticParams)
├── types/database.ts                    # TypeScript interfaces: Hospital, Diary
├── middleware.ts                        # Redirects unauthenticated users away from /admin
│                                        # Only runs on: /admin/*, /, /hospitals/*, /about
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
| image_url   | text      | Direct image URL                   |
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
| cover_image_url | text      | Optional                      |
| published       | boolean   | false = draft, true = live    |
| created_at      | timestamp |                               |
| updated_at      | timestamp |                               |

---

## Color System (Tailwind custom colors)
- Primary red: `#b52434` (class: `primary`)
- Background: `#fff8f8` (class: `surface`)
- Font: Plus Jakarta Sans (imported via Google Fonts in globals.css)
- Full palette defined in `tailwind.config.ts`

---

## Auth Flow
- All `/admin/*` routes protected by `middleware.ts`
- Unauthenticated → redirected to `/admin/login`
- Uses Supabase email/password auth
- Admin users created manually: Supabase Dashboard → Authentication → Users
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
The server client calls `cookies()` which throws outside request context at build time.

---

## Performance Optimisations (v7+)
- Images served as AVIF/WebP via Next.js image optimisation
- Static assets cached for 1 year (`immutable`)
- Optimised images cached for 7 days on CDN
- `console.*` calls stripped from production bundle
- Middleware runs only on necessary routes (not static assets)
- Vercel region set to `sin1` (Singapore — closest to Pakistan)
- `sizes` props on all `<Image>` components for correct responsive loading
- Diary card images use `loading="lazy"`

---

5. **Hospital image upload (v9+)**: Uses Supabase Storage bucket `hospital-images`.
   You must create this bucket in Supabase Dashboard → Storage → New bucket (name: `hospital-images`, public: true).
   Add a storage policy: allow authenticated users to upload (`INSERT`) to the bucket.
   Uploaded files go into a `hospitals/` folder with a timestamped unique filename.

## Key Technical Decisions & Gotchas

1. **Supabase client casting**: `createClient()` in admin form components is cast
   `as any` to avoid TypeScript `never` errors on `.update()` / `.insert()` calls.
   This is a known Supabase SDK generic inference issue — safe at runtime.

2. **Cookie type annotations**: `setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[])`
   must be explicitly typed in both `lib/supabase/server.ts` and `lib/supabase/middleware.ts`.

3. **Static client separation**: `lib/supabase/static.ts` exists solely for
   `generateStaticParams`. Never use it in page render functions.

4. **Git push on Windows**: Use PowerShell, not bash. `chmod` and `bash` don't exist.
   Use `git add -A`, `git commit -m "..."`, `git push` — no bash script needed.

---

## Version History
| Version | What Changed |
|---|---|
| v1 | Initial build — full project scaffold |
| v2 | Fix: TypeScript `never` on Supabase query results → explicit `as Hospital[]` casts |
| v3 | Fix: `never` on Database generic → rewrote `types/database.ts` as plain interfaces |
| v4–v5 | Fix: `never` on `.update()/.insert()` → cast `createClient() as any` in admin forms |
| v6 | Fix: Implicit `any` on `cookiesToSet` → explicit type annotations in cookie handlers |
| v7 | Perf: SSG + ISR, image optimisation, Singapore region, narrowed middleware |
| v9 | Feature: Image upload for hospital tiles (Supabase Storage bucket `hospital-images`); removed navbar logo text; homepage h1 now uses `text-primary` red; login page moved to `(admin-auth)` route group to hide sidebar |

## Current Version
**v9** — builds successfully, performance optimised

---

## How to Resume in a New Chat
> "I'm continuing work on the Elective Diaries project for KMC LC IFMSA Pakistan.
> Here is the project context file and the latest ZIP. Please read both before we continue."

Attach:
1. `CLAUDE_CONTEXT.md` (this file)
2. The latest `elective-diaries-v8.zip` (or whichever is newest)

---

## Pending / Future Features
- [x] Image upload in admin (Supabase Storage — `hospital-images` bucket, v9)
- [ ] Search/filter diaries by specialty or hospital
- [ ] Student submission form (public submits → admin approves)
- [ ] Dark mode toggle
- [ ] On-demand ISR revalidation when admin publishes a diary
