# Deploying ELP

Two independent pieces:

- **Frontend** — this Vite + React SPA → **Cloudflare Pages** (below).
- **Backend** — the FastAPI service → **Render** + Supabase. See
  [`backend/README.md`](../backend/README.md).

They're glued by two env vars: the frontend's `VITE_API_BASE` points at the
backend URL, and the backend's `CORS_ORIGINS` lists the frontend URL.

---

## Frontend → Cloudflare Pages

Same setup as the Atlasly project: a static Vite build uploaded with `wrangler`.

### One-time setup

1. **Install deps** (adds `wrangler`): `npm install`
2. **Create the Pages project** (once): `npx wrangler pages project create elp`
   - Pick `main` as the production branch when prompted.
3. **Auth** — either run `npx wrangler login` (browser OAuth), or copy
   `.env.local.example` → `.env.local` and fill in a Cloudflare API token
   (Pages: Edit + Account Settings: Read) and your account ID.

### SPA routing

`public/_redirects` (`/*  /index.html  200`) makes deep links / refreshes work.
Vite copies it into `dist/` on build — nothing else to configure.

### Environment variables (baked in at build time)

Vite inlines `VITE_*` vars when it builds, so they must be present locally when
you run `npm run deploy` — there's no dashboard to set them in (the build
happens on your machine, not Cloudflare's).

- `.env.production` (committed) sets `VITE_API_BASE=https://elp-api.onrender.com`.
- `.env` (gitignored) holds your Supabase URL + publishable key; Vite loads it
  in every mode, so builds pick them up automatically.

### Deploy

```bash
# if using a token instead of `wrangler login`:
set -a; source .env.local; set +a

npm run deploy      # = vite build && wrangler pages deploy dist ...
```

You'll get a URL like `https://elp.pages.dev`. Every run redeploys.

---

## After the first deploy — connect the two sides

1. **Backend CORS:** set `CORS_ORIGINS` on Render to your Pages URL
   (e.g. `https://elp.pages.dev`) so the browser can call the API.
2. **Supabase auth URLs:** Authentication → URL Configuration →
   - **Site URL**: your Pages URL
   - **Redirect URLs**: add `https://elp.pages.dev/**` and keep
     `http://localhost:5173/**` for local dev.
3. **Keepalive:** confirm the URL in `.github/workflows/keepalive.yml` matches
   your Render backend.

## Local dev

- Frontend: `npm run dev` (http://localhost:5173).
- Backend: see `backend/README.md`. To exercise server sync locally, set
  `VITE_API_BASE=http://127.0.0.1:8000` in a local `.env` and run the backend.
  Leaving it unset keeps saved events / businesses in localStorage only.

## Known limitations at launch
- Supabase free-tier email is rate-limited and can land in spam.
- "From my businesses" events are still the mock prototype (the real
  social→event pipeline is the deferred backend step).
