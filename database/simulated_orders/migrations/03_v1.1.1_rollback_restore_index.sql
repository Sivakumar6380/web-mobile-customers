-- Migration: 03_v1.1.1_rollback_restore_index.sql
-- Target Engine: PostgreSQL 14+ (Simulated Order Schema)
-- Release Tag: v1.1.1
-- Description: Rollback script restoring the user_id index to resolve performance degradation

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

INSERT INTO schema_versions (release_tag, migration_script, description)
VALUES ('v1.1.1', '03_v1.1.1_rollback_restore_index.sql', 'Restored idx_orders_user_id via rollback migration (Release v1.1.1)');
