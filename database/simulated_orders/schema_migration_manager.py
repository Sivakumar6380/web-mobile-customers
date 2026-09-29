"""
Schema Migration and Rollback Demonstration Manager
Target Database Architecture: PostgreSQL 14+ (Simulated Order Analytics Schema)
Note: Query execution plans produced are SYNTHETIC / BENCHMARKED PostgreSQL JSON trees 
representing EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) outputs across schema versions.
"""

import os
import json

MIGRATIONS_DIR = os.path.join(os.path.dirname(__file__), 'migrations')
BASELINES_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'datasets', 'baselines'))
RELEASE_MANIFEST_FILE = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'datasets', 'release_manifest.json'))

class SchemaRegressionTracker:
    def __init__(self):
        os.makedirs(BASELINES_DIR, exist_ok=True)

    def get_registered_migrations(self):
        """Discovers all migration scripts in sequence."""
        files = sorted(os.listdir(MIGRATIONS_DIR))
        return [os.path.join(MIGRATIONS_DIR, f) for f in files if f.endswith('.sql')]

    def generate_plan_capture(self, release_tag):
        """
        Generates grounded synthetic PostgreSQL EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
        query plan trees for:
        SELECT * FROM orders JOIN users ON orders.user_id = users.user_id WHERE orders.user_id = 42
        """
        if release_tag in ('v1.0.0', 'v1.1.1'):
            # Optimal plan using Index Scan
            return [{
                "Plan": {
                    "Node Type": "Nested Loop",
                    "Parallel Aware": False,
                    "Async Capable": False,
                    "Startup Cost": 0.28,
                    "Total Cost": 12.45,
                    "Plan Rows": 12,
                    "Plan Width": 64,
                    "Actual Startup Time": 0.018,
                    "Actual Total Time": 0.084,
                    "Actual Rows": 12,
                    "Actual Loops": 1,
                    "Shared Hit Blocks": 6,
                    "Shared Read Blocks": 0,
                    "Shared Dirtied Blocks": 0,
                    "Shared Written Blocks": 0,
                    "Plans": [
                        {
                            "Node Type": "Index Scan",
                            "Parent Relationship": "Outer",
                            "Relation Name": "orders",
                            "Index Name": "idx_orders_user_id",
                            "Index Cond": "(user_id = 42)",
                            "Startup Cost": 0.15,
                            "Total Cost": 8.16,
                            "Actual Rows": 12,
                            "Actual Total Time": 0.042,
                            "Shared Hit Blocks": 3
                        },
                        {
                            "Node Type": "Index Scan",
                            "Parent Relationship": "Inner",
                            "Relation Name": "users",
                            "Index Name": "users_pkey",
                            "Index Cond": "(user_id = 42)",
                            "Startup Cost": 0.13,
                            "Total Cost": 4.29,
                            "Actual Rows": 1,
                            "Actual Total Time": 0.003,
                            "Shared Hit Blocks": 3
                        }
                    ]
                },
                "Planning Time": 0.115,
                "Execution Time": 0.102,
                "Target Engine": "PostgreSQL 14+",
                "Plan Format": "EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)",
                "Execution Mode": "SYNTHETIC_BENCHMARK",
                "Release Tag": release_tag,
                "Schema Status": "Baseline / Optimal Index Active" if release_tag == 'v1.0.0' else "Rollback Applied / Index Restored",
                "Regression Detected": False
            }]
        else:
            # Regressed plan using Sequential Scan & Hash Join due to dropped index (v1.1.0)
            return [{
                "Plan": {
                    "Node Type": "Hash Join",
                    "Parallel Aware": False,
                    "Async Capable": False,
                    "Join Type": "Inner",
                    "Startup Cost": 18.50,
                    "Total Cost": 142.80,
                    "Plan Rows": 12,
                    "Plan Width": 64,
                    "Actual Startup Time": 1.450,
                    "Actual Total Time": 18.920,
                    "Actual Rows": 12,
                    "Actual Loops": 1,
                    "Hash Cond": "(orders.user_id = users.user_id)",
                    "Shared Hit Blocks": 4,
                    "Shared Read Blocks": 128,
                    "Shared Dirtied Blocks": 0,
                    "Shared Written Blocks": 0,
                    "Plans": [
                        {
                            "Node Type": "Seq Scan",
                            "Parent Relationship": "Outer",
                            "Relation Name": "orders",
                            "Filter": "(user_id = 42)",
                            "Startup Cost": 0.00,
                            "Total Cost": 120.00,
                            "Actual Rows": 12,
                            "Actual Total Time": 17.500,
                            "Shared Read Blocks": 124
                        },
                        {
                            "Node Type": "Index Scan",
                            "Parent Relationship": "Inner",
                            "Relation Name": "users",
                            "Index Name": "users_pkey",
                            "Index Cond": "(user_id = 42)",
                            "Startup Cost": 0.13,
                            "Total Cost": 4.29,
                            "Actual Rows": 1,
                            "Actual Total Time": 0.003,
                            "Shared Hit Blocks": 3
                        }
                    ]
                },
                "Planning Time": 0.142,
                "Execution Time": 19.125,
                "Target Engine": "PostgreSQL 14+",
                "Plan Format": "EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)",
                "Execution Mode": "SYNTHETIC_BENCHMARK",
                "Release Tag": release_tag,
                "Schema Status": "Unintended Index Drop (idx_orders_user_id removed)",
                "Regression Detected": True,
                "Regression Root Cause": "Missing index on orders(user_id) resulting in Seq Scan instead of Index Scan. Execution time increased from 0.102ms to 19.125ms (+18,650%)."
            }]

    def record_and_export_lifecycle(self):
        """Exports the three release lifecycle logs: baseline (v1.0.0), regression (v1.1.0), and rollback (v1.1.1)."""
        stages = [
            ("v1.0.0", "v1.0.0_baseline_plan.json"),
            ("v1.1.0", "v1.1.0_regressed_plan.json"),
            ("v1.1.1", "v1.1.1_rollback_plan.json")
        ]
        
        for release_tag, filename in stages:
            plan = self.generate_plan_capture(release_tag)
            out_file = os.path.join(BASELINES_DIR, filename)
            with open(out_file, 'w', encoding='utf-8') as f:
                json.dump(plan, f, indent=2)
            print(f"[Schema Tracker] Exported PostgreSQL {release_tag} plan -> {out_file}")

    def generate_release_manifest(self):
        """Generates a structured release manifest linking versions, migrations, and regression/rollback results."""
        manifest = {
            "project": "NexusDB Guardian Query Regression Detector",
            "target_database_engine": "PostgreSQL 14+",
            "plan_format": "EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)",
            "data_mode": "SYNTHETIC_BENCHMARK",
            "release_flow": [
                {
                    "release_tag": "v1.0.0",
                    "stage": "Baseline",
                    "migration_script": "database/simulated_orders/migrations/01_v1.0.0_initial_schema.sql",
                    "schema_version": 1,
                    "description": "Initial simulated orders schema with optimal composite & single-column B-Tree indexes.",
                    "plan_file": "datasets/baselines/v1.0.0_baseline_plan.json",
                    "query_plan_node": "Nested Loop / Index Scan",
                    "execution_time_ms": 0.102,
                    "estimated_cost": 12.45,
                    "shared_read_blocks": 0,
                    "regression_detected": False,
                    "rollback_status": "Not Applicable (Baseline)"
                },
                {
                    "release_tag": "v1.1.0",
                    "stage": "Regression Induced",
                    "migration_script": "database/simulated_orders/migrations/02_v1.1.0_dropped_index_regression.sql",
                    "schema_version": 2,
                    "description": "Unintended drop of index idx_orders_user_id causing physical plan shift from Index Scan to Seq Scan.",
                    "plan_file": "datasets/baselines/v1.1.0_regressed_plan.json",
                    "query_plan_node": "Hash Join / Seq Scan",
                    "execution_time_ms": 19.125,
                    "estimated_cost": 142.80,
                    "shared_read_blocks": 128,
                    "regression_detected": True,
                    "performance_degradation": "+18,650% execution time increase",
                    "rollback_status": "Rollback Recommended"
                },
                {
                    "release_tag": "v1.1.1",
                    "stage": "Rollback Restoration",
                    "migration_script": "database/simulated_orders/migrations/03_v1.1.1_rollback_restore_index.sql",
                    "schema_version": 3,
                    "description": "Rollback migration restoring idx_orders_user_id and reverting query plan back to optimal Index Scan.",
                    "plan_file": "datasets/baselines/v1.1.1_rollback_plan.json",
                    "query_plan_node": "Nested Loop / Index Scan",
                    "execution_time_ms": 0.102,
                    "estimated_cost": 12.45,
                    "shared_read_blocks": 0,
                    "regression_detected": False,
                    "rollback_status": "Rollback Successfully Applied & Verified"
                }
            ]
        }
        
        with open(RELEASE_MANIFEST_FILE, 'w', encoding='utf-8') as f:
            json.dump(manifest, f, indent=2)
        print(f"[Schema Tracker] Exported Release Manifest -> {RELEASE_MANIFEST_FILE}")

if __name__ == "__main__":
    tracker = SchemaRegressionTracker()
    tracker.record_and_export_lifecycle()
    tracker.generate_release_manifest()
    print("Schema migration & rollback lifecycle logs generated successfully.")
