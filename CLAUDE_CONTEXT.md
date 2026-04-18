# CLAUDE PROJECT CONTEXT — The Elective Diaries
# Paste this at the start of a new chat, then upload the latest ZIP

---

## What This Project Is
A full-stack web app for **IFMSA Pakistan's KMC Local Council** (Khyber Medical College, Peshawar).
Students submit elective diary blog posts; admins manage content via a protected dashboard.

## Live URL
https://elective-diaries.vercel.app  ← update this once deployed

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
| Hosting      | Vercel                            |

---

## Project Structure
```
elective-diaries/
├── app/
│   ├── (public)/                  # Public pages (no auth)
│   │   ├── page.tsx               # Homepage — hospital card grid
│   │   ├── about/page.tsx         # About page
│   │   └── hospitals/[slug]/
│   │       ├── page.tsx           # Hospital detail + diary list
│   │       └── diaries/[id]/page.tsx  # Full diary reader
│   └── (admin)/admin/             # Auth-protected admin panel
│       ├── page.tsx               # Dashboard with stats
│       ├── login/page.tsx         # Login page
│       ├── diaries/               # List / create / edit diaries
│       └── hospitals/             # List / create / edit hospitals
├── components/
│   ├── ui/                        # Navbar, Footer
│   ├── public/                    # HospitalCard, DiaryCard
│   └── admin/                     # AdminSidebar, DiaryForm, HospitalForm, RichTextEditor
├── lib/supabase/                  # client.ts, server.ts, middleware.ts
├── types/database.ts              # TypeScript interfaces for Hospital, Diary
├── middleware.ts                  # Redirects unauthenticated users away from /admin
└── supabase/schema.sql            # DB schema (already run in Supabase)
```

---

## Database Tables (Supabase / PostgreSQL)
### hospitals
| Column      | Type    | Notes                              |
|---|---|---|
| id          | uuid    | Primary key                        |
| name        | text    | e.g. "Khyber Teaching Hospital"    |
| slug        | text    | URL slug, unique                   |
| description | text    | Optional                           |
| image_url   | text    | Direct image URL                   |
| status      | text    | 'active' / 'inactive' / 'new_data' |
| created_at  | timestamp |                                  |
| updated_at  | timestamp |                                  |

### diaries
| Column          | Type    | Notes                         |
|---|---|---|
| id              | uuid    | Primary key                   |
| title           | text    |                               |
| content         | text    | HTML from Tiptap editor       |
| excerpt         | text    | Short summary, optional       |
| hospital_id     | uuid    | FK → hospitals.id             |
| author_name     | text    |                               |
| author_year     | text    | e.g. "3rd Year, Batch 2022"   |
| specialty       | text    | e.g. "Surgery", optional      |
| cover_image_url | text    | Optional                      |
| published       | boolean | false = draft, true = live    |
| created_at      | timestamp |                             |
| updated_at      | timestamp |                             |

---

## Color System (Tailwind custom colors)
Primary red: `#b52434` (class: `primary`)
Background: `#fff8f8` (class: `surface`)
Font: Plus Jakarta Sans

---

## Auth Flow
- All `/admin/*` routes are protected by `middleware.ts`
- Unauthenticated → redirected to `/admin/login`
- Uses Supabase email/password auth
- Admin users are created manually in Supabase Dashboard → Authentication → Users

---

## Known Issues Fixed So Far
- v1: TypeScript `never` type on Supabase query results → fixed with explicit `as Hospital[]` casts
- v2: Corrupted file upload via GitHub drag-and-drop → switched to Git CLI push
- v3: `never` type on `Database` generic → rewrote `types/database.ts` as plain interfaces
- v4-v5: `never` on `.update()` / `.insert()` → cast `createClient() as any` in admin form components
- v6: Implicit `any` on `cookiesToSet` in Supabase cookie handlers → added explicit type annotations

## Current Version
v7 — performance optimised build

---

## How to Continue in a New Chat
Tell Claude:
> "I'm continuing work on the Elective Diaries project for KMC LC IFMSA Pakistan.
> Here is the project context file and the latest ZIP of the codebase.
> Please read both before we continue."

Then attach:
1. This file (CLAUDE_CONTEXT.md)
2. The latest elective-diaries-vX.zip

---

## Pending / Future Features (ideas)
- [ ] Image upload directly in admin (Supabase Storage)
- [ ] Search/filter diaries by specialty or hospital
- [ ] Student submission form (public can submit, admin approves)
- [ ] Dark mode toggle
- [ ] RSS feed for new diaries
