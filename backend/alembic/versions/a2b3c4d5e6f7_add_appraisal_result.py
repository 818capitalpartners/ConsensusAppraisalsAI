"""add ai_appraisal_result column to deals

Revision ID: a2b3c4d5e6f7
Revises: c11f0ad4c81e
Create Date: 2026-03-18 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB


# revision identifiers, used by Alembic.
revision: str = 'a2b3c4d5e6f7'
down_revision: Union[str, None] = 'c11f0ad4c81e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('deals', sa.Column('ai_appraisal_result', JSONB, nullable=True))


def downgrade() -> None:
    op.drop_column('deals', 'ai_appraisal_result')
