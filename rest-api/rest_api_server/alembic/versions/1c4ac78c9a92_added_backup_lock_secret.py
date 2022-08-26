""""added_backup_lock_secret"

Revision ID: 1c4ac78c9a92
Revises: 0e9e37eef8d6
Create Date: 2019-12-16 06:29:10.548322

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = '1c4ac78c9a92'
down_revision = '0e9e37eef8d6'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('backup', sa.Column('lock_secret', sa.BIGINT, nullable=False))
    op.create_index(op.f('ix_backup_lock_secret'), 'backup', ['lock_secret'], unique=False)
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f('ix_backup_lock_secret'), table_name='backup')
    op.drop_column('backup', 'lock_secret')
    # ### end Alembic commands ###