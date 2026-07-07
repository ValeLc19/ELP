"""Sync upcoming El Paso events from visitelpaso.com into the events table.

Stage 2 of keeping the general-events catalog fresh. visitelpaso publishes a
sitemap of every event URL, and each event page is server-rendered with
schema.org JSON-LD `Event` data, so no headless scraping is needed. This job:

  1. fetches the sitemap -> every /events/<slug> URL
  2. reads each page's JSON-LD Event (reusing app.routers.pipeline helpers)
  3. keeps upcoming, in-person, local (El Paso) events; drops online /
     conference / out-of-window noise
  4. upserts them into `events` with source='visitelpaso' and prunes its own
     stale rows (past, or no longer in the sitemap)

Curated seed rows (source='seed') are never touched. Images use the app's
themed Unsplash stock (not visitelpaso's copyrighted art). Idempotent — geocodes
only new rows. robots.txt permits this (sitemap published, /events allowed).

Run from backend/:  python -m scripts.sync_visitelpaso [--dry]
"""
import os
import re
import sys
import time
from datetime import date, timedelta

from app.database import SessionLocal
from app.models import Event
from app.routers.pipeline import _fetch, _iter_events, _split_dt, _address, _price, _text
from app.routers.user_events import _geocode

import json

SITEMAP = "https://visitelpaso.com/sitemap.xml"
WINDOW_DAYS = int(os.environ.get("SYNC_WINDOW_DAYS", "90"))  # events within N days
MAX_EVENTS = int(os.environ.get("SYNC_MAX_EVENTS", "250"))   # cap kept per run
PAGE_THROTTLE = 0.35    # seconds between page fetches (politeness)
GEO_THROTTLE = 1.0      # Nominatim asks for <= 1 req/sec

# --- themed stock imagery (ported from src/data/events.js) ------------------
def _stock(i):
    return f"https://images.unsplash.com/photo-{i}?w=800&q=80&auto=format&fit=crop"

THEME_IMAGES = {
    "concert": _stock("1501386761578-eac5c94b800a"),
    "music": _stock("1511671782779-c97d3d27a1d4"),
    "dance": _stock("1504609773096-104ff2c73ba4"),
    "theater": _stock("1503095396549-807759245b35"),
    "film": _stock("1489599849927-2ee91cede3ba"),
    "artgallery": _stock("1531058020387-3be344556be6"),
    "crafts": _stock("1513364776144-60967b0f800f"),
    "fashion": _stock("1469334031218-e382a71b716b"),
    "yoga": _stock("1506126613408-eca07ce68773"),
    "running": _stock("1452626038306-9aae5e071dd3"),
    "hiking": _stock("1551632811-561732d1e306"),
    "baseball": _stock("1508344928928-7165b67de128"),
    "football": _stock("1566577739112-5180d4bf9390"),
    "airshow": _stock("1436491865332-7a61a109cc05"),
    "market": _stock("1488459716781-31db52582fe9"),
    "festival": _stock("1459749411175-04bf5292ceea"),
    "fireworks": _stock("1467810563316-b5476525c0f9"),
    "historic": _stock("1505761671935-60b3a7427bad"),
    "workshop": _stock("1552581234-26160f608093"),
    "pub": _stock("1514933651103-005eec06c04b"),
    "icecream": _stock("1488900128323-21503983a07e"),
    "bbq": _stock("1529193591184-b1d58069ecdd"),
    "wine": _stock("1510812431401-41d2bd2722f3"),
    "restaurant": _stock("1414235077428-338989a2e8c0"),
}

# category keyword rules (ported from src/lib/ocr.js CAT_RULES)
CAT_RULES = [
    ("Food", re.compile(r"coffee|matcha|\btea\b|caf[eé]|bakery|kitchen|grill|bbq|taco|pizza|\bfood\b|brunch|dinner|brew|beer|wine|juice|smoothie|dessert|sweet|donut|deli|diner|\bbar\b|tasting|drink", re.I)),
    ("Arts", re.compile(r"\bbook|\bart\b|gallery|studio|paint|craft|museum|theat|\bpress\b|\bprint|pottery|ceramic|maker|exhibit|film|movie", re.I)),
    ("Music", re.compile(r"music|record|\bsound\b|\bdj\b|\bband\b|vinyl|\bstage\b|concert|jazz|karaoke|symphon|salsa|cumbia", re.I)),
    ("Sports", re.compile(r"yoga|\bgym\b|\bfit|\brun\b|marathon|sport|climb|\bbike\b|workout|pilates|dance|zumba|baseball|football", re.I)),
    ("Outdoors", re.compile(r"\bpark\b|garden|\bhike|\btrail\b|outdoor|nature|\bcamp|sunrise|canyon", re.I)),
    ("Markets", re.compile(r"market|pop-?up|vendor|bazaar|\bfair\b|flea|\bsale\b", re.I)),
]

