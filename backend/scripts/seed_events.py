"""Seed the events table from the frontend's curated data snapshot.

The snapshot (app/seed/events.json) is a JSON dump of the frontend's expanded
EVENTS array — regenerate it whenever the source data changes with:

    node --input-type=module -e "import('./src/data/events.js') \
      .then(m => process.stdout.write(JSON.stringify(m.EVENTS)))" \
      > backend/app/seed/events.json

Idempotent: upserts by event id, so re-running is safe (a no-op when the DB is
already current). Run from backend/:  python -m scripts.seed_events
"""
import json
from pathlib import Path

from app.database import SessionLocal
from app.models import Event

SEED = Path(__file__).resolve().parent.parent / "app" / "seed" / "events.json"


def run() -> int:
    data = json.loads(SEED.read_text())
    db = SessionLocal()
    try:
        for e in data:
            row = db.get(Event, e["id"])
            fields = dict(
                series_id=e.get("seriesId", e["id"]),
                title=e.get("title", ""),
                short=e.get("short"),
                category=e.get("category", "Markets"),
                theme=e.get("theme"),
                image=e.get("image"),
                family=bool(e.get("family", False)),
                address=e.get("address"),
                lat=e.get("lat"),
                lng=e.get("lng"),
                date_iso=e.get("dateISO") or e.get("iso"),
                time=e.get("time"),
                price=e.get("price"),
                about=e.get("about"),
                additional_info=e.get("additionalInfo"),
                host=e.get("host"),
                recur_label=e.get("recurLabel"),
                source_url=e.get("sourceUrl"),
                from_business=bool(e.get("fromBusiness", False)),
                business_id=e.get("businessId"),
            )
            if row is None:
                db.add(Event(id=e["id"], **fields))
            else:
                for k, v in fields.items():
                    setattr(row, k, v)
        db.commit()
        count = db.query(Event).count()
    finally:
        db.close()
    print(f"Seeded events. Table now holds {count} rows.")
    return count


if __name__ == "__main__":
    run()
