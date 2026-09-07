# SQL Query Regression Detection Prototype

## Project Overview
This project is a field-ready software prototype designed to detect SQL query performance regressions before they affect production users. It accomplishes this by capturing query execution logs, analyzing execution plans, and employing Machine Learning models to identify anomalies.

## Architecture
The system consists of three main components:
1. **Frontend**: React SPA using TailwindCSS for styling and Chart.js for data visualization.
2. **Backend**: Python Flask REST API integrating `scikit-learn` for ML inference and `pandas` for data manipulation.
3. **Database**: PostgreSQL storing historical query logs, execution plans, and schema changes.

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
