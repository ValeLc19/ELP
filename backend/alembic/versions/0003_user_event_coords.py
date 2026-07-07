"""user_events: add lat/lng so added events show on the map

Revision ID: 0003_user_event_coords
Revises: 0002_user_events
Create Date: 2026-07-07
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0003_user_event_coords"
down_revision: Union[str, None] = "0002_user_events"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("user_events", sa.Column("lat", sa.Float(), nullable=True))
    op.add_column("user_events", sa.Column("lng", sa.Float(), nullable=True))


def downgrade() -> None:
    op.drop_column("user_events", "lng")
    op.drop_column("user_events", "lat")
