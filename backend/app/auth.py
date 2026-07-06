"""Auth bridge: trust Supabase-issued access tokens.

The browser keeps using Supabase Auth (unchanged). On protected routes the
frontend sends the Supabase access token as `Authorization: Bearer <jwt>`.
Here we verify that JWT with the project's JWT secret (HS256) and return the
user id (the token's `sub`). No user table of our own — Supabase owns identity;
this backend just owns each user's data keyed by that id.

Fails closed: if no secret is configured, or the token is missing/invalid,
every protected request is rejected with 401.
"""
from fastapi import Depends, Header, HTTPException, status
import jwt

from .config import settings


def get_current_user_id(authorization: str = Header(default="")) -> str:
    if not settings.supabase_jwt_secret:
        # Misconfiguration — better to reject than to silently trust anyone.
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Auth is not configured on the server.",
        )

    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing bearer token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        payload = jwt.decode(
            token,
            settings.supabase_jwt_secret,
            algorithms=["HS256"],
            audience=settings.supabase_jwt_aud,
        )
    except jwt.PyJWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {exc}",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has no subject.",
        )
    return user_id


# Convenience alias for route signatures.
CurrentUser = Depends(get_current_user_id)
