"""Public event catalog. No auth — anyone can browse events."""
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Event
from ..schemas import serialize_event

router = APIRouter(prefix="/events", tags=["events"])


@router.get("")
def list_events(
    db: Session = Depends(get_db),
    category: Optional[str] = Query(default=None, description="Filter by category"),
    upcoming_from: Optional[str] = Query(
        default=None, description="Only events on/after this YYYY-MM-DD"
    ),
):
    stmt = select(Event)
    if category:
        stmt = stmt.where(Event.category == category)
    if upcoming_from:
        stmt = stmt.where(Event.date_iso >= upcoming_from)
    stmt = stmt.order_by(Event.date_iso, Event.title)
    rows = db.execute(stmt).scalars().all()
    return [serialize_event(e) for e in rows]
