-- database/init.sql

CREATE TABLE release_history (
    release_id SERIAL PRIMARY KEY,
    version VARCHAR(50) NOT NULL,
    release_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    description TEXT
);

CREATE TABLE schema_changes (
    change_id SERIAL PRIMARY KEY,
    version VARCHAR(50) NOT NULL,
    table_name VARCHAR(100),
    change_type VARCHAR(50),
    change_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    description TEXT
);

CREATE TABLE statistics_history (
    stat_id SERIAL PRIMARY KEY,
    version VARCHAR(50) NOT NULL,
    table_name VARCHAR(100),
    last_analyzed TIMESTAMP NOT NULL,
    row_count BIGINT
);

CREATE TABLE execution_plans (
    plan_id SERIAL PRIMARY KEY,
    plan_hash VARCHAR(64) UNIQUE NOT NULL,
    plan_text TEXT NOT NULL,
    estimated_cost FLOAT,
    indexes_used TEXT[]
);

CREATE TABLE query_logs (
    log_id SERIAL PRIMARY KEY,
    query_text TEXT NOT NULL,
    plan_id INT REFERENCES execution_plans(plan_id),
    execution_time_ms FLOAT NOT NULL,
    cpu_usage_ms FLOAT,
    memory_usage_kb FLOAT,
    rows_processed BIGINT,
    actual_cost FLOAT,
    buffers_hit BIGINT,
    schema_version VARCHAR(50),
    release_version VARCHAR(50),
    statistics_version VARCHAR(50),
    regression_label VARCHAR(20), -- 'No Regression', 'Minor', 'Major', 'Critical'
    severity INT, -- 0 to 3
    execution_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance on the log table
CREATE INDEX idx_query_logs_timestamp ON query_logs(execution_timestamp);
CREATE INDEX idx_query_logs_plan ON query_logs(plan_id);
CREATE INDEX idx_query_logs_regression ON query_logs(regression_label);
