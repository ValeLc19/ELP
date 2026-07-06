========================================================================
 ELP — DEPLOYMENT MAP                         status: PHASE 2 (blocked)
 open this in a Hive pane; I update it in place as we go. no browser needed.
========================================================================

WHAT WE'RE DOING
------------------------------------------------------------------------
ELP had no backend — saved events + followed businesses lived only in the
browser. We're wiring it to a real backend so that data lives in a database
and follows the user across devices. That needs three managed services,
each doing one job.


HOW THE PIECES FIT
------------------------------------------------------------------------

  [ Cloudflare Pages ] ---calls + token--> [ Render ] ---SQL + verify--> [ Supabase ]
    frontend (React)  <--events, saves---  backend    <--rows, JWKS----   Postgres + Auth
    project: elp                           FastAPI                        ES256 login
    the website people open                elp-api.onrender.com           agdarjcpgw...supabase.co

  Cloudflare = holds the SITE   (just static files, cheap + fast)
  Render     = holds the LOGIC  (verifies who you are, then reads/writes the DB)
  Supabase   = holds the TRUTH  (the database + the login that signs your token)


WHERE WE ARE
------------------------------------------------------------------------
  [x] 0  Build & merge the code ................... DONE  (on main)
  [x] 1  Collect Supabase keys .................... DONE
  [!] 2  Deploy the backend (Render) .............. >>> YOU ARE HERE (failing)
  [ ] 3  Deploy the frontend (Cloudflare) ......... next
  [ ] 4  Connect the two sides (CORS + auth URLs) . pending
  [ ] 5  Verify end to end ........................ pending


BLOCKER — what's stopping us right now
------------------------------------------------------------------------
  Render service `elp-api` exits on startup. Its boot runs 3 commands:

      alembic upgrade head  ->  seed 152 events  ->  start server
                                                     ^ exits with status 1
                                                       somewhere in here

  Build succeeds; the app dies while starting. The failure message is
  generic, so the real reason is one specific line in the Render logs.

  >> NEED FROM YOU: a screenshot of the Render **Logs** tab (the black
     console), scrolled to the red error / Traceback. That line tells us
     if it's the DB connection, the migration, or the app — fix follows.


ENV VARS on elp-api (Render) — target state
------------------------------------------------------------------------
  DATABASE_URL         postgresql+psycopg2://postgres.agdarjcpgwbdjgtkcvoi:***@aws-1-ca-central-1.pooler.supabase.com:5432/postgres
  CORS_ORIGINS         http://localhost:5173,https://elp-37r.pages.dev
  SUPABASE_URL         https://agdarjcpgwbdjgtkcvoi.supabase.co      (needed for ES256 auth)
  SUPABASE_JWT_SECRET  <legacy secret>                              (fallback only)


NOTES / decisions so far
------------------------------------------------------------------------
  - Supabase project is ELP (agdarjcpgwbdjgtkcvoi), NOT atlasly.
  - DB connection: Session pooler (IPv4, port 5432) — right for a Render server.
  - Tokens are ES256 -> backend verifies via Supabase JWKS (fix pushed: 41437c7).
  - Frontend stays untouched until phase 3.
========================================================================
