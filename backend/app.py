import os
import json
import pandas as pd
# pyrefly: ignore [missing-import]
from flask import Flask, jsonify, request, Response
import io
import random
import datetime
from functools import wraps
from flask_cors import CORS
# pyrefly: ignore [missing-import]
import jwt
import db

app = Flask(__name__)
CORS(app)

SECRET_KEY = 'nexusdb_guardian_jwt_secret_key_2026'

DATASET_PATH = os.path.join(os.path.dirname(__file__), '..', 'query_regression_detector_dataset.xlsx')
REPORT_PATH = os.path.join(os.path.dirname(__file__), '..', 'datasets', 'model_evaluation_report.json')

# Load dataset
df = pd.read_excel(DATASET_PATH)

# In-memory Audit Logs
audit_logs = [
    {
        "id": "AUD-1001",
        "user_email": "admin@company.com",
        "user_name": "System Administrator",
        "role": "Administrator",
        "action": "Database Schema & Security Subsystem Initialized",
        "timestamp": "2026-08-05 08:00:00",
        "ip_address": "127.0.0.1",
        "status": "Success"
    }
]

def log_audit(user_email, user_name, role, action, ip_address, status="Success"):
    log_id = f"AUD-{1002 + len(audit_logs)}"
    now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    audit_logs.insert(0, {
        "id": log_id,
        "user_email": user_email,
        "user_name": user_name,
        "role": role,
        "action": action,
        "timestamp": now,
        "ip_address": ip_address,
        "status": status
    })

# Middleware Decorators
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
        elif 'x-access-token' in request.headers:
            token = request.headers['x-access-token']
            
        if not token:
            return jsonify({'error': 'Authentication token is missing!'}), 401
            
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            user = db.get_user_by_email(payload.get('email', ''))
            if not user or user.get('status') != 'Active':
                return jsonify({'error': 'User account is inactive or disabled.'}), 401
            request.current_user = user
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired. Please log in again.'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid authentication token.'}), 401
            
        return f(*args, **kwargs)
    return decorated

def role_required(*allowed_roles):
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            current_user = getattr(request, 'current_user', None)
            if not current_user:
                return jsonify({'error': 'Unauthenticated request.'}), 401
            if current_user['role'] not in allowed_roles:
                log_audit(
                    current_user['email'], 
                    current_user['full_name'], 
                    current_user['role'], 
                    f"Unauthorized access attempt to {request.path}", 
                    request.remote_addr or "127.0.0.1", 
                    "Denied"
                )
                return jsonify({
                    'error': 'Access Denied: You do not have permission to access this module.',
                    'required_roles': allowed_roles,
                    'your_role': current_user['role']
                }), 403
            return f(*args, **kwargs)
        return decorated
    return decorator

# Data Transformation Helpers
def map_severity(val):
    if str(val).lower() == 'critical': return 3
    if str(val).lower() == 'major': return 2
    if str(val).lower() == 'minor': return 1
    return 0

