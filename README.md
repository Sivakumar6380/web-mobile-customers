# SQL Query Regression Detection Prototype

## Project Overview
This project is a field-ready software prototype designed to detect SQL query performance regressions before they affect production users. It accomplishes this by capturing query execution logs, analyzing execution plans, and employing Machine Learning models to identify anomalies.

## Architecture
The system consists of three main components:
1. **Frontend**: React SPA using TailwindCSS for styling and Chart.js for data visualization.
2. **Backend**: Python Flask REST API integrating `scikit-learn` for ML inference and `pandas` for data manipulation.
3. **Database**: PostgreSQL storing historical query logs, execution plans, and schema changes.

## Database Engine, Schema Versioning & Rollback

- **Target Database Engine**: **PostgreSQL (Version 14+)** is the designated production engine for query-regression performance analysis.
- **Query Plan Protocol & Format**: All execution plans are structured around PostgreSQL's native `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)` command, extracting node types, costs, buffer cache hit/read ratios, and millisecond execution timings.
- **Purpose of SQLite**: SQLite is retained **strictly as an auxiliary local application store** (`database/users.db`) for user authentication, password hashing (bcrypt), and demo role-based access control. SQLite execution plans are **never** substituted for PostgreSQL analysis.
- **Query Plan Source**: Query regression evaluations utilize **synthetic/benchmarked PostgreSQL execution plan trees** modeled accurately after PostgreSQL optimizer behaviors.
- **Schema Migration & Versioning Mechanism**: Tracked using sequential SQL migrations and an in-database `schema_versions` catalog table:
  - `database/simulated_orders/migrations/`
  - Catalog table: `CREATE TABLE schema_versions (version_id, release_tag, migration_script, applied_at, description)`
- **Release Mapping Flow**:
  - `v1.0.0` $\rightarrow$ Initial baseline schema with performance indexes (`01_v1.0.0_initial_schema.sql` $\rightarrow$ `v1.0.0_baseline_plan.json`)
  - `v1.1.0` $\rightarrow$ Schema change dropping `idx_orders_user_id` (`02_v1.1.0_dropped_index_regression.sql` $\rightarrow$ `v1.1.0_regressed_plan.json`)
  - `v1.1.1` $\rightarrow$ Rollback restoration of index (`03_v1.1.1_rollback_restore_index.sql` $\rightarrow$ `v1.1.1_rollback_plan.json`)
  - Release Manifest: [datasets/release_manifest.json](file:///c:/projects/Web%20mobile%20customer/datasets/release_manifest.json)
- **Baseline Capture Mechanism**: Plan captures saved in [datasets/baselines/](file:///c:/projects/Web%20mobile%20customer/datasets/baselines) representing exact JSON trees for parser validation.
- **Regression Detection Flow**: Compares incoming execution plans against established baselines; flags node shifts (`Index Scan` $\rightarrow$ `Seq Scan`), buffer read spikes, and cost escalations.
- **Rollback Flow**: Validates that applying the reverse migration (`v1.1.1`) restores execution time and node type back to baseline tolerances (`0.102ms`, `Index Scan`).
- **Detailed Specification**: See [documentation/schema_tracking_and_rollback.md](file:///c:/projects/Web%20mobile%20customer/documentation/schema_tracking_and_rollback.md).



## Machine Learning
Two approaches are implemented and evaluated:
- **Isolation Forest**: Unsupervised anomaly detection.
- **Random Forest**: Supervised classification predicting specific regression types (Minor, Major, Critical).

The system automatically compares F1-scores, precision, and recall to select the most appropriate model.

## Installation

### Using Docker (Recommended)
1. Ensure Docker and Docker Compose are installed.
2. Clone this repository.
3. Run the following command in the root directory:
   ```bash
   docker-compose up --build
   ```
4. Access the frontend at `http://localhost:5173` and the backend API at `http://localhost:5000`.

### Manual Setup
1. Setup PostgreSQL and execute scripts in `database/init.sql`.
2. Navigate to `backend/`, install requirements, generate data, train models, and run the Flask app:
   ```bash
   pip install -r requirements.txt
   python generate_data.py
   python train_models.py
   python app.py
   ```
3. Navigate to `frontend/`, install dependencies, and start the Vite dev server:
   ```bash
   npm install
   npm run dev
   ```

## API Documentation
- `POST /api/auth/login`: Authenticate and receive JWT.
- `GET /api/dashboard/stats`: Retrieve aggregate regression statistics.
- `GET /api/queries/top-slow`: Retrieve the 10 slowest recent queries.
- `GET /api/regression/evidence/<index>`: Generate comparison evidence between old and new execution plans.
- `GET /api/reports/model-evaluation`: Fetch the automated ML comparison report.

## Future Work
- Integration with live PostgreSQL extensions (e.g., `pg_stat_statements`).
- Advanced explain-plan parsing using a robust SQL parser.
- Role-based Access Control (RBAC) implementation.
