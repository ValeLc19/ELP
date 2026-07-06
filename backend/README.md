# ELP API

FastAPI backend for ELP, built to the same shape as the Atlasly service:
FastAPI + SQLAlchemy/psycopg2 → Supabase Postgres, schema owned by Alembic,
deployed on Render, kept warm by a GitHub Actions keepalive cron.

## What it owns

- **`GET /events`** — the public event catalog (seeded from the frontend's
  curated data). Optional `?category=` and `?upcoming_from=YYYY-MM-DD`.
- **`/me/saved`** — per-user saved event series (`GET`, `POST {seriesId}`,
  `DELETE /{seriesId}`). Replaces the browser's `elp-saved-events`.
- **`/me/businesses`** — per-user followed businesses (`GET`, `POST`,
  `DELETE /{id}`). Replaces the browser's `elp-businesses`.
- **`POST /pipeline/refresh`** — the deferred social→event auto-fetch pipeline.
  Stubbed (returns 501); it's sequenced last.

Auth: the browser keeps using Supabase Auth and sends its access token as
`Authorization: Bearer <jwt>`. The `/me/*` routes verify it with the project's
JWT secret (HS256). `/events` and `/health` are public.

## Run locally

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # defaults to a local SQLite file
alembic upgrade head          # create tables
python -m scripts.seed_events # load the 152 curated events
uvicorn app.main:app --reload # http://127.0.0.1:8000  (docs at /docs)
```

`/me/*` routes need `SUPABASE_JWT_SECRET` set in `.env` to accept tokens.

## Deploy (Render) — mirrors Atlasly

1. **Supabase**: grab the pooled connection string (Connect → SQLAlchemy) and
   the JWT secret (Settings → API).
2. **Render**: connect the repo → it reads `render.yaml` → set `DATABASE_URL`,
   `CORS_ORIGINS` (your frontend URL), and `SUPABASE_JWT_SECRET` as dashboard
   secrets. First deploy runs `alembic upgrade head && seed` automatically.
3. **Keepalive**: update the URL in `.github/workflows/keepalive.yml` to the
   assigned `*.onrender.com` host.
4. Redeploys on every `git push`.

## Regenerate the events seed

The snapshot at `app/seed/events.json` is a dump of the frontend's expanded
`EVENTS`. Regenerate when the source data changes:

```bash
node --input-type=module -e "import('./src/data/events.js') \
  .then(m => process.stdout.write(JSON.stringify(m.EVENTS)))" \
  > backend/app/seed/events.json
```
