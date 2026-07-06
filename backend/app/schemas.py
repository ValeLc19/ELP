"""Request/response shapes and the Event serializer.

The frontend today consumes event objects with derived display fields
(`day`, `date`, `iso`, `dateISO`, `dateObj`). We store only `date_iso` and
rebuild those fields here, so the API is a drop-in for the current data shape.
"""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from .models import Business, Event

_MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
]


def _ordinal(n: int) -> str:
    suffix = "th" if 10 <= n % 100 <= 20 else {1: "st", 2: "nd", 3: "rd"}.get(n % 10, "th")
    return f"{n}{suffix}"


def serialize_event(e: Event) -> dict:
    """Return the flat dict the frontend expects, derived fields included."""
    d = datetime.strptime(e.date_iso, "%Y-%m-%d")
    return {
        "id": e.id,
        "seriesId": e.series_id,
        "title": e.title,
        "short": e.short,
        "category": e.category,
        "theme": e.theme,
        "image": e.image,
        "family": e.family,
        "address": e.address,
        "lat": e.lat,
        "lng": e.lng,
        "time": e.time,
        "price": e.price,
        "about": e.about,
        "additionalInfo": e.additional_info,
        "host": e.host,
        "recurLabel": e.recur_label,
        "sourceUrl": e.source_url,
        "fromBusiness": e.from_business,
        "businessId": e.business_id,
        # Derived display fields (rebuilt from date_iso):
        "dateISO": e.date_iso,
        "iso": e.date_iso,
        "dateObj": d.isoformat(),
        "day": d.day,
        "date": f"{_MONTHS[d.month - 1]} {_ordinal(d.day)}",
    }


# ---- businesses ------------------------------------------------------------

class BusinessIn(BaseModel):
    handle: str
    name: str
    avatar: Optional[str] = None
    url: Optional[str] = None


class BusinessOut(BaseModel):
    id: int
    handle: str
    name: str
    avatar: Optional[str] = None
    url: Optional[str] = None

    @classmethod
    def of(cls, b: Business) -> "BusinessOut":
        return cls(id=b.id, handle=b.handle, name=b.name, avatar=b.avatar, url=b.url)


# ---- saved events ----------------------------------------------------------

class SaveIn(BaseModel):
    seriesId: str