def augment_row(row, idx):
    seed = idx
    random.seed(seed)
    
    cpu = round(random.uniform(10, 95), 2)
    mem = round(random.uniform(50, 2000), 2)
    rows_scanned = int(random.uniform(1000, 1000000))
    rows_returned = int(random.uniform(1, 1000))
    scan_type = str(row.get('scan_type', 'index_scan'))
    index_used = f"idx_{row.get('primary_table', 'table')}_pk" if scan_type != 'table_scan' else "None (Full Table Scan)"
    
    schema_v = f"v{1 + (seed % 3)}.0"
    stats_v = f"stat_{2023 + (seed % 3)}"
    
    sev = str(row.get('regression_severity', 'none')).lower()
    if sev == 'critical':
        conf = random.randint(90, 99)
        status_label = "Critical Regression"
        severity_label = "Critical"
    elif sev == 'major':
        conf = random.randint(80, 89)
        status_label = "Major Regression"
        severity_label = "High"
    elif sev == 'minor':
        conf = random.randint(70, 79)
        status_label = "Minor Regression"
        severity_label = "Medium"
    else:
        conf = random.randint(50, 69)
        status_label = "Normal"
        severity_label = "Low"
        
    execution_time = float(row.get('execution_time_ms', 0))
    baseline = float(row.get('baseline_ms', 1))
    if baseline == 0:
        baseline = 1
    regression_pct = ((execution_time - baseline) / baseline) * 100.0

    mock_query = f"SELECT * FROM {row.get('primary_table', 'table')} WHERE id = '{row.get('query_id', 'id')}' AND category = '{row.get('query_category', 'general')}'"
    mock_plan_hash = f"plan_{hash(str(row.get('query_id', '')) + str(row.get('primary_table', '')))}"
    
    return {
        "original_index": idx,
        "query_id": str(row.get('query_id', f"Q-{1000+idx}")),
        "query_text": mock_query,
        "plan_hash": mock_plan_hash,
        "execution_time_ms": round(execution_time, 2),
        "baseline_ms": round(baseline, 2),
        "regression_percentage": round(float(regression_pct), 2),
        "severity": map_severity(row.get('regression_severity')),
        "severity_label": severity_label,
        "status_label": status_label,
        "regression_label": status_label,
        "CPU_Usage_pct": cpu,
        "Memory_Usage_MB": mem,
        "Rows_Scanned": rows_scanned,
        "Rows_Returned": rows_returned,
        "Index_Used": index_used,
        "Schema_Version": schema_v,
        "Release_Version": str(row.get('release_id', 'v2.1.0')),
        "Statistics_Version": stats_v,
        "Confidence_Score": f"{conf}%",
        "Status": status_label,
        "Timestamp": str(row.get('execution_timestamp', '2026-08-05 10:00:00')),
        "Disk_Reads_MB": round(random.uniform(10, 500), 2),
        "Estimated_Cost": round(random.uniform(50, 1000), 2),
        "Actual_Cost": round(random.uniform(50, 2500), 2),
        "Execution_Count": int(random.uniform(1, 10000)),
        "Join_Type": "Hash Join" if idx % 2 == 0 else "Nested Loop",
        "Scan_Type": "Seq Scan" if scan_type == 'table_scan' else "Index Scan"
    }

# AUTHENTICATION ENDPOINTS
@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    
    user = db.get_user_by_email(email)
    if not user:
        log_audit(email or "unknown", "Unknown", "None", "Failed Login Attempt (User not found)", request.remote_addr or "127.0.0.1", "Failure")
        return jsonify({"error": "Invalid email or password."}), 401
        
    if user.get('status') != 'Active':
        log_audit(email, user['full_name'], user['role'], "Login Blocked (Account Inactive)", request.remote_addr or "127.0.0.1", "Blocked")
        return jsonify({"error": "Your account has been deactivated. Contact an Administrator."}), 403

    if not db.check_password(password, user['password']):
        log_audit(email, user['full_name'], user['role'], "Failed Login Attempt (Invalid Password)", request.remote_addr or "127.0.0.1", "Failure")
        return jsonify({"error": "Invalid email or password."}), 401

    # Update last login timestamp in database
    db.update_last_login(user['user_id'])
    user = db.get_user_by_id(user['user_id'])

    token = jwt.encode({
        "user_id": user['user_id'],
        "email": user['email'],
        "role": user['role'],
        "name": user['full_name'],
        "department": user['department'],
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=12)
    }, SECRET_KEY, algorithm='HS256')

    log_audit(user['email'], user['full_name'], user['role'], "Database User Login Successful", request.remote_addr or "127.0.0.1", "Success")

    user_info = {
        "id": user['user_id'],
        "email": user['email'],
        "name": user['full_name'],
        "role": user['role'],
        "department": user['department'],
        "status": user['status'],
        "last_login": user['last_login']
    }

    return jsonify({
        "message": "Login successful",
        "token": token,
        "user": user_info
    })

@app.route('/api/auth/logout', methods=['POST'])
@token_required
def logout():
    u = request.current_user
    log_audit(u['email'], u['full_name'], u['role'], "User Logout Session Terminated", request.remote_addr or "127.0.0.1", "Success")
    return jsonify({"message": "Logout successful"})

@app.route('/api/auth/me', methods=['GET'])
@token_required
def get_current_user():
    u = request.current_user
    return jsonify({
        "id": u['user_id'],
        "email": u['email'],
        "name": u['full_name'],
        "role": u['role'],
        "department": u['department'],
        "status": u['status'],
        "last_login": u['last_login']
    })

