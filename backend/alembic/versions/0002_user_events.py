"""user_events: per-user events added from a pasted link

Revision ID: 0002_user_events
Revises: 0001_initial
Create Date: 2026-07-06
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0002_user_events"
down_revision: Union[str, None] = "0001_initial"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "user_events",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("business_id", sa.String(), nullable=True),
        sa.Column("business_name", sa.String(), nullable=True),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("category", sa.String(), nullable=False, server_default="Markets"),
        sa.Column("image", sa.String(), nullable=True),
        sa.Column("address", sa.String(), nullable=True),
        sa.Column("date_iso", sa.String(), nullable=False),
        sa.Column("time", sa.String(), nullable=True),
        sa.Column("price", sa.String(), nullable=True),
        sa.Column("about", sa.Text(), nullable=True),
        sa.Column("source_url", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
    )
    op.create_index("ix_user_events_user_id", "user_events", ["user_id"])
    op.create_index("ix_user_events_date_iso", "user_events", ["date_iso"])


def downgrade() -> None:
    op.drop_index("ix_user_events_date_iso", table_name="user_events")
    op.drop_index("ix_user_events_user_id", table_name="user_events")
    op.drop_table("user_events")
