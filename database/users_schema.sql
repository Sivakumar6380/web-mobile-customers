-- =========================================================
-- PostgreSQL Database Schema: Users & Authentication
-- Project: NexusDB Guardian SQL Query Regression Detection
-- =========================================================

-- Create Users Table
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Hashed using bcrypt
    role VARCHAR(50) NOT NULL CHECK (role IN ('Administrator', 'Database Engineer', 'Stakeholder')),
    department VARCHAR(150) DEFAULT 'Engineering',
    status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Index on email for fast authentication lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Seed Initial Enterprise Accounts (Passwords hashed with bcrypt)
-- Administrator (Email: admin@company.com | Password: Admin@123)
-- Database Engineer (Email: engineer@company.com | Password: Engineer@123)
-- Stakeholder (Email: stakeholder@company.com | Password: Stakeholder@123)

INSERT INTO users (full_name, email, password, role, department, status, created_at, last_login)
VALUES 
    (
        'System Administrator', 
        'admin@company.com', 
        '$2b$12$G8FVEX/daH.xYXQWEy3JkOKjcFxXlOYg1LuvuJVkdalr/l4Q8nNQ6', -- Admin@123
        'Administrator', 
        'Database Operations & Infrastructure', 
        'Active', 
        CURRENT_TIMESTAMP, 
        CURRENT_TIMESTAMP
    ),
    (
        'Alex Rivera', 
        'engineer@company.com', 
        '$2b$12$y.Z1N1TkDf9QLgN3GpPY4uo9OKeBh11J/5SSg6r7di9ViCIVq47lC', -- Engineer@123
        'Database Engineer', 
        'Data Engineering & Performance Optimization', 
        'Active', 
        CURRENT_TIMESTAMP, 
        CURRENT_TIMESTAMP
    ),
    (
        'Michael Chang', 
        'stakeholder@company.com', 
        '$2b$12$3u.B8WflN9XTQLcfNvU1Y.xW0jGdr8SJA1D2Jm7MyDSeIPFoR5bfa', -- Stakeholder@123
        'Stakeholder', 
        'Executive Leadership & Tech Management', 
        'Active', 
        CURRENT_TIMESTAMP, 
        CURRENT_TIMESTAMP
    )
ON CONFLICT (email) DO NOTHING;

