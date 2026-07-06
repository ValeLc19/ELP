"""Social -> event auto-fetch pipeline. STUB.

This is the deferred flagship: given a followed business, fetch its recent
social posts, extract event details (date/place/price) with a vision/LLM pass,
geocode the venue, and upsert rows into `events` with from_business=True.

Deliberately left unimplemented — it carries the real product decisions
(which platforms, scrape method, extraction model, ToS/rate limits) and is
sequenced last. The route exists so the shape is visible and returns 501.
"""
from fastapi import APIRouter, HTTPException, status

router = APIRouter(prefix="/pipeline", tags=["pipeline"])


@router.post("/refresh")
def refresh_business_events():
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="The social-to-event pipeline is not implemented yet.",
    )
