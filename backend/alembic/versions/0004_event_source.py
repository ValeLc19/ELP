"""events: add source column ('seed' | 'visitelpaso')

Lets scripts.sync_visitelpaso own/prune only its own rows without touching the
curated seed. Existing rows default to 'seed'.

Revision ID: 0004_event_source
Revises: 0003_user_event_coords
Create Date: 2026-07-07
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0004_event_source"
down_revision: Union[str, None] = "0003_user_event_coords"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "events",
        sa.Column("source", sa.String(), nullable=False, server_default="seed"),
    )
    op.create_index("ix_events_source", "events", ["source"])


def downgrade() -> None:
    op.drop_index("ix_events_source", table_name="events")
    op.drop_column("events", "source")