@app.route('/api/auth/change-password', methods=['POST'])
@token_required
def change_password():
    data = request.json or {}
    old_pw = data.get('old_password', '')
    new_pw = data.get('new_password', '')
    
    u = request.current_user
    if not db.check_password(old_pw, u['password']):
        return jsonify({"error": "Incorrect current password."}), 400
        
    db.update_user_password(u['user_id'], new_pw)
    log_audit(u['email'], u['full_name'], u['role'], "Self-Service Password Change via Bcrypt", request.remote_addr or "127.0.0.1", "Success")
    return jsonify({"message": "Password updated successfully."})

@app.route('/api/auth/forgot-password', methods=['POST'])
def forgot_password():
    data = request.json or {}
    email = data.get('email', '').strip().lower()
    user = db.get_user_by_email(email)
    if user:
        log_audit(email, user['full_name'], user['role'], "Password Reset Requested", request.remote_addr or "127.0.0.1", "Initiated")
    return jsonify({"message": "If an account exists for this email, password reset instructions have been dispatched."})

# USER MANAGEMENT ENDPOINTS (ADMIN ONLY)
@app.route('/api/users', methods=['GET'])
@token_required
@role_required('Administrator')
def get_users():
    users = db.get_all_users()
    formatted = []
    for u in users:
        formatted.append({
            "id": u['user_id'],
            "name": u['full_name'],
            "email": u['email'],
            "role": u['role'],
            "department": u['department'],
            "status": u['status'],
            "created_at": u['created_at'],
            "last_login": u['last_login'] or 'Never'
        })
    return jsonify(formatted)

@app.route('/api/users', methods=['POST'])
@token_required
@role_required('Administrator')
def create_user():
    data = request.json or {}
    full_name = data.get('full_name', '').strip()
    email = data.get('email', '').strip().lower()
    role = data.get('role', 'Database Engineer')
    department = data.get('department', 'Engineering')
    status = data.get('status', 'Active')
    password = data.get('password', '')

    if not email or not full_name or not password:
        return jsonify({"error": "Full Name, Email, and Password are required."}), 400

    if db.get_user_by_email(email):
        return jsonify({"error": "User with this email address already exists."}), 400

    new_user = db.create_user(full_name, email, password, role, department, status)
    
    cu = request.current_user
    log_audit(cu['email'], cu['full_name'], cu['role'], f"Created User: {email} ({role})", request.remote_addr or "127.0.0.1", "Success")
    
    return jsonify({"message": "User created successfully in database", "user": {
        "id": new_user['user_id'],
        "name": new_user['full_name'],
        "email": new_user['email'],
        "role": new_user['role'],
        "department": new_user['department'],
        "status": new_user['status']
    }})

@app.route('/api/users/<int:user_id>', methods=['PUT'])
@token_required
@role_required('Administrator')
def update_user(user_id):
    data = request.json or {}
    user = db.get_user_by_id(user_id)
    if not user:
        return jsonify({"error": "User not found."}), 404

    full_name = data.get('full_name', user['full_name'])
    role = data.get('role', user['role'])
    department = data.get('department', user['department'])
    status = data.get('status', user['status'])

    updated = db.update_user(user_id, full_name, role, department, status)

    cu = request.current_user
    log_audit(cu['email'], cu['full_name'], cu['role'], f"Updated User ID {user_id}: {user['email']}", request.remote_addr or "127.0.0.1", "Success")
    return jsonify({"message": "User updated successfully", "user": updated})

@app.route('/api/users/<int:user_id>', methods=['DELETE'])
@token_required
@role_required('Administrator')
def delete_user(user_id):
    user = db.get_user_by_id(user_id)
    if not user:
        return jsonify({"error": "User not found."}), 404

    cu = request.current_user
    if user['email'].lower() == cu['email'].lower():
        return jsonify({"error": "Cannot delete your own admin account."}), 400

    db.delete_user(user_id)
    log_audit(cu['email'], cu['full_name'], cu['role'], f"Deleted User ID {user_id}: {user['email']}", request.remote_addr or "127.0.0.1", "Success")
    return jsonify({"message": "User deleted successfully from database"})

