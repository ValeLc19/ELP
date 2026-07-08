========================================================================
 ELP — DEPLOYMENT STATUS                        status: LIVE (all phases)
 Visual version: docs/deploy-map.html (open as a Hive canvas).
========================================================================

WHAT WE BUILT
------------------------------------------------------------------------
ELP started with no backend — saved events and followed businesses lived
only in the browser. It's now wired to a real backend, so that data lives
in a database and follows the user across devices. Three managed services,
each doing one job.


HOW THE PIECES FIT
------------------------------------------------------------------------

  [ Cloudflare Pages ] --calls + token--> [ Render ] --SQL + verify--> [ Supabase ]
    frontend (React)  <--events, saves--   backend   <--rows, JWKS---   Postgres + Auth
    elpaso-events                          FastAPI                      agdarjcpgw...
      .pages.dev                           elp-api.onrender.com           .supabase.co

  Cloudflare = holds the SITE   (static files, cheap + fast)
  Render     = holds the LOGIC  (verifies who you are, reads/writes the DB)
  Supabase   = holds the TRUTH  (the database + the login that signs the token)


WHERE WE ARE
------------------------------------------------------------------------
  [x] 0  Build & merge the code ................... DONE (on main)
  [x] 1  Supabase project + keys .................. DONE
  [x] 2  Deploy the backend (Render) .............. LIVE
  [x] 3  Deploy the frontend (Cloudflare) ......... LIVE
  [x] 4  Connect the two sides (CORS + auth URLs) . DONE
  [x] 5  Verify end to end ........................ VERIFIED (250 events)


WHERE THE EVENTS COME FROM
------------------------------------------------------------------------
  visitelpaso.com -> GitHub Actions -> Supabase -> GET /events -> the app
   (sitemap+JSON-LD)  (daily 11:00 UTC)  (events table) (public, no auth)

  250 live events: Arts 100, Outdoors 41, Food 40, Markets 40,
  Music 17, Sports 12.

  The scrape runs in GitHub Actions, not the Render dyno — a ~1,350-URL
  crawl would blow a request timeout. Images are themed Unsplash stock,
  never visitelpaso's copyrighted art.


WHAT RUNS ON ITS OWN
------------------------------------------------------------------------
  sync-events   cron 0 11 * * *              re-scrape + upsert daily
  keepalive     cron 0 12 1,7,13,19,25 * *   ping /health so free-tier
                                             Supabase doesn't auto-pause


CONFIG THAT BIT US — keep it this way
------------------------------------------------------------------------
  - Render needs SUPABASE_URL. Logins are ES256, verified against that
    project's JWKS. Missing it => every authed request 401s. Not a secret.
  - Use the apex URL (elpaso-events.pages.dev). Each `npm run deploy` also
    publishes a <hash>.elpaso-events.pages.dev preview — which is what
    Cloudflare shows you. Easy to test the wrong site. CORS covers both.
  - "Works local, broken prod" misleads: most user data is local-first, so
    server 401s fail silently. Only /pipeline/extract hard-depends on the
    backend — debug prod auth there, not on saves.


STILL OPEN
------------------------------------------------------------------------
  - DEFERRED: full auto-scrape of IG/FB/TikTok posts. Paste-a-link
    extraction ships today; auto-pull needs a vision LLM (paid key) and a
    way past each platform's login wall.
  - LIMIT: Supabase free-tier email is rate-limited and can land in spam.
    Fine for a demo; a real launch wants custom SMTP.


  Render redeploys only on push to main. Cloudflare deploys on
  `npm run deploy`. Full runbook: docs/deploy.md
========================================================================
