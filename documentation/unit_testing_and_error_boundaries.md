# Granular Technical Documentation: Unit Testing & Error Boundaries

## 1. Overview
This document specifies the unit testing architecture, test harness implementation, and error boundary mechanisms implemented across **NexusDB Guardian (SQL Query Regression Detector)**.

---

## 2. Test Harness & Test Suites

The automated verification suite (`/api/test-cases` and `frontend/src/pages/TestSuite.jsx`) systematically evaluates query regression detection across 6 specialized operational categories:

| Test ID | Test Scenario Name | Category | Input Condition / Workload | Expected & Verified Output | Coverage |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **`TC-01`** | Normal Query Execution | Normal Cases | `SELECT * FROM users WHERE id = 101` | 1 row returned, Plan: `Index Scan` using `users_pkey` (Duration: 12.4ms) | 100% |
| **`TC-02`** | Boundary Threshold Load | Boundary Cases | 1,000 concurrent simple index lookups | 0 failures, max latency 62ms, within p99 SLA limits | 98% |
| **`TC-03`** | Stale Statistics Handling | Failure Cases | Forced `stats_stale_flag = True` on `orders` table | Detector flags alert `ALT-106`, recommends `ANALYZE TABLE` | 100% |
| **`TC-04`** | 100k Scanned Rows Stress | Stress Cases | Unindexed table scan on 100,000 rows | Critical severity assigned, buffer read spike flagged (128 blocks) | 95% |
| **`TC-05`** | Zero Baseline Fallback | Edge Cases | Query with recorded `baseline_ms = 0.00ms` | Division-by-zero avoided; graceful fallback to default `1.0ms` baseline | 100% |
| **`TC-06`** | Severe Plan Drift Regression | Regression Cases | Plan hash shift: `Nested Loop / Index Scan` $\rightarrow$ `Hash Join / Seq Scan` | Both Random Forest & Isolation Forest flag anomaly with >99% confidence | 100% |

### Execution Procedures
- **Web UI Execution**: Navigate to **Test Suite** (`/tests`) and click **"Run All Test Cases"**.
- **Backend API Execution**:
  ```bash
  curl -X GET http://localhost:5000/api/test-cases -H "Authorization: Bearer <JWT_TOKEN>"
  ```

---

## 3. Error Boundaries & Fault Tolerance

### 3.1 Backend Resilience & Exception Handling
- **Missing Baseline Handling (`TC-05`)**: When a query has no prior execution history or a `0.00ms` baseline, the system clamps the denominator to `max(baseline_ms, 1.0)` to eliminate `ZeroDivisionError` in percentage regression calculations.
- **Missing or Corrupted Execution Plan JSON**: If an incoming PostgreSQL `EXPLAIN` plan lacks expected node attributes (e.g., missing `Shared Hit Blocks`), the parser falls back to default cost metrics without throwing unhandled exceptions.
- **JWT Authentication Guard**: The `@token_required` and `@role_required` decorators reject expired or invalid tokens with standardized `401 Unauthorized` or `403 Forbidden` JSON payloads and log access violations to the audit log (`AUD-XXXX`).

### 3.2 Frontend React Error Boundaries
- **Component Isolation**: Critical UI modules (Execution Plan Diffing, Chart.js Visualizations, and Schema Comparison) are isolated so that unparseable plan JSON or network timeouts render localized alert banners rather than crashing the entire SPA.
- **Graceful Fallbacks**: Top Slow Queries table and Evidence Dossiers provide fallback spinners, empty state illustrations, and retry buttons if the backend API is temporarily unreachable.