# keyword -> nicer theme for the stock image (first match wins)
THEME_RULES = [
    (re.compile(r"yoga|pilates", re.I), "yoga"),
    (re.compile(r"\bwine\b|vineyard", re.I), "wine"),
    (re.compile(r"\bbbq\b|barbecue", re.I), "bbq"),
    (re.compile(r"ice ?cream", re.I), "icecream"),
    (re.compile(r"film|movie|cinema", re.I), "film"),
    (re.compile(r"theat|play\b|drama", re.I), "theater"),
    (re.compile(r"danc|ballet", re.I), "dance"),
    (re.compile(r"firework", re.I), "fireworks"),
    (re.compile(r"market|bazaar|vendor|pop-?up", re.I), "market"),
    (re.compile(r"festival|fest\b|fiesta", re.I), "festival"),
    (re.compile(r"concert|symphon|band|music|jazz|salsa|cumbia|karaoke", re.I), "concert"),
    (re.compile(r"marathon|\brun\b|\b5k\b", re.I), "running"),
    (re.compile(r"hike|trail|canyon|sunrise", re.I), "hiking"),
    (re.compile(r"craft|maker|pottery|ceramic", re.I), "crafts"),
    (re.compile(r"fashion|runway", re.I), "fashion"),
    (re.compile(r"pub|\bbar\b|brew|beer", re.I), "pub"),
    (re.compile(r"histor|heritage|walking tour", re.I), "historic"),
    (re.compile(r"baseball|chihuahuas", re.I), "baseball"),
    (re.compile(r"airsho|air show", re.I), "airshow"),
    (re.compile(r"workshop|class|course|seminar", re.I), "workshop"),
    (re.compile(r"gallery|art|exhibit|museum|paint", re.I), "artgallery"),
]

CATEGORY_THEME = {
    "Food": "restaurant", "Arts": "artgallery", "Music": "concert",
    "Sports": "running", "Outdoors": "hiking", "Markets": "market",
}

# events we don't want in a "local things to do" catalog
ONLINE_RE = re.compile(r"\b(webinar|virtual|online|webcast|livestream|zoom|e-?conference)\b", re.I)
DROP_RE = re.compile(r"\b(conference|summit|congress|symposium|convention|expo)\b", re.I)
FAMILY_RE = re.compile(r"family|kids|children|all ages", re.I)
ADULT_RE = re.compile(r"\b21\+|21 and over|adults only\b", re.I)
LOCAL_RE = re.compile(r"el paso|,\s*tx\b|texas", re.I)


def guess_category(text: str) -> str:
    for cat, rx in CAT_RULES:
        if rx.search(text):
            return cat
    return "Markets"


def pick_theme(text: str, category: str) -> str:
    for rx, theme in THEME_RULES:
        if rx.search(text):
            return theme
    return CATEGORY_THEME.get(category, "festival")


def _event_node(html: str):
    for block in re.findall(
        r'<script[^>]+type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',
        html, re.I | re.S,
    ):
        try:
            data = json.loads(block.strip())
        except Exception:
            continue
        for ev in _iter_events(data):
            return ev
    return None


def _base_slug(slug: str) -> str:
    return re.sub(r"-\d{4}-\d{2}-\d{2}$", "", re.sub(r"^\d+-", "", slug))


def _clean_address(addr):
    """Collapse newlines/whitespace for display."""
    if not addr:
        return addr
    return re.sub(r"\s+", " ", addr.replace("\n", ", ")).strip(" ,")


