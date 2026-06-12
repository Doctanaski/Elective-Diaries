# CLAUDE WORKFLOW — How to make changes to Elective Diaries

This file documents the standard process Claude should follow whenever the
user (Haziq) asks for changes to **The Elective Diaries** website. Follow
these steps every time, in order, unless the user explicitly asks for
something different.

---

## 0. Context

- **Local project path (Windows):** `D:\New Folder\Elective Diaries\elective-diaries`
- **GitHub repo:** https://github.com/Doctanaski/Elective-Diaries
- **Hosting:** Vercel (auto-deploys on push to `main`)
- **Git executable:** Not on PATH in the Desktop Commander shell — always call
  it via its full path: `C:\Program Files\Git\cmd\git.exe`
- Read `CLAUDE_CONTEXT.md` in the project root first if you need a refresher
  on the tech stack, file structure, and design system (dark green medical
  aesthetic, Material Symbols icons, Tailwind tokens like `bg-surface`,
  `bg-surface-container-low`, `text-on-surface-variant`, etc.)

---

## 1. Orient yourself before editing

1. Use `Filesystem:list_allowed_directories` once per session if you haven't
   already (D:\ and C:\ should be available).
2. Use `Filesystem:list_directory` / `Desktop Commander:read_multiple_files`
   to open the specific file(s) relevant to the request. Don't guess at file
   contents — always read the current version first, since previous edits in
   earlier sessions may have already changed things.
3. If the request touches a page or component you haven't looked at this
   session, read the whole file (or at least the relevant section) before
   editing it.

---

## 2. Make the edits

- Use `Filesystem:edit_file` for targeted changes (preferred — keeps diffs
  small and reviewable). Use `Filesystem:write_file` only for brand-new files
  or full rewrites of small files.
- Preserve existing conventions:
  - Tailwind utility classes and the existing color tokens (don't introduce
    new ad-hoc colors).
  - Mobile-first responsiveness: when changing layout, always check how it
    behaves at `sm:` / `md:` / `lg:` breakpoints, not just desktop.
  - Keep the dark theme — no light-mode classes or `ThemeToggle` references.
- If a change affects the database schema (new fields, new tables):
  1. Update `types/database.ts` (the relevant interface).
  2. Update the admin form component (e.g. `DiaryForm.tsx` /
     `HospitalForm.tsx`) to add the input field and include it in the payload
     sent to Supabase.
  3. Update the public-facing page(s) that display the data.
  4. Append a migration snippet to `supabase/schema.sql` under a new
     `-- vNN MIGRATION` comment block, using `ALTER TABLE ... ADD COLUMN IF
     NOT EXISTS ...` so it's safe to re-run. Tell the user they need to run
     this SQL manually in the Supabase SQL Editor — Claude cannot run it for
     them.
- If a change involves adding a static asset (image, etc.) that the user
  uploads via chat:
  1. Base64-encode the file in the sandbox (`bash_tool` with `base64 ... | tr
     -d '\n'`).
  2. Write that base64 string to a `.txt` file inside the project's `public/`
     folder via `Filesystem:write_file`.
  3. Write a small PowerShell script (also via `Filesystem:write_file`) that
     reads the `.txt` file, decodes it with
     `[System.Convert]::FromBase64String(...)`, writes the binary file with
     `[System.IO.File]::WriteAllBytes(...)`, then deletes both the `.txt` and
     the script itself.
  4. Run that script with `Desktop Commander:start_process`
     (`powershell.exe`).
  5. Reference the resulting file from `/public/...` in the relevant
     component (Next.js serves `public/` at the site root).

---

## 3. Push to GitHub

After all edits for the request are complete:

1. Use `Desktop Commander:start_process` with `shell: "powershell.exe"`.
2. Run all three git commands as a single chained command using the full
   path to git (PowerShell does NOT have git on PATH in this environment):

   ```powershell
   $git = "C:\Program Files\Git\cmd\git.exe"; Set-Location "D:\New Folder\Elective Diaries\elective-diaries"; & $git add -A; & $git commit -m "vNN: <short description of changes>"; & $git push
   ```

3. Increment the version number `vNN` from whatever the last commit used
   (check with `git log --oneline -1` if unsure, or just keep counting up —
   it's just a label).
4. Write a clear, specific commit message summarizing what changed (not
   generic messages like "update files").
5. **Known quirk:** output from git commands often doesn't stream back
   through `read_process_output` in this environment (you'll see "no output
   in requested range" even on success). As long as the process exits with
   code 0, treat the push as successful. If you need to verify, redirect
   output to a file in `D:\` and read that file back with
   `Filesystem:read_text_file`, e.g.:

   ```powershell
   $git = "C:\Program Files\Git\cmd\git.exe"; Set-Location "D:\New Folder\Elective Diaries\elective-diaries"; $out = & $git log --oneline -3 2>&1; Write-Host $out
   ```

   then read with `Filesystem:read_text_file` on the redirected file.
6. Do NOT use `cmd` shell with `cd /d "D:\New Folder..."` — paths with spaces
   break `cd /d` in this environment. Always use `powershell.exe` with
   `Set-Location "..."` (quoted) instead.

---

## 4. After pushing

- Briefly summarize what changed and why, in plain language, for the user.
- If a Supabase migration is required, clearly call this out as a manual step
  the user must do themselves (give them the exact SQL).
- Mention that Vercel will auto-deploy from the `main` branch within a minute
  or two — no further action needed from Claude.
- Don't create extra documentation files, READMEs, or summaries unless asked.

---

## 5. General etiquette

- Don't ask for confirmation before making routine code edits and pushing —
  the user has asked for this workflow specifically so that requests can be
  actioned directly.
- Do ask for clarification if a request is ambiguous about *which* page/
  component it applies to (e.g. "the diary page" could mean the scroll-snap
  viewer at `hospitals/[slug]/page.tsx` or the reader at
  `hospitals/[slug]/diaries/[id]/page.tsx`).
- Keep responses concise — the user wants the change made and pushed, not a
  long explanation, unless something unusual happened (errors, manual steps
  required, etc.).
- Clean up any temporary files (decode scripts, base64 `.txt` files, etc.)
  created in `public/` or elsewhere in the repo before pushing — only commit
  files that are actually part of the website.
