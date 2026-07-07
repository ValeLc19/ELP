"""Paste-a-link event extraction.

Given a URL, fetch it server-side (with SSRF guards) and read event fields
from its structured metadata (schema.org JSON-LD `Event`, then OpenGraph as a
fallback). Returns best-effort fields; the frontend shows them in an editable
review form so the user confirms/fills the rest before saving.

This is the realistic stand-in for the full social-scrape pipeline: it works
well on event web pages; social-post links (IG/FB/TikTok) serve a login wall,
so those come back mostly empty and the user fills the form manually.
"""
import html as _html
import ipaddress
import json
import re
import socket
import urllib.error
import urllib.request
from typing import Optional
from urllib.parse import urljoin, urlparse

from fastapi import APIRouter, HTTPException, status

from ..schemas import ExtractIn, ExtractOut

router = APIRouter(prefix="/pipeline", tags=["pipeline"])

_UA = "Mozilla/5.0 (compatible; ELP-event-importer/1.0)"
_MAX_BYTES = 2_000_000
_TIMEOUT = 8


def _is_public_host(host: str) -> bool:
    """Reject hosts that resolve to private/loopback/link-local ranges (SSRF)."""
    try:
        infos = socket.getaddrinfo(host, None)
    except socket.gaierror:
        return False
    for info in infos:
        ip = ipaddress.ip_address(info[4][0])
        if (
            ip.is_private
            or ip.is_loopback
            or ip.is_link_local
            or ip.is_reserved
            or ip.is_multicast
            or ip.is_unspecified
        ):
            return False
    return True


class _NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *a, **k):  # suppress auto-redirect; we re-check hosts
        return None


def _fetch(url: str, max_redirects: int = 3) -> str:
    """Fetch HTML, validating the host at each hop and capping size/time."""
    opener = urllib.request.build_opener(_NoRedirect)
    for _ in range(max_redirects + 1):
        p = urlparse(url)
        if p.scheme not in ("http", "https") or not p.hostname:
            raise ValueError("Only http(s) links are supported.")
        if not _is_public_host(p.hostname):
            raise ValueError("That link's host is not reachable.")
        req = urllib.request.Request(url, headers={"User-Agent": _UA})
        try:
            resp = opener.open(req, timeout=_TIMEOUT)
        except urllib.error.HTTPError as e:
            if e.code in (301, 302, 303, 307, 308) and e.headers.get("Location"):
                url = urljoin(url, e.headers["Location"])
                continue
            raise ValueError(f"The link returned an error ({e.code}).")
        except (urllib.error.URLError, socket.timeout, TimeoutError):
            raise ValueError("Could not reach that link.")
        code = resp.getcode()
        if code in (301, 302, 303, 307, 308):
            loc = resp.headers.get("Location")
            if not loc:
                raise ValueError("Broken redirect on that link.")
            url = urljoin(url, loc)
            continue
        raw = resp.read(_MAX_BYTES)
        charset = "utf-8"
        m = re.search(r"charset=([\w-]+)", resp.headers.get("Content-Type", ""))
        if m:
            charset = m.group(1)
        return raw.decode(charset, errors="replace")
    raise ValueError("Too many redirects on that link.")


# ---- parsing helpers -------------------------------------------------------

def _first(x):
    return x[0] if isinstance(x, list) and x else x


def _text(x) -> Optional[str]:
    x = _first(x)
    if isinstance(x, dict):
        x = x.get("name") or x.get("url") or x.get("@value")
    if x is None:
        return None
    s = str(x).strip()
    return s or None


def _split_dt(s):
    """'2026-07-20T18:30:00-06:00' -> ('2026-07-20', '6:30 pm')."""
    if not s:
        return None, None
    s = str(s)
    dm = re.search(r"(\d{4}-\d{2}-\d{2})", s)
    date_iso = dm.group(1) if dm else None
    tm = re.search(r"[T ](\d{2}):(\d{2})", s)
    time_str = None
    if tm:
        h, mnt = int(tm.group(1)), tm.group(2)
        ampm = "am" if h < 12 else "pm"
        h12 = h % 12 or 12
        time_str = f"{h12}:{mnt} {ampm}"
    return date_iso, time_str


