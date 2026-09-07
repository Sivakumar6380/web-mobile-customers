import os
import sqlite3
import datetime
import bcrypt

DB_FILE = os.path.join(os.path.dirname(__file__), '..', 'database', 'users.db')

def get_db_connection():
    os.makedirs(os.path.dirname(DB_FILE), exist_ok=True)
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def hash_password(plain_password: str) -> str:
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(plain_password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def check_password(plain_password: str, hashed_password: str) -> bool:
    try:
        if hashed_password.startswith('$2a$') or hashed_password.startswith('$2b$'):
            return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
        # Fallback for werkzeug hashes if present
        from werkzeug.security import check_password_hash
        return check_password_hash(hashed_password, plain_password)
    except Exception as e:
        print("Password check error:", e)
        return False

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL CHECK (role IN ('Administrator', 'Database Engineer', 'Stakeholder')),
            department TEXT DEFAULT 'Engineering',
            status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
            created_at TEXT NOT NULL,
            last_login TEXT
        )
    ''')

    # Seed default accounts if empty
    cursor.execute("SELECT COUNT(*) FROM users")
    count = cursor.fetchone()[0]
    if count == 0:
        now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        seed_users = [
            (
                "System Administrator", 
                "admin@company.com", 
                hash_password("Admin@123"), 
                "Administrator", 
                "Database Operations & Infrastructure", 
                "Active", 
                now_str, 
                now_str
            ),
            (
                "Alex Rivera", 
                "engineer@company.com", 
                hash_password("Engineer@123"), 
                "Database Engineer", 
                "Data Engineering & Performance Optimization", 
                "Active", 
                now_str, 
                now_str
            ),
            (
                "Michael Chang", 
                "stakeholder@company.com", 
                hash_password("Stakeholder@123"), 
                "Stakeholder", 
                "Executive Leadership & Tech Management", 
                "Active", 
                now_str, 
                now_str
            )
        ]
        cursor.executemany('''
            INSERT INTO users (full_name, email, password, role, department, status, created_at, last_login)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', seed_users)
        conn.commit()
    conn.close()

def get_user_by_email(email: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE LOWER(email) = LOWER(?)", (email.strip(),))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def get_user_by_id(user_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE user_id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def get_all_users():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT user_id, full_name, email, role, department, status, created_at, last_login FROM users ORDER BY user_id ASC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def create_user(full_name: str, email: str, plain_password: str, role: str, department: str = 'Engineering', status: str = 'Active'):
    conn = get_db_connection()
    cursor = conn.cursor()
    hashed = hash_password(plain_password)
    now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute('''
        INSERT INTO users (full_name, email, password, role, department, status, created_at, last_login)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (full_name, email.strip().lower(), hashed, role, department, status, now_str, "Never"))
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    return get_user_by_id(new_id)

def update_user(user_id: int, full_name: str, role: str, department: str, status: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE users 
        SET full_name = ?, role = ?, department = ?, status = ?
        WHERE user_id = ?
    ''', (full_name, role, department, status, user_id))
    conn.commit()
    conn.close()
    return get_user_by_id(user_id)

def update_user_password(user_id: int, new_plain_password: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    hashed = hash_password(new_plain_password)
    cursor.execute("UPDATE users SET password = ? WHERE user_id = ?", (hashed, user_id))
    conn.commit()
    conn.close()

def update_last_login(user_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute("UPDATE users SET last_login = ? WHERE user_id = ?", (now_str, user_id))
    conn.commit()
    conn.close()

def delete_user(user_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM users WHERE user_id = ?", (user_id,))
    conn.commit()
    conn.close()

# Auto-initialize database schema on module import
init_db()
