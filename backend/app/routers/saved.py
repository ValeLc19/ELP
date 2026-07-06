"""Per-user saved events. Replaces the browser's `elp-saved-events` set.

Saves are per-series (recurring instances share one save), matching the
frontend's current semantics. All routes require a valid Supabase token.
"""
from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..auth import get_current_user_id
from ..database import get_db
from ..models import SavedEvent
from ..schemas import SaveIn

router = APIRouter(prefix="/me/saved", tags=["saved"])


@router.get("")
def list_saved(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> list[str]:
    rows = db.execute(
        select(SavedEvent.series_id).where(SavedEvent.user_id == user_id)
    ).scalars().all()
    return list(rows)


@router.post("", status_code=status.HTTP_204_NO_CONTENT)
def add_saved(
    body: SaveIn,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    exists = db.execute(
        select(SavedEvent).where(
            SavedEvent.user_id == user_id,
            SavedEvent.series_id == body.seriesId,
        )
    ).scalar_one_or_none()
    if not exists:
        db.add(SavedEvent(user_id=user_id, series_id=body.seriesId))
        db.commit()


@router.delete("/{series_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_saved(
    series_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    db.query(SavedEvent).filter(
        SavedEvent.user_id == user_id,
        SavedEvent.series_id == series_id,
    ).delete()
    db.commit()