def _address(loc) -> Optional[str]:
    loc = _first(loc)
    if not loc:
        return None
    if isinstance(loc, str):
        return loc.strip() or None
    if isinstance(loc, dict):
        name = loc.get("name")
        addr = loc.get("address")
        if isinstance(addr, dict):
            parts = [
                addr.get("streetAddress"),
                addr.get("addressLocality"),
                addr.get("addressRegion"),
            ]
            addr = ", ".join(p for p in parts if p)
        pieces = [p for p in (name, addr) if p]
        return ", ".join(dict.fromkeys(pieces)) or None
    return None


def _price(offers) -> Optional[str]:
    offers = _first(offers)
    if not offers:
        return None
    price = offers.get("price") if isinstance(offers, dict) else offers
    if price in (None, ""):
        return None
    try:
        val = float(str(price).replace("$", "").replace(",", ""))
        return "Free" if val == 0 else f"${val:g}"
    except ValueError:
        return str(price)


def _iter_events(data):
    """Yield event-like dicts from any JSON-LD shape (@graph, list, single)."""
    stack = [data]
    while stack:
        node = stack.pop()
        if isinstance(node, list):
            stack.extend(node)
        elif isinstance(node, dict):
            if "@graph" in node:
                stack.append(node["@graph"])
            t = node.get("@type", "")
            types = t if isinstance(t, list) else [t]
            if any("Event" in str(x) for x in types):
                yield node


def _meta(html_str: str, prop: str) -> Optional[str]:
    m = re.search(
        r'<meta[^>]+(?:property|name)=["\']' + re.escape(prop) + r'["\'][^>]+content=["\'](.*?)["\']',
        html_str,
        re.I | re.S,
    )
    if not m:
        m = re.search(
            r'<meta[^>]+content=["\'](.*?)["\'][^>]+(?:property|name)=["\']' + re.escape(prop) + r'["\']',
            html_str,
            re.I | re.S,
        )
    return _html.unescape(m.group(1)).strip() if m else None


def _parse(html_str: str, source_url: str) -> dict:
    out: dict = {"sourceUrl": source_url}
    for block in re.findall(
        r'<script[^>]+type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',
        html_str,
        re.I | re.S,
    ):
        try:
            data = json.loads(block.strip())
        except Exception:
            continue
        for ev in _iter_events(data):
            di, ti = _split_dt(ev.get("startDate"))
            cand = {
                "title": _text(ev.get("name")),
                "dateISO": di,
                "time": ti,
                "image": _text(ev.get("image")),
                "address": _address(ev.get("location")),
                "price": _price(ev.get("offers")),
                "about": _text(ev.get("description")),
            }
            for k, v in cand.items():
                if v and not out.get(k):
                    out[k] = v
    if not out.get("title"):
        out["title"] = _meta(html_str, "og:title")
        if not out["title"]:
            tm = re.search(r"<title[^>]*>(.*?)</title>", html_str, re.I | re.S)
            out["title"] = _html.unescape(tm.group(1)).strip() if tm else None
    if not out.get("image"):
        out["image"] = _meta(html_str, "og:image")
    if not out.get("about"):
        out["about"] = _meta(html_str, "og:description") or _meta(html_str, "description")
    if not out.get("dateISO"):
        di, ti = _split_dt(_meta(html_str, "event:start_time"))
        if di:
            out["dateISO"] = di
            out.setdefault("time", ti)
    return {k: v for k, v in out.items() if v}


@router.post("/extract")
def extract_event(body: ExtractIn) -> ExtractOut:
    url = (body.url or "").strip()
    if not url:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Please provide a link.")
    if not re.match(r"^https?://", url, re.I):
        url = "https://" + url
    try:
        html_str = _fetch(url)
    except ValueError:
        # Not fatal — the frontend still opens a blank form to fill by hand.
        return ExtractOut(sourceUrl=url)
    return ExtractOut(**_parse(html_str, url))
