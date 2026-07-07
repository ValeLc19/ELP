"""Per-user events the user added themselves (e.g. pasted from a link).

Private to the user (scoped by Supabase user id), separate from the public
`events` catalog. Serialized into the same shape the frontend renders, tagged
fromBusiness so it shows behind the "From my businesses" chip.
"""
from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..auth import get_current_user_id
from ..database import get_db
from ..models import UserEvent
from ..schemas import UserEventIn, serialize_user_event

router = APIRouter(prefix="/me/events", tags=["user-events"])


@router.get("")
def list_user_events(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> list[dict]:
    rows = db.execute(
        select(UserEvent).where(UserEvent.user_id == user_id).order_by(UserEvent.date_iso)
    ).scalars().all()
    return [serialize_user_event(e) for e in rows]


@router.post("", status_code=status.HTTP_201_CREATED)
def add_user_event(
    body: UserEventIn,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> dict:
    ev = UserEvent(
        user_id=user_id,
        business_id=body.businessId,
        business_name=body.businessName,
        title=body.title.strip(),
        category=body.category or "Markets",
        image=body.image,
        address=body.address,
        date_iso=body.dateISO,
        time=body.time,
        price=body.price,
        about=body.about,
        source_url=body.sourceUrl,
    )
    db.add(ev)
    db.commit()
    db.refresh(ev)
    return serialize_user_event(ev)


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_user_event(
    event_id: int,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    db.query(UserEvent).filter(
        UserEvent.user_id == user_id,
        UserEvent.id == event_id,
    ).delete()
    db.commit()
