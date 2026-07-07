"""Database models.

Three tables:
  events        — the public event catalog (seeded from the frontend's
                  curated data; later also written by the social pipeline).
  saved_events  — per-user saves (replaces the browser's localStorage set).
  businesses    — per-user followed businesses (replaces localStorage).

Types are kept portable (String/Integer/Float/Boolean/DateTime) so the same
models run on SQLite in dev and Postgres in prod. Annotations use Optional
rather than `X | None` so the module imports on Python 3.9 as well as 3.12.
"""
from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, Float, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from .database import Base


class Event(Base):
    __tablename__ = "events"

    # Instance id from the source data (e.g. "cool-canyon-nights-2026-07-09").
    id: Mapped[str] = mapped_column(String, primary_key=True)
    # Series the instance belongs to; recurring instances share a series_id.
    series_id: Mapped[str] = mapped_column(String, index=True)

    title: Mapped[str] = mapped_column(String)
    short: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    category: Mapped[str] = mapped_column(String, index=True)
    theme: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    image: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    family: Mapped[bool] = mapped_column(Boolean, default=False)

    address: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    lat: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    lng: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    # The instance date as YYYY-MM-DD; display fields (day/date/dateObj) are
    # derived from this in the API layer so the DB stays free of redundancy.
    date_iso: Mapped[str] = mapped_column(String, index=True)
    time: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    price: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    about: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    additional_info: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    host: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    recur_label: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    source_url: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    # Set by the (future) social pipeline for events auto-detected from a
    # business's posts. False for the curated catalog.
    from_business: Mapped[bool] = mapped_column(Boolean, default=False)
    business_id: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class SavedEvent(Base):
    __tablename__ = "saved_events"
    __table_args__ = (UniqueConstraint("user_id", "series_id", name="uq_user_series"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    # Supabase auth user id (uuid string). Not a FK — auth lives in Supabase.
    user_id: Mapped[str] = mapped_column(String, index=True)
    # A save is per-series (recurring instances share one save), matching the
    # frontend's current localStorage semantics.
    series_id: Mapped[str] = mapped_column(String)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class UserEvent(Base):
    """An event a user added themselves (e.g. pasted from a business's link).

    Private to the user — separate from the public `events` catalog so it's
    never visible to anyone else. Mirrors the fields the frontend renders.
    """
    __tablename__ = "user_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(String, index=True)
    business_id: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    business_name: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    title: Mapped[str] = mapped_column(String)
    category: Mapped[str] = mapped_column(String, default="Markets")
    image: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    address: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    lat: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    lng: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    date_iso: Mapped[str] = mapped_column(String, index=True)
    time: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    price: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    about: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    source_url: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Business(Base):
    __tablename__ = "businesses"
    __table_args__ = (UniqueConstraint("user_id", "name", name="uq_user_business"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(String, index=True)
    handle: Mapped[str] = mapped_column(String)
    name: Mapped[str] = mapped_column(String)
    avatar: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    url: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
