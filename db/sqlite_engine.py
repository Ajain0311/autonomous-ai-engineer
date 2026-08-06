import sqlite3
import json
import os
import logging
from pathlib import Path
from typing import List, Dict, Any, Tuple

logger = logging.getLogger("sqlite_engine")

DB_DIR = Path(__file__).resolve().parent
DB_FILE = DB_DIR / "app_data.db"

def get_connection() -> sqlite3.Connection:
    """Returns a thread-safe connection to the embedded SQLite database."""
    conn = sqlite3.connect(str(DB_FILE), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_sqlite_db() -> None:
    """Initializes SQLite tables and seeds initial data from existing JSON files."""
    DB_DIR.mkdir(parents=True, exist_ok=True)
    conn = get_connection()
    cursor = conn.cursor()

    try:
        # 1. Product 01: AdBlocker Rules Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS rules (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                domain TEXT NOT NULL,
                category TEXT DEFAULT 'Ads',
                action TEXT DEFAULT 'block',
                priority INTEGER DEFAULT 1,
                enabled BOOLEAN DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # 2. Product 02: GitHub Blob Assets Catalog Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS blob_assets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                filename TEXT NOT NULL,
                type TEXT CHECK(type IN ('image', 'video', 'doc')),
                url TEXT NOT NULL,
                size TEXT NOT NULL,
                owner TEXT DEFAULT 'super_admin',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # 3. Product 03: Email Thread Chat Messages Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sender TEXT NOT NULL,
                recipient TEXT DEFAULT 'all',
                content TEXT NOT NULL,
                channel TEXT DEFAULT 'general',
                timestamp TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # 4. Global System Database: Users Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT,
                role TEXT CHECK(role IN ('super_admin', 'developer', 'viewer')) DEFAULT 'developer',
                enabled BOOLEAN DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # 5. Product Micro-Engine Queue Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS product_queue (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                category TEXT DEFAULT 'Browser Utility',
                target_day INTEGER DEFAULT 1,
                priority TEXT CHECK(priority IN ('HIGH', 'MEDIUM', 'LOW')) DEFAULT 'HIGH',
                status TEXT CHECK(status IN ('QUEUED', 'BUILDING', 'OPERATIONAL')) DEFAULT 'QUEUED',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # 6. Audit Logs Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS audit_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                author TEXT DEFAULT 'AI',
                action TEXT NOT NULL,
                details TEXT NOT NULL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

        conn.commit()

        # Seed initial data if tables are empty
        _seed_default_data(cursor)
        conn.commit()

        logger.info("Successfully initialized SQLite database at %s", DB_FILE)

    except Exception as e:
        logger.error("Failed to initialize SQLite DB: %s", e)
        conn.rollback()
    finally:
        conn.close()

def _seed_default_data(cursor: sqlite3.Cursor) -> None:
    """Populates empty SQLite tables with default seed data."""
    # Seed rules if empty
    cursor.execute("SELECT COUNT(*) as cnt FROM rules;")
    if cursor.fetchone()["cnt"] == 0:
        default_rules = [
            ("*doubleclick.net*", "Ads", "block", 1, 1),
            ("*google-analytics.com*", "Analytics", "block", 1, 1),
            ("*popads.net*", "Popups", "block", 2, 1),
            ("*facebook.com/tr/*", "Trackers", "block", 1, 1)
        ]
        cursor.executemany("INSERT INTO rules (domain, category, action, priority, enabled) VALUES (?, ?, ?, ?, ?);", default_rules)

    # Seed blob_assets if empty
    cursor.execute("SELECT COUNT(*) as cnt FROM blob_assets;")
    if cursor.fetchone()["cnt"] == 0:
        default_assets = [
            ("hero_banner.png", "image", "/storage/hero_banner.png", "1.2 MB", "super_admin"),
            ("demo_walkthrough.mp4", "video", "/storage/demo_walkthrough.mp4", "14.5 MB", "super_admin"),
            ("api_specification.pdf", "doc", "/storage/api_specification.pdf", "850 KB", "developer")
        ]
        cursor.executemany("INSERT INTO blob_assets (filename, type, url, size, owner) VALUES (?, ?, ?, ?, ?);", default_assets)

    # Seed messages if empty
    cursor.execute("SELECT COUNT(*) as cnt FROM messages;")
    if cursor.fetchone()["cnt"] == 0:
        default_messages = [
            ("aditya", "all", "Welcome to Product 03 Email Micro-Chat MVP!", "general", "10:30 AM"),
            ("super_admin", "all", "SignalR live chat engine and user workspace active.", "general", "10:32 AM")
        ]
        cursor.executemany("INSERT INTO messages (sender, recipient, content, channel, timestamp) VALUES (?, ?, ?, ?, ?);", default_messages)

    # Seed users if empty
    cursor.execute("SELECT COUNT(*) as cnt FROM users;")
    if cursor.fetchone()["cnt"] == 0:
        default_users = [
            ("aditya", "aditya@dailycode.internal", "super_admin", 1),
            ("developer_one", "dev1@dailycode.internal", "developer", 1),
            ("viewer_guest", "guest@dailycode.internal", "viewer", 1)
        ]
        cursor.executemany("INSERT INTO users (username, email, role, enabled) VALUES (?, ?, ?, ?);", default_users)

    # Seed product_queue if empty
    cursor.execute("SELECT COUNT(*) as cnt FROM product_queue;")
    if cursor.fetchone()["cnt"] == 0:
        default_queue = [
            ("Product 04: URL Cleaner & UTM Parameter Stripper", "Browser Utility", 2, "HIGH", "QUEUED"),
            ("Product 05: One-Click Tab Group & Session Saver", "Productivity Tool", 3, "HIGH", "QUEUED"),
            ("Product 06: Offline Password & Security Token Generator", "Security Tool", 4, "MEDIUM", "QUEUED")
        ]
        cursor.executemany("INSERT INTO product_queue (title, category, target_day, priority, status) VALUES (?, ?, ?, ?, ?);", default_queue)

def execute_query(query: str, params: tuple = ()) -> List[Dict[str, Any]]:
    """Executes a SQL query and returns results as list of dicts."""
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(query, params)
        if query.strip().upper().startswith(("SELECT", "PRAGMA", "EXPLAIN")):
            rows = cursor.fetchall()
            return [dict(row) for row in rows]
        else:
            conn.commit()
            return [{"affected_rows": cursor.rowcount, "last_insert_id": cursor.lastrowid}]
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()

def get_db_stats() -> Dict[str, Any]:
    """Returns database size, table count, total rows, and SQLite version."""
    init_sqlite_db()
    conn = get_connection()
    try:
        cursor = conn.cursor()

        # Database File Size
        file_size_bytes = DB_FILE.stat().st_size if DB_FILE.exists() else 0
        file_size_mb = round(file_size_bytes / (1024 * 1024), 3)

        # SQLite Version
        cursor.execute("SELECT sqlite_version() as ver;")
        sqlite_version = cursor.fetchone()["ver"]

        # Table names & Row counts
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';")
        tables = [row["name"] for row in cursor.fetchall()]

        total_rows = 0
        table_details = []
        for tbl in tables:
            cursor.execute(f"SELECT COUNT(*) as cnt FROM {tbl};")
            cnt = cursor.fetchone()["cnt"]
            total_rows += cnt
            table_details.append({"tableName": tbl, "rowCount": cnt})

        return {
            "status": "online",
            "engine": "SQLite Embedded (Zero-Hosting)",
            "db_path": str(DB_FILE.relative_to(DB_DIR.parent)),
            "sqlite_version": sqlite_version,
            "file_size_bytes": file_size_bytes,
            "file_size_formatted": f"{file_size_mb} MB" if file_size_mb >= 0.1 else f"{round(file_size_bytes / 1024, 1)} KB",
            "total_tables": len(tables),
            "total_rows": total_rows,
            "table_details": table_details
        }
    finally:
        conn.close()

if __name__ == "__main__":
    init_sqlite_db()
    print("Database Stats:", get_db_stats())
