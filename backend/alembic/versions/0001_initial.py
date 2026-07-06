"""initial schema: events, saved_events, businesses

Revision ID: 0001_initial
Revises:
Create Date: 2026-07-06
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "events",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("series_id", sa.String(), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("short", sa.String(), nullable=True),
        sa.Column("category", sa.String(), nullable=False),
        sa.Column("theme", sa.String(), nullable=True),
        sa.Column("image", sa.String(), nullable=True),
        sa.Column("family", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("address", sa.String(), nullable=True),
        sa.Column("lat", sa.Float(), nullable=True),
        sa.Column("lng", sa.Float(), nullable=True),
        sa.Column("date_iso", sa.String(), nullable=False),
        sa.Column("time", sa.String(), nullable=True),
        sa.Column("price", sa.String(), nullable=True),
        sa.Column("about", sa.Text(), nullable=True),
        sa.Column("additional_info", sa.Text(), nullable=True),
        sa.Column("host", sa.String(), nullable=True),
        sa.Column("recur_label", sa.String(), nullable=True),
        sa.Column("source_url", sa.String(), nullable=True),
        sa.Column("from_business", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("business_id", sa.String(), nullable=True),
    )
    op.create_index("ix_events_series_id", "events", ["series_id"])
    op.create_index("ix_events_category", "events", ["category"])
    op.create_index("ix_events_date_iso", "events", ["date_iso"])

    op.create_table(
        "saved_events",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("series_id", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.UniqueConstraint("user_id", "series_id", name="uq_user_series"),
    )
    op.create_index("ix_saved_events_user_id", "saved_events", ["user_id"])

    op.create_table(
        "businesses",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("handle", sa.String(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("avatar", sa.String(), nullable=True),
        sa.Column("url", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.UniqueConstraint("user_id", "name", name="uq_user_business"),
    )
    op.create_index("ix_businesses_user_id", "businesses", ["user_id"])


def downgrade() -> None:
    op.drop_table("businesses")
    op.drop_table("saved_events")
    op.drop_table("events")