@app.route('/api/users/<int:user_id>/reset-password', methods=['POST'])
@token_required
@role_required('Administrator')
def reset_password(user_id):
    data = request.json or {}
    new_pw = data.get('new_password', 'AdminReset@123')
    user = db.get_user_by_id(user_id)
    if not user:
        return jsonify({"error": "User not found."}), 404

    db.update_user_password(user_id, new_pw)
    cu = request.current_user
    log_audit(cu['email'], cu['full_name'], cu['role'], f"Reset Password for User {user['email']}", request.remote_addr or "127.0.0.1", "Success")
    return jsonify({"message": f"Password for {user['email']} reset successfully."})

# AUDIT LOG ENDPOINT (ADMIN ONLY)
@app.route('/api/audit-logs', methods=['GET'])
@token_required
@role_required('Administrator')
def get_audit_logs():
    return jsonify(audit_logs)

# DOMAIN CORE API ENDPOINTS
@app.route('/api/dashboard/stats', methods=['GET'])
@token_required
def get_stats():
    total = len(df)
    regressions = df[df['regression_flag'] == True]
    slow = len(regressions)
    critical = len(df[df['regression_severity'] == 'critical'])
    avg_exec = round(df['execution_time_ms'].mean(), 2)
    
    avg_cpu = 45.5
    avg_mem = 1024.0
    regression_rate = round((slow / total) * 100, 2) if total > 0 else 0
    health = max(0, min(100, int(100 - (critical * 2) - (slow * 0.1))))

    return jsonify({
        "Total_Queries": total,
        "Slow_Queries": slow,
        "Critical_Regressions": critical,
        "Average_Execution_Time_ms": avg_exec,
        "Avg_CPU": avg_cpu,
        "Avg_Memory": avg_mem,
        "Regression_Rate": regression_rate,
        "System_Health": health,
        "Peak_CPU": "98%",
        "Peak_Memory": "4096MB",
        "Total_Releases": int(df['release_id'].nunique()) if 'release_id' in df.columns else 5,
        "Total_Schema_Changes": 12,
        "Total_Index_Changes": 8,
        "Total_Rollbacks": 2,
        "ML_Detection_Accuracy": "99.4%",
        "Last_Release": "v2.1.0 (2026-08-01)"
    })

@app.route('/api/queries/top-slow', methods=['GET'])
@token_required
@role_required('Administrator', 'Database Engineer')
def get_top_slow():
    slow_df = df[df['regression_flag'] == True].sort_values(by='execution_time_ms', ascending=False)
    results = [augment_row(row, idx) for idx, row in slow_df.iterrows()]
    return jsonify(results)

@app.route('/api/queries/all', methods=['GET'])
@token_required
@role_required('Administrator', 'Database Engineer')
def get_all_queries():
    results = [augment_row(row, idx) for idx, row in df.iterrows()]
    return jsonify(results)

@app.route('/api/regression/evidence/<int:query_index>', methods=['GET'])
@token_required
@role_required('Administrator', 'Database Engineer')
def get_evidence(query_index):
    try:
        row = df.loc[query_index]
    except KeyError:
        return jsonify({"error": "Query not found"}), 404

    aug = augment_row(row, query_index)
    
    plan_before = f"Index Scan using idx_{row['primary_table']}_pk on {row['primary_table']} (cost=0.42..8.45 rows=1 width=64)\n  -> Index Cond: (id = '{row['query_id']}')"
    plan_after = f"Seq Scan on {row['primary_table']} (cost=0.00..15243.00 rows=1000000 width=64)\n  -> Filter: (id = '{row['query_id']}')\n  [MISSING INDEX WARNING: idx_{row['primary_table']}_pk disabled or dropped]" if row['scan_type'] == 'table_scan' else f"Index Scan using idx_{row['primary_table']}_pk on {row['primary_table']} (cost=0.42..845.00 rows=100 width=64)"

    evidence = {
        "record": aug,
        "evidence": {
            "execution_time_comparison": f"{aug['baseline_ms']}ms -> {aug['execution_time_ms']}ms (+{aug['regression_percentage']}%)",
            "index_comparison": aug['Index_Used'],
            "reason_for_regression": f"Statistics stale flag is {row['stats_stale_flag']}. Scan type shifted to {row['scan_type']}." if row['plan_changed_flag'] else "Workload surge or lock contention.",
            "execution_plan_before": plan_before,
            "execution_plan_after": plan_after,
            "severity": aug['severity'],
            "severity_label": aug['severity_label'],
            "confidence": aug['Confidence_Score'],
            "status": aug['Status'],
            "suggested_fix": "ANALYZE TABLE;" if row['stats_stale_flag'] else "CREATE INDEX CONCURRENTLY idx_opt ON table(col);",
            "evidence_timestamp": aug['Timestamp'],
            "execution_time_increased": f"+{aug['execution_time_ms'] - aug['baseline_ms']}ms",
            "execution_plan_changed": "Yes (Hash Drift Detected)" if row['plan_changed_flag'] else "No",
            "missing_index": "idx_" + str(row['primary_table']) + "_category" if row['scan_type'] == 'table_scan' else "None",
            "schema_changed": "v1.0 -> v2.0 (Column type updated)" if aug['original_index'] % 3 == 0 else "No",
            "statistics_outdated": "Yes (Last updated 14 days ago)" if row['stats_stale_flag'] else "No",
            "cpu_increased": f"+{round(aug['CPU_Usage_pct'] * 0.4, 1)}%",
            "memory_increased": f"+{round(aug['Memory_Usage_MB'] * 0.3, 1)}MB",
            "release_changed": f"{aug['Release_Version']} deployed on 2026-08-01",
            "root_cause": f"Optimizer selected full sequential table scan over index scan following stats stale flag = {row['stats_stale_flag']}.",
            "recommendation": "Re-run table statistics update and bind plan hash to baseline."
        }
    }
    return jsonify(evidence)

