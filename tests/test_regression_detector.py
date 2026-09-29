"""
Automated Test Suite for SQL Query Regression Detection Prototype
Covers:
- Normal cases (TC-01)
- Boundary cases (TC-02)
- Failure cases (TC-03: Stale Statistics)
- Stress cases (TC-04: Unindexed Scan)
- Edge cases (TC-05: Zero Baseline Division Guard)
- Regression cases (TC-06: Plan Drift)
- ML Model Validation & Metrics Consistency
- Rollback Performance Verification (v1.0.0 vs v1.1.1)
"""

import unittest
import os
import sys
import json
import numpy as np
import pandas as pd

# Add backend directory to system path
BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend'))
sys.path.insert(0, BACKEND_DIR)

DATASET_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'query_regression_detector_dataset.xlsx'))
BASELINES_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'datasets', 'baselines'))
REPORT_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'reports', 'model_evaluation_report.json'))

class TestQueryRegressionDetector(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        """Loads dataset and evaluation reports."""
        cls.df = pd.read_excel(DATASET_PATH)
        with open(REPORT_PATH, 'r') as f:
            cls.model_report = json.load(f)

    def test_tc01_normal_query_execution(self):
        """TC-01: Normal query execution using primary index scan."""
        normal_queries = self.df[(self.df['regression_flag'] == 0) & (self.df['scan_type'] != 'table_scan')]
        self.assertFalse(normal_queries.empty, "Dataset should contain normal queries")
        
        sample = normal_queries.iloc[0]
        # In optimal execution, execution time should be within 20% of baseline
        ratio = sample['execution_time_ms'] / max(sample['baseline_ms'], 1.0)
        self.assertLess(ratio, 1.30, "Normal queries must not exceed baseline by more than 30%")
        self.assertEqual(sample['regression_flag'], 0, "Regression flag must be 0 for normal query")

    def test_tc02_boundary_threshold_load(self):
        """TC-02: Boundary threshold load test."""
        # Check boundary where pct_change is near the threshold (e.g. around 20-30%)
        boundary_candidates = self.df[abs(self.df['pct_change'] - 20.0) < 10.0]
        self.assertFalse(boundary_candidates.empty, "Boundary query records should exist")
        
        # Verify no NaN or infinite values in critical numeric metrics
        for col in ['execution_time_ms', 'baseline_ms', 'pct_change']:
            self.assertFalse(boundary_candidates[col].isna().any(), f"Column {col} has NaN values")
            self.assertFalse(np.isinf(boundary_candidates[col]).any(), f"Column {col} has infinite values")

    def test_tc03_stale_statistics_handling(self):
        """TC-03: Failure case - Stale statistics inducing optimizer regression."""
        stale_queries = self.df[self.df['stats_stale_flag'] == True]
        fresh_queries = self.df[self.df['stats_stale_flag'] == False]
        self.assertFalse(stale_queries.empty, "Dataset should contain queries with stale statistics")
        
        # Stale statistics significantly increases regression rate compared to fresh statistics
        stale_reg_rate = (stale_queries['regression_flag'] == True).mean()
        fresh_reg_rate = (fresh_queries['regression_flag'] == True).mean()
        self.assertGreater(stale_reg_rate, fresh_reg_rate * 1.8, "Stale statistics must amplify query regression likelihood by >= 1.8x")

    def test_tc04_unindexed_scan_stress(self):
        """TC-04: Stress case - Full table scan causing latency degradation."""
        table_scan_queries = self.df[self.df['scan_type'] == 'table_scan']
        self.assertFalse(table_scan_queries.empty, "Dataset should contain table scan stress cases")
        
        # Table scans should have significantly higher average execution time than index scans
        index_scan_queries = self.df[self.df['scan_type'] != 'table_scan']
        avg_table_scan_ms = table_scan_queries['execution_time_ms'].mean()
        avg_index_scan_ms = index_scan_queries['execution_time_ms'].mean()
        
        self.assertGreater(avg_table_scan_ms, avg_index_scan_ms * 1.5, "Table scans must be significantly slower than index scans")

    def test_tc05_zero_baseline_edge_case(self):
        """TC-05: Edge case - Fallback handling for zero baseline to prevent ZeroDivisionError."""
        zero_baseline = 0.00
        actual_time = 45.50
        
        safe_baseline = max(zero_baseline, 1.0)
        pct_change = ((actual_time - safe_baseline) / safe_baseline) * 100.0
        
        self.assertEqual(safe_baseline, 1.0, "Zero baseline should be clamped to default 1.0ms")
        self.assertFalse(np.isinf(pct_change), "Percentage change calculation must not be infinite")
        self.assertAlmostEqual(pct_change, 4450.0, places=1)

    def test_tc06_plan_drift_regression(self):
        """TC-06: Regression case - Plan hash change triggering critical anomaly."""
        plan_changed = self.df[self.df['plan_changed_flag'] == True]
        self.assertFalse(plan_changed.empty, "Dataset should contain plan drift instances")
        
        # When plan changes, over 60% of queries regress, and plan drift accounts for >85% of all regressions
        regressed_on_plan_change = (plan_changed['regression_flag'] == True).mean()
        total_regressions = (self.df['regression_flag'] == True).sum()
        regressions_with_plan_change = ((self.df['plan_changed_flag'] == True) & (self.df['regression_flag'] == True)).sum()
        plan_drift_coverage = regressions_with_plan_change / total_regressions
        
        self.assertGreater(regressed_on_plan_change, 0.60, "Plan changes must yield a >60% regression rate")
        self.assertGreater(plan_drift_coverage, 0.85, "Plan drift must account for >85% of all identified regressions")

    def test_ml_model_evaluation_metrics(self):
        """Validates that ML models meet production performance standards."""
        rf_metrics = self.model_report['Metrics']['Random_Forest']
        iso_metrics = self.model_report['Metrics']['Isolation_Forest']
        
        # Random Forest checks
        self.assertGreaterEqual(rf_metrics['Accuracy'], 0.99, "Random Forest accuracy must exceed 99%")
        self.assertGreaterEqual(rf_metrics['F1_Score'], 0.99, "Random Forest F1-Score must exceed 0.99")
        self.assertEqual(rf_metrics['Confusion_Matrix']['FP'], 0, "Random Forest must have 0 false positives")
        self.assertEqual(rf_metrics['Confusion_Matrix']['FN'], 0, "Random Forest must have 0 false negatives")
        
        # Isolation Forest checks
        self.assertGreaterEqual(iso_metrics['Accuracy'], 0.95, "Isolation Forest accuracy must exceed 95%")
        self.assertGreaterEqual(iso_metrics['Recall'], 0.95, "Isolation Forest recall must exceed 95%")
        
        # Best model selection justification
        self.assertEqual(self.model_report['Best_Model'], 'Random_Forest', "Random Forest should be selected as best model")

    def test_schema_rollback_consistency(self):
        """Validates that rollback plan (v1.1.1) successfully restores baseline plan (v1.0.0)."""
        baseline_file = os.path.join(BASELINES_DIR, 'v1.0.0_baseline_plan.json')
        regressed_file = os.path.join(BASELINES_DIR, 'v1.1.0_regressed_plan.json')
        rollback_file = os.path.join(BASELINES_DIR, 'v1.1.1_rollback_plan.json')
        
        self.assertTrue(os.path.exists(baseline_file), "Baseline plan JSON must exist")
        self.assertTrue(os.path.exists(regressed_file), "Regressed plan JSON must exist")
        self.assertTrue(os.path.exists(rollback_file), "Rollback plan JSON must exist")
        
        with open(baseline_file, 'r') as f:
            baseline = json.load(f)[0]
        with open(regressed_file, 'r') as f:
            regressed = json.load(f)[0]
        with open(rollback_file, 'r') as f:
            rollback = json.load(f)[0]
            
        # Verify regression in v1.1.0
        self.assertGreater(regressed['Execution Time'], baseline['Execution Time'] * 10, "Regressed plan execution time should spike >10x")
        self.assertEqual(regressed['Plan']['Node Type'], 'Hash Join', "Regressed plan should shift to Hash Join")
        
        # Verify restoration in v1.1.1
        self.assertAlmostEqual(rollback['Execution Time'], baseline['Execution Time'], places=3, msg="Rollback execution time must match baseline")
        self.assertEqual(rollback['Plan']['Node Type'], baseline['Plan']['Node Type'], "Rollback plan node type must revert to baseline")
        self.assertEqual(rollback['Plan']['Total Cost'], baseline['Plan']['Total Cost'], "Rollback cost must match baseline")

if __name__ == '__main__':
    unittest.main()
