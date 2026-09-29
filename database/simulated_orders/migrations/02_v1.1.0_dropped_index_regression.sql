-- Migration: 02_v1.1.0_dropped_index_regression.sql
-- Target Engine: PostgreSQL 14+
-- Release Tag: v1.1.0
-- Description: Unintended regression introduced by dropping user_id index on orders

DROP INDEX IF EXISTS idx_orders_user_id;

INSERT INTO schema_versions (release_tag, migration_script, description)
VALUES ('v1.1.0', '02_v1.1.0_dropped_index_regression.sql', 'Dropped idx_orders_user_id causing query scan regression');