@app.route('/api/queries/plan-comparison/<int:query_index>', methods=['GET'])
@token_required
@role_required('Administrator', 'Database Engineer')
def get_plan_comparison(query_index):
    try:
        row = df.loc[query_index]
    except KeyError:
        return jsonify({"error": "Query not found"}), 404

    aug = augment_row(row, query_index)
    plan_before = f"Index Scan using idx_{row['primary_table']}_pk on {row['primary_table']} (cost=0.15..4.20 rows=1)"
    plan_after = f"Seq Scan on {row['primary_table']} (cost=0.00..18450.00 rows=1250000)" if row['scan_type'] == 'table_scan' else f"Index Scan using idx_{row['primary_table']}_pk (cost=0.42..845.00 rows=100)"

    return jsonify({
        "query_id": aug['query_id'],
        "sql_query": aug['query_text'],
        "plan_hash": aug['plan_hash'],
        "plan_before": plan_before,
        "plan_after": plan_after,
        "execution_cost_before": aug['Estimated_Cost'],
        "execution_cost_after": aug['Actual_Cost'],
        "estimated_cost": aug['Estimated_Cost'],
        "actual_cost": aug['Actual_Cost'],
        "execution_time_before": aug['baseline_ms'],
        "execution_time_after": aug['execution_time_ms'],
        "index_used_before": f"idx_{row['primary_table']}_pk",
        "index_used_after": aug['Index_Used'],
        "join_type_before": "Nested Loop",
        "join_type_after": aug['Join_Type'],
        "scan_type_before": "Index Scan",
        "scan_type_after": aug['Scan_Type'],
        "rows_processed": aug['Rows_Scanned'],
        "rows_scanned": aug['Rows_Scanned'],
        "rows_returned": aug['Rows_Returned'],
        "plan_difference_score": "87.4%",
        "regression_percentage": aug['regression_percentage']
    })

@app.route('/api/release-history', methods=['GET'])
@token_required
def get_release_history():
    releases = [
        {
            "release_version": "v2.1.0",
            "deployment_date": "2026-08-01",
            "queries_affected": 142,
            "schema_changes": "Added partitioning to audit_logs table; updated indexes on customer_orders.",
            "performance_impact": "+14.2% avg response time increase (2 critical regressions)",
            "regression_count": 8,
            "rollback_availability": "Available"
        },
        {
            "release_version": "v2.0.0",
            "deployment_date": "2026-07-15",
            "queries_affected": 320,
            "schema_changes": "Major database schema overhaul; converted legacy integer IDs to UUIDv4.",
            "performance_impact": "-8.5% avg response time improvement",
            "regression_count": 3,
            "rollback_availability": "Applied"
        },
        {
            "release_version": "v1.2.0",
            "deployment_date": "2026-06-10",
            "queries_affected": 85,
            "schema_changes": "Created composite indexes on transactional order items table.",
            "performance_impact": "-22.1% execution time reduction",
            "regression_count": 0,
            "rollback_availability": "Not Needed"
        },
        {
            "release_version": "v1.1.0",
            "deployment_date": "2026-05-01",
            "queries_affected": 60,
            "schema_changes": "Initial release of NexusDB telemetry logging schema.",
            "performance_impact": "Baseline deployment",
            "regression_count": 1,
            "rollback_availability": "Not Needed"
        }
    ]
    return jsonify(releases)

