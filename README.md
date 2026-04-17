# The Elective Diaries — KMC Local Council

A full-stack web application for documenting and sharing clinical elective experiences at hospitals affiliated with Khyber Medical College, Peshawar.

Built by **IFMSA Pakistan's KMC Local Council**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Hosting | Vercel |
| Rich Text | Tiptap Editor |

---

## 🚀 Deployment Guide (Step by Step)

### Step 1 — Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click **"New Project"** → name it `elective-diaries` → save your DB password
3. Wait ~2 minutes for the project to provision
4. Go to **SQL Editor** → click **"New Query"**
5. Copy the entire contents of `supabase/schema.sql` and paste it in → click **Run**
6. This creates your tables, security rules, and seeds the 3 hospitals
7. Go to **Settings → API** and copy:
   - **Project URL** (e.g. `https://abcdefgh.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)
   - **service_role** key (keep this secret!)

### Step 2 — Create an Admin User

1. In your Supabase dashboard, go to **Authentication → Users**
2. Click **"Add User"** → **"Create New User"**
3. Enter the email and password for your admin account
4. Click **Create User**

> ⚠️ Only users you manually create here can log in as admins. The public cannot register.

### Step 3 — Push Code to GitHub

1. Create a new repository on [github.com](https://github.com)
2. In your terminal, navigate to this project folder and run:

```bash
git init
git add .
git commit -m "Initial commit — Elective Diaries"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### Step 4 — Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New Project"** → import your GitHub repository
3. Vercel will auto-detect Next.js — don't change the build settings
4. Before clicking Deploy, click **"Environment Variables"** and add:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key |

5. Click **Deploy** — your site will be live in ~2 minutes!

### Step 5 — Local Development (optional)

```bash
# Install dependencies
npm install

# Copy the environment file
cp .env.local.example .env.local
# Fill in your Supabase keys in .env.local

# Start the dev server
npm run dev
# Open http://localhost:3000
```

---

## 📁 Project Structure

```
elective-diaries/
├── app/
│   ├── (public)/              # Public-facing pages
│   │   ├── page.tsx           # Homepage — hospital grid
│   │   ├── about/page.tsx     # About page
│   │   └── hospitals/
│   │       └── [slug]/
│   │           ├── page.tsx           # Hospital detail + diaries list
│   │           └── diaries/[id]/
│   │               └── page.tsx       # Individual diary
│   ├── (admin)/               # Admin panel (auth-protected)
│   │   └── admin/
│   │       ├── page.tsx               # Dashboard
│   │       ├── login/page.tsx         # Login
│   │       ├── diaries/               # Manage diaries
│   │       └── hospitals/             # Manage hospitals
│   ├── layout.tsx             # Root layout
│   ├── globals.css            # Global styles
│   └── not-found.tsx          # 404 page
├── components/
│   ├── ui/                    # Shared UI (Navbar, Footer)
│   ├── public/                # Public-facing components
│   └── admin/                 # Admin components (forms, sidebar, editor)
├── lib/supabase/              # Supabase client utilities
├── types/database.ts          # TypeScript types for DB
├── middleware.ts              # Auth protection middleware
└── supabase/schema.sql        # Database schema — run this first!
```

---

## 🔐 How Auth Works

- The `middleware.ts` file intercepts every request
- Any route starting with `/admin` (except `/admin/login`) requires the user to be logged in
- If not logged in → redirected to `/admin/login`
- Login uses Supabase email/password auth
- Sessions are stored in secure HTTP-only cookies

---

## ✏️ How to Add Content

### Adding a Diary Entry
1. Go to `yoursite.com/admin/login`
2. Sign in with your admin credentials
3. Click **"New Diary"** in the sidebar or dashboard
4. Fill in the title, author, hospital, specialty
5. Write the diary using the rich text editor (supports bold, italic, headings, lists, quotes)
6. Click **"Save Draft"** to save privately, or **"Publish"** to make it public

### Adding a Hospital
1. Go to **Admin → Hospitals → New Hospital**
2. Enter the name (the URL slug is auto-generated)
3. Add a description and image URL
4. Set the status (Active / New Data / Inactive)

---

## 🔄 Updating the Site

After initial deployment, every time you push to GitHub, Vercel automatically redeploys. You don't need to do anything manually.

---

## 📞 Support

Built for KMC LC IFMSA Pakistan. For technical questions, contact your LC's tech team.
