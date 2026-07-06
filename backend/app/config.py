"""Application settings, read from the environment.

Mirrors the Atlasly backend's config pattern: pydantic-settings BaseSettings
with sensible localhost defaults so the app runs out of the box in dev, while
secrets (DATABASE_URL, SUPABASE_JWT_SECRET, CORS_ORIGINS) are injected as
environment variables in prod (Render dashboard, sync:false).
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # A local SQLite file by default so `alembic upgrade` and the app boot with
    # zero setup. In prod this is the Supabase pooled Postgres URL
    # (postgresql+psycopg2://...), set as a Render secret.
    database_url: str = "sqlite:///./elp_dev.db"

    # Comma-separated list of allowed browser origins for CORS. In prod this is
    # the deployed frontend URL (e.g. https://elp-xxxx.vercel.app).
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    # Supabase project URL, e.g. https://<ref>.supabase.co. Used to build the
    # JWKS endpoint that verifies asymmetric (ES256/RS256) access tokens, which
    # is how current Supabase projects sign them. Required for those tokens.
    supabase_url: str = ""

    # Legacy shared JWT secret (Settings -> JWT Keys -> Legacy JWT Secret).
    # Only used for older projects that still sign tokens with HS256. Optional
    # when the project uses asymmetric keys. Fails closed when a token needs it
    # but it's unset.
    supabase_jwt_secret: str = ""

    # Supabase access tokens carry aud="authenticated". Kept configurable in
    # case a project customizes it.
    supabase_jwt_aud: str = "authenticated"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