def _geo_query(addr: str) -> str:
    """A Nominatim-friendly query: start at the street number, drop the venue
    name prefix and suite/unit fragments (those return zero results)."""
    a = _clean_address(addr) or ""
    m = re.search(r"\d{2,6}\s+\w.*", a)
    if m:
        a = m.group(0)
    a = re.sub(r"\b(suite|ste|unit|apt|#)\s*\S+", "", a, flags=re.I)
    return re.sub(r"\s*,\s*(,|$)", r"\1", a).strip(" ,")


def run(dry: bool = False) -> int:
    today = date.today().isoformat()
    horizon = (date.today() + timedelta(days=WINDOW_DAYS)).isoformat()

    xml = _fetch(SITEMAP)
    urls = sorted(set(re.findall(r"https://visitelpaso\.com/events/[a-z0-9][a-z0-9-]+", xml)))

    db = SessionLocal()
    seen = set()
    kept = 0
    skip = {"date": 0, "online": 0, "nonlocal": 0, "nodata": 0, "fetch": 0}
    pruned = 0
    try:
        for url in urls:
            if kept >= MAX_EVENTS:
                break
            slug = url.split("/events/")[-1]
            # cheap prefilter: dated slugs out of window are skipped without a fetch
            dm = re.search(r"-(\d{4}-\d{2}-\d{2})$", slug)
            if dm and not (today <= dm.group(1) <= horizon):
                skip["date"] += 1
                continue

            try:
                html = _fetch(url)
            except Exception:
                skip["fetch"] += 1
                continue
            time.sleep(PAGE_THROTTLE)

            node = _event_node(html)
            if not node:
                skip["nodata"] += 1
                continue
            di, ti = _split_dt(node.get("startDate"))
            if not di or not (today <= di <= horizon):
                skip["date"] += 1
                continue
            loc = node.get("location")
            if isinstance(loc, dict) and "Virtual" in str(loc.get("@type", "")):
                skip["online"] += 1
                continue

            title = _text(node.get("name")) or ""
            about = _text(node.get("description")) or ""
            addr = _clean_address(_address(loc))
            blob = f"{title} {about} {addr or ''}"
            if ONLINE_RE.search(blob) or DROP_RE.search(blob):
                skip["online"] += 1
                continue
            if not addr or not LOCAL_RE.search(addr):
                skip["nonlocal"] += 1
                continue

            category = guess_category(blob)
            theme = pick_theme(blob, category)
            image = THEME_IMAGES.get(theme, THEME_IMAGES["festival"])
            host = addr.split(" - ", 1)[0].strip() if " - " in addr else None
            price = _price(node.get("offers")) or "See details"
            family = bool(FAMILY_RE.search(blob))
            age_note = "21+" if ADULT_RE.search(blob) else None

            ev_id = slug
            seen.add(ev_id)
            row = db.get(Event, ev_id)
            # geocode only when we don't already have coords (Nominatim politeness);
            # dry runs skip geocoding entirely so they stay fast.
            if dry:
                lat, lng = None, None
            elif row is not None and row.lat is not None and row.lng is not None:
                lat, lng = row.lat, row.lng
            else:
                lat, lng = _geocode(_geo_query(addr))
                time.sleep(GEO_THROTTLE)

            fields = dict(
                series_id=_base_slug(slug), title=title, short=None,
                category=category, theme=theme, image=image, family=family,
                address=addr, lat=lat, lng=lng, date_iso=di, time=ti,
                price=price, about=about, additional_info=None, host=host,
                recur_label=None, source_url=url, from_business=False,
                business_id=None, source="visitelpaso",
            )
            if not dry:
                if row is None:
                    db.add(Event(id=ev_id, **fields))
                else:
                    for k, v in fields.items():
                        setattr(row, k, v)
            kept += 1

        if not dry:
            # prune our own rows that are now past or no longer in the sitemap
            for row in db.query(Event).filter(Event.source == "visitelpaso").all():
                if row.id not in seen or (row.date_iso or "") < today:
                    db.delete(row)
                    pruned += 1
            db.commit()
            total = db.query(Event).filter(Event.source == "visitelpaso").count()
        else:
            total = db.query(Event).filter(Event.source == "visitelpaso").count()
    finally:
        db.close()

    tag = " (dry run — no writes)" if dry else ""
    print(f"visitelpaso sync{tag}: kept={kept} pruned={pruned} skipped={skip} "
          f"-> {total} visitelpaso rows in table")
    return kept


if __name__ == "__main__":
    run(dry="--dry" in sys.argv)
