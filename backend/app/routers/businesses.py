"""Per-user followed businesses. Replaces the browser's `elp-businesses` list.

Name derivation / avatar guessing stays on the frontend (it's presentation
logic); the client sends the already-derived handle/name/avatar/url and this
just persists them per user. All routes require a valid Supabase token.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..auth import get_current_user_id
from ..database import get_db
from ..models import Business
from ..schemas import BusinessIn, BusinessOut

router = APIRouter(prefix="/me/businesses", tags=["businesses"])


@router.get("")
def list_businesses(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> list[BusinessOut]:
    rows = db.execute(
        select(Business).where(Business.user_id == user_id).order_by(Business.created_at)
    ).scalars().all()
    return [BusinessOut.of(b) for b in rows]


@router.post("", status_code=status.HTTP_201_CREATED)
def add_business(
    body: BusinessIn,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> BusinessOut:
    # De-dupe on (user, name), case-insensitive, mirroring the frontend.
    existing = db.execute(
        select(Business).where(Business.user_id == user_id)
    ).scalars().all()
    if any(b.name.lower() == body.name.lower() for b in existing):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You already follow that business.",
        )
    biz = Business(
        user_id=user_id,
        handle=body.handle,
        name=body.name,
        avatar=body.avatar,
        url=body.url,
    )
    db.add(biz)
    db.commit()
    db.refresh(biz)
    return BusinessOut.of(biz)


@router.delete("/{business_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_business(
    business_id: int,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    db.query(Business).filter(
        Business.id == business_id,
        Business.user_id == user_id,
    ).delete()
    db.commit()