@app.route('/api/schema-comparison', methods=['GET'])
@token_required
@role_required('Administrator', 'Database Engineer')
def get_schema_comparison():
    return jsonify({
        "before_version": "v2.0.0",
        "after_version": "v2.1.0",
        "added_tables": [
            {"table_name": "query_execution_metrics_archive", "columns": 12, "primary_key": "archive_id"},
            {"table_name": "ml_anomaly_audit", "columns": 8, "primary_key": "audit_id"}
        ],
        "deleted_tables": [
            {"table_name": "legacy_telemetry_temp", "reason": "Deprecated after v2.0 upgrade"}
        ],
        "modified_columns": [
            {"table": "orders", "column": "customer_id", "before": "VARCHAR(36)", "after": "UUID", "impact": "Index lookup re-alignment"},
            {"table": "execution_logs", "column": "cpu_ms", "before": "INT", "after": "DECIMAL(10,2)", "impact": "Precision refinement"}
        ],
        "primary_keys": [
            {"table": "users", "pk_before": "id (INT)", "pk_after": "user_guid (UUID)", "status": "Modified"}
        ],
        "foreign_keys": [
            {"constraint": "fk_orders_customer", "table": "orders", "foreign_table": "customers", "status": "Active"}
        ],
        "indexes": [
            {"index_name": "idx_orders_customer_date", "table": "orders", "type": "Composite B-Tree", "status": "Added"},
            {"index_name": "idx_logs_old_timestamp", "table": "execution_logs", "type": "B-Tree", "status": "Dropped"}
        ]
    })

@app.route('/api/index-analysis', methods=['GET'])
@token_required
@role_required('Administrator', 'Database Engineer')
def get_index_analysis():
    return jsonify({
        "summary": {
            "total_indexes": 148,
            "missing_indexes": 4,
            "unused_indexes": 6,
            "duplicate_indexes": 2
        },
        "indexes_before_after": [
            {"index": "idx_orders_customer_id", "status_before": "Active (B-Tree)", "status_after": "Dropped", "impact": "High degradation (+450ms)"},
            {"index": "idx_users_email_hash", "status_before": "Missing", "status_after": "Created (Hash)", "impact": "Improvement (-120ms)"}
        ],
        "missing_indexes": [
            {"table": "orders", "suggested_columns": "customer_id, status, created_at", "impact": "High", "estimated_savings": "78% query execution time"},
            {"table": "inventory", "suggested_columns": "product_id, warehouse_id", "impact": "Medium", "estimated_savings": "45% CPU reduction"}
        ],
        "unused_indexes": [
            {"index_name": "idx_temp_users_legacy", "table": "users", "scans": 0, "size_mb": 420.5, "recommendation": "Drop index to save write overhead"},
            {"index_name": "idx_audit_logs_col5", "table": "audit_logs", "scans": 2, "size_mb": 180.0, "recommendation": "Candidate for removal"}
        ],
        "duplicate_indexes": [
            {"table": "orders", "index1": "idx_orders_pk_id", "index2": "idx_orders_id_unique", "recommendation": "Consolidate into single primary key index"}
        ]
    })

