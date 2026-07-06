# Deploying ELP (Vercel)

ELP is a static Vite + React SPA. These steps get it onto a real public URL.

## 1. Create the Vercel project

1. Go to https://vercel.com and sign in **with GitHub** (same account that owns the ELP repo).
2. **Add New → Project** → import the **ELP** repository.
3. Vercel auto-detects Vite. Leave the defaults:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. **Before** clicking Deploy, add the environment variables (next step).

## 2. Add environment variables

The local `.env` is gitignored, so the deployed site has no keys unless you add them here.

In the project's **Settings → Environment Variables** (or the "Environment Variables"
section on the import screen), add:

| Name | Value |
| --- | --- |
| `VITE_SUPABASE_URL` | `https://agdarjcpgwbdjgtkcvoi.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | your `sb_publishable_...` key (same as local `.env`) |

Both are safe to expose in the browser (RLS protects the data). Apply them to
Production (and Preview if you want branch previews to work).

Then **Deploy**. You'll get a URL like `https://elp-xxxx.vercel.app`.

## 3. Point Supabase at the live URL

So confirmation emails link back to the deployed site instead of localhost:

- Supabase → **Authentication → URL Configuration**
- **Site URL**: your Vercel URL (e.g. `https://elp-xxxx.vercel.app`)
- **Redirect URLs**: add both
  - `https://elp-xxxx.vercel.app/**`
  - `http://localhost:5173/**` (keep this so local dev still works)
- Save.

## 4. Every push auto-deploys

After this, every `git push` to `main` triggers a new deploy automatically.

## Known limitations at launch
- Saved events and businesses are still browser-local (localStorage), not per-account
  in the database — the deferred "per-user data" step.
- Supabase free-tier email is rate-limited and can land in spam.
- "From my businesses" events are the mock prototype.
