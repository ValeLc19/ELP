"""Auth bridge: trust Supabase-issued access tokens.

The browser keeps using Supabase Auth (unchanged). On protected routes the
frontend sends the Supabase access token as `Authorization: Bearer <jwt>`.
Here we verify that JWT and return the user id (the token's `sub`). No user
table of our own — Supabase owns identity; this backend just owns each user's
data keyed by that id.

Supabase now signs access tokens with asymmetric keys (ES256/RS256), published
at the project's JWKS endpoint; older projects use a shared HS256 secret. We
support both: the token header's `alg` picks the path. Fails closed — a
missing/invalid token, or missing config for the token's algorithm, is a 401.
"""
from fastapi import Depends, Header, HTTPException, status
import jwt
from jwt import PyJWKClient

from .config import settings

# One PyJWKClient per JWKS URL (it caches fetched keys internally). Module-level
# so we don't refetch the key set on every request.
_jwk_clients: dict[str, PyJWKClient] = {}


def _jwk_client(url: str) -> PyJWKClient:
    client = _jwk_clients.get(url)
    if client is None:
        client = PyJWKClient(url)
        _jwk_clients[url] = client
    return client


def _unauthorized(detail: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )


def get_current_user_id(authorization: str = Header(default="")) -> str:
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise _unauthorized("Missing bearer token.")

    try:
        alg = jwt.get_unverified_header(token).get("alg", "")
    except jwt.PyJWTError as exc:
        raise _unauthorized(f"Malformed token: {exc}")

    decode_opts = dict(audience=settings.supabase_jwt_aud)
    try:
        if alg in ("ES256", "RS256", "EdDSA"):
            # Asymmetric: verify against the project's published public key.
            if not settings.supabase_url:
                raise _unauthorized("SUPABASE_URL is not configured on the server.")
            jwks_url = f"{settings.supabase_url.rstrip('/')}/auth/v1/.well-known/jwks.json"
            signing_key = _jwk_client(jwks_url).get_signing_key_from_jwt(token)
            payload = jwt.decode(token, signing_key.key, algorithms=[alg], **decode_opts)
        elif alg == "HS256":
            # Legacy shared secret.
            if not settings.supabase_jwt_secret:
                raise _unauthorized("SUPABASE_JWT_SECRET is not configured on the server.")
            payload = jwt.decode(
                token, settings.supabase_jwt_secret, algorithms=["HS256"], **decode_opts
            )
        else:
            raise _unauthorized(f"Unsupported token algorithm: {alg or 'none'}.")
    except HTTPException:
        raise
    except jwt.PyJWTError as exc:
        raise _unauthorized(f"Invalid token: {exc}")

    user_id = payload.get("sub")
    if not user_id:
        raise _unauthorized("Token has no subject.")
    return user_id


# Convenience alias for route signatures.
CurrentUser = Depends(get_current_user_id)
