"""Per-user events the user added themselves (e.g. pasted from a link).

Private to the user (scoped by Supabase user id), separate from the public
`events` catalog. Serialized into the same shape the frontend renders, tagged
fromBusiness so it shows behind the "From my businesses" chip.
"""
import json
import urllib.parse
import urllib.request

from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..auth import get_current_user_id
from ..database import get_db
from ..models import UserEvent
from ..schemas import UserEventIn, serialize_user_event

router = APIRouter(prefix="/me/events", tags=["user-events"])

# El Paso center — the fallback pin when there's no address or geocoding fails.
_ELP = (31.7619, -106.4850)


def _geocode(address):
    """Best-effort address -> (lat, lng) via OpenStreetMap Nominatim.

    Free, no key. Falls back to El Paso center so the event always has a pin.
    """
    if not address or not address.strip():
        return _ELP
    q = address.strip()
    low = q.lower()
    if "el paso" not in low and " tx" not in low and "texas" not in low:
        q = f"{q}, El Paso, TX"
    try:
        url = "https://nominatim.openstreetmap.org/search?" + urllib.parse.urlencode(
            {"q": q, "format": "json", "limit": 1, "countrycodes": "us"}
        )
        req = urllib.request.Request(
            url, headers={"User-Agent": "ELP-events/1.0 (elpaso community events app)"}
        )
        with urllib.request.urlopen(req, timeout=6) as resp:
            data = json.loads(resp.read())
        if data:
            return float(data[0]["lat"]), float(data[0]["lon"])
    except Exception:
        pass
    return _ELP


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
    lat, lng = _geocode(body.address)
    # Store one or more categories comma-joined; fall back to the single field.
    cats = body.categories or ([body.category] if body.category else [])
    cats = [c for c in dict.fromkeys(cats) if c] or ["Markets"]
    ev = UserEvent(
        user_id=user_id,
        business_id=body.businessId,
        business_name=body.businessName,
        title=body.title.strip(),
        category=",".join(cats),
        image=body.image,
        address=body.address,
        lat=lat,
        lng=lng,
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