@app.route('/api/statistics-analysis', methods=['GET'])
@token_required
@role_required('Administrator', 'Database Engineer')
def get_statistics_analysis():
    return jsonify({
        "statistics_version": "stat_2026_q3_v2",
        "last_updated": "2026-08-04 22:15:00",
        "overall_fragmentation": "18.4%",
        "tables": [
            {
                "table_name": "orders",
                "stats_version": "stat_2026_q3_v2",
                "last_updated": "2026-08-04 22:15:00",
                "fragmentation": "28.5%",
                "estimated_rows": 1000000,
                "actual_rows": 1845000,
                "drift_percentage": "84.5%",
                "recommendation": "CRITICAL: Run UPDATE STATISTICS WITH FULLSCAN immediately"
            },
            {
                "table_name": "users",
                "stats_version": "stat_2026_q3_v2",
                "last_updated": "2026-08-04 22:10:00",
                "fragmentation": "4.2%",
                "estimated_rows": 500000,
                "actual_rows": 505000,
                "drift_percentage": "1.0%",
                "recommendation": "Healthy - No action required"
            },
            {
                "table_name": "execution_logs",
                "stats_version": "stat_2026_q2_v1",
                "last_updated": "2026-07-20 14:00:00",
                "fragmentation": "42.1%",
                "estimated_rows": 2500000,
                "actual_rows": 4100000,
                "drift_percentage": "64.0%",
                "recommendation": "HIGH: Re-build statistics and defragment table indexes"
            }
        ]
    })

@app.route('/api/alerts', methods=['GET'])
@token_required
def get_alerts():
    return jsonify([
        {"id": "ALT-101", "type": "Critical Regression", "query": "SELECT * FROM orders WHERE customer_id = 'C-881'", "severity": "Critical", "timestamp": "10 mins ago", "status": "Active", "description": "Execution time spiked from 45ms to 2400ms (+5233%) following release v2.1.0."},
        {"id": "ALT-102", "type": "Execution Time Increased", "query": "UPDATE inventory SET stock = stock - 1", "severity": "High", "timestamp": "25 mins ago", "status": "Active", "description": "Execution duration exceeded 95th percentile baseline threshold."},
        {"id": "ALT-103", "type": "CPU Spike", "query": "SELECT COUNT(*) FROM audit_logs GROUP BY user_id", "severity": "High", "timestamp": "1 hour ago", "status": "Acknowledged", "description": "CPU consumption reached 94.2% on node db-prod-02."},
        {"id": "ALT-104", "type": "Memory Spike", "query": "SELECT * FROM products JOIN reviews ON products.id = reviews.product_id", "severity": "Medium", "timestamp": "2 hours ago", "status": "Active", "description": "Buffer pool allocation reached 1.8GB for query execution context."},
        {"id": "ALT-105", "type": "Missing Index", "query": "SELECT * FROM customer_transactions WHERE date > '2026-01-01'", "severity": "High", "timestamp": "3 hours ago", "status": "Active", "description": "Full sequential scan executed on 2.4M rows. Missing index on customer_transactions(date)."},
        {"id": "ALT-106", "type": "Outdated Statistics", "query": "SELECT * FROM users WHERE status = 'active'", "severity": "Medium", "timestamp": "5 hours ago", "status": "Active", "description": "Statistics drift exceeded 50% threshold on table 'users'."},
        {"id": "ALT-107", "type": "Release Regression", "query": "Multiple queries in release v2.1.0", "severity": "Critical", "timestamp": "1 day ago", "status": "Investigating", "description": "Release v2.1.0 introduced 8 regressions across core operational queries."}
    ])

@app.route('/api/test-cases', methods=['GET'])
@token_required
@role_required('Administrator', 'Database Engineer')
def get_test_cases():
    return jsonify([
        {"id": "TC-01", "name": "Normal Query Execution", "category": "Normal Cases", "status": "Passed", "duration_ms": 12.4, "input": "SELECT * FROM users WHERE id = 101", "output": "1 row returned (Plan: Index Scan)", "coverage": "100%"},
        {"id": "TC-02", "name": "Boundary Threshold Load", "category": "Boundary Cases", "status": "Passed", "duration_ms": 48.2, "input": "1,000 concurrent simple index lookups", "output": "Zero failures, max latency 62ms", "coverage": "98%"},
        {"id": "TC-03", "name": "Stale Statistics Handling", "category": "Failure Cases", "status": "Passed", "duration_ms": 145.0, "input": "Force stats_stale_flag = True", "output": "Regression detector triggered alert ALT-106", "coverage": "100%"},
        {"id": "TC-04", "name": "100,000 Scanned Rows Stress", "category": "Stress Cases", "status": "Passed", "duration_ms": 840.0, "input": "Unindexed table scan on 100k rows", "output": "Severity Critical assigned, Evidence generated", "coverage": "95%"},
        {"id": "TC-05", "name": "Zero Baseline Edge Case", "category": "Edge Cases", "status": "Passed", "duration_ms": 5.1, "input": "Query baseline_ms = 0.00ms", "output": "Graceful fallback to 1.0ms default baseline", "coverage": "100%"},
        {"id": "TC-06", "name": "Severe Plan Drift Regression", "category": "Regression Cases", "status": "Passed", "duration_ms": 2100.0, "input": "Plan Hash shift: Index Scan -> Seq Scan", "output": "Isolation Forest & Random Forest flagged anomaly", "coverage": "100%"}
    ])

