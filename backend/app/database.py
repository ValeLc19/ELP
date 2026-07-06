"""SQLAlchemy engine + session, one per process.

pool_pre_ping=True matters against Supabase: the free tier drops idle
connections, and pre-ping quietly re-opens them instead of surfacing a stale
"server closed the connection" error on the first request after a lull.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from .config import settings

# SQLite (dev default) needs check_same_thread=False to be used across
# FastAPI's threadpool; Postgres ignores this arg.
connect_args = (
    {"check_same_thread": False}
    if settings.database_url.startswith("sqlite")
    else {}
)

engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    connect_args=connect_args,
)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    pass


def get_db():
    """FastAPI dependency: yields a session and always closes it."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
