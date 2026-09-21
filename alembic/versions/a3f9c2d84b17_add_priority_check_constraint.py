"""add priority check constraint

Revision ID: a3f9c2d84b17
Revises: 44840f774604
Create Date: 2026-09-21 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "a3f9c2d84b17"
down_revision: Union[str, Sequence[str], None] = "44840f774604"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add ck_tasks_priority_valid, normalizing pre-existing invalid values.

    Phase 5 policy (documented in README, Database Schema): a database
    created before this migration may contain rows whose priority was
    written directly, bypassing API validation. Such rows are normalized
    to 'medium' instead of dropping them or failing the migration. Valid
    values ('low', 'medium', 'high') are never modified.

    SQLite cannot ALTER TABLE ADD CONSTRAINT, so batch mode recreates the
    tasks table (preserving rows, indexes, defaults, and nullability).
    """
    op.execute(
        "UPDATE tasks SET priority = 'medium' "
        "WHERE priority NOT IN ('low', 'medium', 'high')"
    )
    with op.batch_alter_table("tasks") as batch_op:
        batch_op.create_check_constraint(
            "ck_tasks_priority_valid",
            "priority IN ('low', 'medium', 'high')",
        )


def downgrade() -> None:
    """Remove the CHECK constraint; existing rows are left untouched."""
    with op.batch_alter_table("tasks") as batch_op:
        batch_op.drop_constraint("ck_tasks_priority_valid")