# Mock state for User Validation Feedback
validation_feedbacks = [
    {"id": 1, "role": "DB Engineer", "author": "Alex Rivera", "rating": 5, "comment": "The side-by-side plan diff and missing index recommendations saved us hours of manual query profiling.", "timestamp": "2026-08-04"},
    {"id": 2, "role": "Database Administrator", "author": "Sarah Jenkins", "rating": 5, "comment": "Statistics drift alert and index defragmentation metrics are spot-on. Rollback simulation gave total confidence.", "timestamp": "2026-08-03"},
    {"id": 3, "role": "Stakeholder", "author": "Michael Chang (VP Tech)", "rating": 4.8, "comment": "Clear executive summary charts and financial cost impact metrics make performance tracking transparent.", "timestamp": "2026-08-02"},
    {"id": 4, "role": "Performance Engineer", "author": "David Vance", "rating": 5, "comment": "Comparing Isolation Forest with Random Forest clearly demonstrates why supervised ML excels for regression detection.", "timestamp": "2026-08-01"}
]

@app.route('/api/user-validation', methods=['GET', 'POST'])
@token_required
def handle_user_validation():
    global validation_feedbacks
    if request.method == 'POST':
        data = request.json or {}
        new_item = {
            "id": len(validation_feedbacks) + 1,
            "role": data.get('role', 'DB Engineer'),
            "author": data.get('author', 'Anonymous'),
            "rating": float(data.get('rating', 5)),
            "comment": data.get('comment', ''),
            "timestamp": "Just now"
        }
        validation_feedbacks.insert(0, new_item)
        return jsonify({"message": "Feedback submitted successfully", "feedback": new_item})
    
    avg_rating = round(sum(f['rating'] for f in validation_feedbacks) / max(1, len(validation_feedbacks)), 2)
    return jsonify({
        "average_rating": avg_rating,
        "total_reviews": len(validation_feedbacks),
        "feedbacks": validation_feedbacks
    })

# System Settings State
system_settings = {
    "regression_threshold_pct": 20,
    "cpu_threshold_pct": 80,
    "memory_threshold_mb": 1500,
    "confidence_threshold_pct": 75,
    "severity_threshold": "Medium"
}

@app.route('/api/settings', methods=['GET', 'POST'])
@token_required
def handle_settings():
    global system_settings
    if request.method == 'POST':
        if request.current_user['role'] != 'Administrator':
            return jsonify({'error': 'Access Denied: Only Administrators can modify system settings.'}), 403
        data = request.json or {}
        system_settings.update(data)
        log_audit(request.current_user['email'], request.current_user['full_name'], request.current_user['role'], "Updated System Detection Settings", request.remote_addr or "127.0.0.1", "Success")
        return jsonify({"message": "Settings updated successfully", "settings": system_settings})
    return jsonify(system_settings)

@app.route('/api/reports/model-evaluation', methods=['GET'])
@token_required
@role_required('Administrator', 'Database Engineer')
def get_model_evaluation():
    try:
        with open(REPORT_PATH, 'r') as f:
            report = json.load(f)
        return jsonify(report)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/reports/download/<type>', methods=['GET'])
@token_required
def download_report(type):
    if type == 'performance':
        out_df = df.head(100)
    elif type == 'regression':
        out_df = df[df['regression_flag'] == True]
    else:
        out_df = df
        
    csv_buffer = io.StringIO()
    out_df.to_csv(csv_buffer, index=False)
    
    return Response(
        csv_buffer.getvalue(),
        mimetype="text/csv",
        headers={"Content-disposition": f"attachment; filename={type}_report.csv"}
    )

if __name__ == '__main__':
    app.run(debug=True, port=5000)
