"""End-to-end smoke test against the live ASGI app via TestClient.

Sets a test JWT secret, mints a Supabase-style token, and exercises every
route: public /health + /events, auth rejection, and the /me/* CRUD flow.
Not shipped as a real test suite — a one-shot verification harness.
"""
import os

os.environ["SUPABASE_JWT_SECRET"] = "test-secret-for-smoke"
os.environ["DATABASE_URL"] = "sqlite:///./elp_dev.db"

import jwt
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def token(sub="11111111-1111-1111-1111-111111111111"):
    return jwt.encode(
        {"sub": sub, "aud": "authenticated"},
        "test-secret-for-smoke",
        algorithm="HS256",
    )


def check(label, cond):
    print(f"{'PASS' if cond else 'FAIL'}  {label}")
    assert cond, label


# --- public routes ----------------------------------------------------------
h = client.get("/health").json()
check("/health ok", h["status"] == "ok" and h["db"] is True)

ev = client.get("/events").json()
check("/events returns 152", len(ev) == 152)
check("/events derived fields present", {"date", "day", "dateISO"} <= ev[0].keys())

evf = client.get("/events", params={"category": "Music"}).json()
check("/events?category=Music filters", all(e["category"] == "Music" for e in evf) and len(evf) > 0)

# --- auth rejection ---------------------------------------------------------
check("/me/saved without token -> 401", client.get("/me/saved").status_code == 401)
bad = client.get("/me/saved", headers={"Authorization": "Bearer garbage"})
check("/me/saved with bad token -> 401", bad.status_code == 401)

auth = {"Authorization": f"Bearer {token()}"}

# --- saved flow -------------------------------------------------------------
check("saved starts empty", client.get("/me/saved", headers=auth).json() == [])
check("POST save -> 204", client.post("/me/saved", json={"seriesId": "cool-canyon-nights"}, headers=auth).status_code == 204)
client.post("/me/saved", json={"seriesId": "cool-canyon-nights"}, headers=auth)  # idempotent
check("save is idempotent (1 entry)", client.get("/me/saved", headers=auth).json() == ["cool-canyon-nights"])
check("DELETE save -> 204", client.delete("/me/saved/cool-canyon-nights", headers=auth).status_code == 204)
check("saved empty after delete", client.get("/me/saved", headers=auth).json() == [])

# --- per-user isolation -----------------------------------------------------
other = {"Authorization": f"Bearer {token(sub='22222222-2222-2222-2222-222222222222')}"}
client.post("/me/saved", json={"seriesId": "x"}, headers=auth)
check("other user does not see first user's save", client.get("/me/saved", headers=other).json() == [])
client.delete("/me/saved/x", headers=auth)

# --- businesses flow --------------------------------------------------------
created = client.post("/me/businesses", json={"handle": "@cafemayapan", "name": "Cafe Mayapan", "url": "https://instagram.com/cafemayapan"}, headers=auth)
check("POST business -> 201", created.status_code == 201)
bid = created.json()["id"]
check("business listed", any(b["name"] == "Cafe Mayapan" for b in client.get("/me/businesses", headers=auth).json()))
check("duplicate business -> 409", client.post("/me/businesses", json={"handle": "x", "name": "cafe mayapan"}, headers=auth).status_code == 409)
check("DELETE business -> 204", client.delete(f"/me/businesses/{bid}", headers=auth).status_code == 204)
check("businesses empty after delete", client.get("/me/businesses", headers=auth).json() == [])

# --- pipeline stub ----------------------------------------------------------
check("/pipeline/refresh -> 501", client.post("/pipeline/refresh").status_code == 501)

print("\nALL CHECKS PASSED")
