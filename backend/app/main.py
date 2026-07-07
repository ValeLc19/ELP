"""FastAPI application entrypoint.

Mirrors the Atlasly backend: CORS driven off settings, a trivial /health route
that also touches the DB (so the keepalive cron counts as DB activity and keeps
Supabase from auto-pausing), and a catch-all exception handler that re-attaches
CORS headers on 500s — otherwise the browser hides the real error behind an
opaque CORS failure.
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text

from .config import settings
from .database import engine
from .routers import businesses, events, pipeline, saved, user_events

app = FastAPI(title="ELP API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    """Liveness + a tiny DB touch that resets Supabase's idle timer."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        db_ok = True
    except Exception:
        db_ok = False
    return {"status": "ok", "db": db_ok}


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    """Return JSON (not an opaque 500) and keep CORS headers on errors."""
    origin = request.headers.get("origin")
    headers = {}
    if origin and origin in settings.cors_origin_list:
        headers["Access-Control-Allow-Origin"] = origin
        headers["Access-Control-Allow-Credentials"] = "true"
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error."},
        headers=headers,
    )


app.include_router(events.router)
app.include_router(saved.router)
app.include_router(businesses.router)
app.include_router(pipeline.router)
app.include_router(user_events.router)
