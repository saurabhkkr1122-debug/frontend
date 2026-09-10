#!/usr/bin/env python3
"""Seed script for MPLADS Monitoring database."""

import os
import sys
from datetime import datetime, timedelta
from decimal import Decimal

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("ERROR: DATABASE_URL not set in backend/.env")
    sys.exit(1)

connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, connect_args=connect_args)


def run(query, params=None):
    with engine.connect() as conn:
        conn.execute(text(query), params or {})
        conn.commit()


def fetch(query, params=None):
    with engine.connect() as conn:
        result = conn.execute(text(query), params or {})
        return [dict(row._mapping) for row in result]


def insert(query, params):
    with engine.connect() as conn:
        result = conn.execute(text(query), params)
        conn.commit()
        return result.lastrowid


def main():
    print("Seeding database...")

    # Clean existing data
    for table in [
        "work_completions",
        "expenditures",
        "works",
        "mps",
        "states",
        "districts",
        "categories",
        "implementing_authorities",
        "risk_assessments",
        "anomalies",
        "alerts",
        "documents",
    ]:
        try:
            run(f"DELETE FROM {table}")
            print(f"  Cleaned {table}")
        except Exception as e:
            print(f"  Skip {table}: {e}")

    # Create tables if not exist (SQLite friendly)
    print("\nCreating tables...")
    run("""
        CREATE TABLE IF NOT EXISTS states (
            state_id INTEGER PRIMARY KEY AUTOINCREMENT,
            state_name TEXT NOT NULL
        )
    """)
    run("""
        CREATE TABLE IF NOT EXISTS districts (
            district_id INTEGER PRIMARY KEY AUTOINCREMENT,
            district_name TEXT NOT NULL
        )
    """)
    run("""
        CREATE TABLE IF NOT EXISTS categories (
            category_id INTEGER PRIMARY KEY AUTOINCREMENT,
            description TEXT NOT NULL
        )
    """)
    run("""
        CREATE TABLE IF NOT EXISTS implementing_authorities (
            ida_id INTEGER PRIMARY KEY AUTOINCREMENT,
            authority_name TEXT NOT NULL,
            contact_person TEXT,
            address TEXT
        )
    """)
    run("""
        CREATE TABLE IF NOT EXISTS mps (
            mp_id INTEGER PRIMARY KEY AUTOINCREMENT,
            mp_name TEXT NOT NULL,
            house TEXT,
            state_id INTEGER,
            FOREIGN KEY (state_id) REFERENCES states(state_id)
        )
    """)
    run("""
        CREATE TABLE IF NOT EXISTS works (
            work_id INTEGER PRIMARY KEY AUTOINCREMENT,
            source_work_id TEXT,
            work_description TEXT NOT NULL,
            mp_id INTEGER,
            state_id INTEGER,
            district_id INTEGER,
            category_id INTEGER,
            ida_id INTEGER,
            project_code TEXT,
            status TEXT DEFAULT 'On Track',
            sanctioned_amount NUMERIC DEFAULT 0,
            FOREIGN KEY (mp_id) REFERENCES mps(mp_id),
            FOREIGN KEY (state_id) REFERENCES states(state_id),
            FOREIGN KEY (district_id) REFERENCES districts(district_id),
            FOREIGN KEY (category_id) REFERENCES categories(category_id),
            FOREIGN KEY (ida_id) REFERENCES implementing_authorities(ida_id)
        )
    """)
    run("""
        CREATE TABLE IF NOT EXISTS expenditures (
            expenditure_id INTEGER PRIMARY KEY AUTOINCREMENT,
            work_id INTEGER,
            expenditure_amount NUMERIC NOT NULL,
            payment_status TEXT DEFAULT 'Payment Success',
            expenditure_date DATE NOT NULL,
            FOREIGN KEY (work_id) REFERENCES works(work_id)
        )
    """)
    run("""
        CREATE TABLE IF NOT EXISTS work_completions (
            completion_id INTEGER PRIMARY KEY AUTOINCREMENT,
            work_id INTEGER,
            completion_date DATE,
            FOREIGN KEY (work_id) REFERENCES works(work_id)
        )
    """)
    run("""
        CREATE TABLE IF NOT EXISTS risk_assessments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            alert_id TEXT,
            title TEXT,
            severity TEXT DEFAULT 'Medium',
            status TEXT DEFAULT 'open',
            project_name TEXT,
            project_id INTEGER,
            time_elapsed TEXT,
            assessment TEXT,
            description TEXT,
            notes TEXT,
            evidence_count INTEGER DEFAULT 0,
            assignee TEXT
        )
    """)
    run("""
        CREATE TABLE IF NOT EXISTS anomalies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            anomaly_id TEXT,
            severity TEXT DEFAULT 'Medium',
            confidence REAL DEFAULT 0,
            title TEXT,
            project_name TEXT,
            project_id INTEGER,
            time_elapsed TEXT,
            explanation TEXT,
            description TEXT
        )
    """)
    run("""
        CREATE TABLE IF NOT EXISTS alerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            alert_id TEXT,
            title TEXT,
            severity TEXT DEFAULT 'Medium',
            status TEXT DEFAULT 'open',
            project_name TEXT,
            project_id INTEGER,
            time_elapsed TEXT,
            assessment TEXT,
            description TEXT,
            notes TEXT,
            evidence_count INTEGER DEFAULT 0,
            assignee TEXT
        )
    """)
    run("""
        CREATE TABLE IF NOT EXISTS documents (
            document_id INTEGER PRIMARY KEY AUTOINCREMENT,
            work_id INTEGER,
            document_name TEXT,
            document_type TEXT,
            uploaded_at DATE,
            FOREIGN KEY (work_id) REFERENCES works(work_id)
        )
    """)
    print("  Tables created/verified")

    # Seed lookup tables
    print("\nSeeding lookup data...")
    states = [
        ("Delhi",), ("Uttar Pradesh",), ("Rajasthan",), ("Gujarat",),
        ("Maharashtra",), ("Bihar",), ("West Bengal",), ("Telangana",),
        ("Karnataka",), ("Tamil Nadu",),
    ]
    state_ids = {}
    for (name,) in states:
        sid = insert("INSERT INTO states (state_name) VALUES (:name)", {"name": name})
        state_ids[name] = sid
    print(f"  Inserted {len(states)} states")

    districts = [
        ("New Delhi",), ("Lucknow",), ("Jaipur",), ("Ahmedabad",),
        ("Mumbai Suburban",), ("Patna",), ("Kolkata North",), ("Hyderabad",),
        ("Bengaluru Urban",), ("Chennai Central",),
    ]
    district_ids = []
    for (name,) in districts:
        did = insert("INSERT INTO districts (district_name) VALUES (:name)", {"name": name})
        district_ids.append(did)
    print(f"  Inserted {len(districts)} districts")

    categories = [
        ("Roads & Infrastructure",), ("Water Supply",), ("Education",),
        ("Healthcare",), ("Building Works",), ("Sanitation",),
        ("Electrification",), ("Sports & Community",),
    ]
    category_ids = {}
    for (name,) in categories:
        cid = insert("INSERT INTO categories (description) VALUES (:name)", {"name": name})
        category_ids[name] = cid
    print(f"  Inserted {len(categories)} categories")

    authorities = [
        ("CPWD Division IV", "Rajesh Kumar", "CPWD Office, New Delhi"),
        ("Public Health Engineering", "Priya Sharma", "PHED Office, Lucknow"),
        ("Rural Development Dept", "Amit Singh", "RDD Office, Jaipur"),
        ("Urban Development Authority", "Neha Patel", "UDA Office, Ahmedabad"),
        ("Municipal Corporation", "Sanjay Joshi", "MC Office, Mumbai"),
    ]
    authority_ids = []
    for name, contact, addr in authorities:
        aid = insert(
            "INSERT INTO implementing_authorities (authority_name, contact_person, address) VALUES (:name, :contact, :addr)",
            {"name": name, "contact": contact, "addr": addr},
        )
        authority_ids.append(aid)
    print(f"  Inserted {len(authorities)} implementing authorities")

    # Seed MPs
    print("\nSeeding MPs...")
    mp_data = [
        ("Rahul Gandhi", "Lok Sabha", "Delhi"),
        ("Narendra Modi", "Lok Sabha", "Gujarat"),
        ("Yogi Adityanath", "Lok Sabha", "Uttar Pradesh"),
        ("Sachin Pilot", "Lok Sabha", "Rajasthan"),
        ("Uddhav Thackeray", "Lok Sabha", "Maharashtra"),
    ]
    mp_ids = {}
    for name, house, state in mp_data:
        sid = state_ids.get(state)
        mid = insert(
            "INSERT INTO mps (mp_name, house, state_id) VALUES (:name, :house, :state_id)",
            {"name": name, "house": house, "state_id": sid},
        )
        mp_ids[name] = mid
    print(f"  Inserted {len(mp_data)} MPs")

    # Seed works/projects
    print("\nSeeding projects...")
    project_templates = [
        {
            "desc": "Construction of CC Road and Drain from Block Office to PHC Gate",
            "mp": "Yogi Adityanath",
            "state": "Uttar Pradesh",
            "district": "Lucknow",
            "category": "Roads & Infrastructure",
            "authority": "CPWD Division IV",
            "source": "MPLAD/2024/LK-001",
            "code": "MPLAD/2024/LK-001",
            "status": "On Track",
            "amount": 8500000,
        },
        {
            "desc": "Installation of 50 RO Water Purifiers in Government Schools",
            "mp": "Rahul Gandhi",
            "state": "Delhi",
            "district": "New Delhi",
            "category": "Water Supply",
            "authority": "Public Health Engineering",
            "source": "MPLAD/2024/DL-042",
            "code": "MPLAD/2024/DL-042",
            "status": "On Track",
            "amount": 4200000,
        },
        {
            "desc": "Renovation of District Hospital Building and Equipment",
            "mp": "Sachin Pilot",
            "state": "Rajasthan",
            "district": "Jaipur",
            "category": "Healthcare",
            "authority": "Public Health Engineering",
            "source": "MPLAD/2024/RJ-018",
            "code": "MPLAD/2024/RJ-018",
            "status": "Delayed",
            "amount": 12500000,
        },
        {
            "desc": "Construction of Community Hall at Ward 12",
            "mp": "Narendra Modi",
            "state": "Gujarat",
            "district": "Ahmedabad",
            "category": "Building Works",
            "authority": "Urban Development Authority",
            "source": "MPLAD/2024/GJ-007",
            "code": "MPLAD/2024/GJ-007",
            "status": "On Track",
            "amount": 6800000,
        },
        {
            "desc": "Electrification of 200 Households in Rural Area",
            "mp": "Uddhav Thackeray",
            "state": "Maharashtra",
            "district": "Mumbai Suburban",
            "category": "Electrification",
            "authority": "Rural Development Dept",
            "source": "MPLAD/2024/MH-033",
            "code": "MPLAD/2024/MH-033",
            "status": "Elevated",
            "amount": 3100000,
        },
        {
            "desc": "Construction of Smart Toilets at Public Places",
            "mp": "Rahul Gandhi",
            "state": "Delhi",
            "district": "New Delhi",
            "category": "Sanitation",
            "authority": "Municipal Corporation",
            "source": "MPLAD/2024/DL-055",
            "code": "MPLAD/2024/DL-055",
            "status": "On Track",
            "amount": 2800000,
        },
        {
            "desc": "Development of Sports Complex with Synthetic Track",
            "mp": "Sachin Pilot",
            "state": "Rajasthan",
            "district": "Jaipur",
            "category": "Sports & Community",
            "authority": "Urban Development Authority",
            "source": "MPLAD/2024/RJ-029",
            "code": "MPLAD/2024/RJ-029",
            "status": "Critical",
            "amount": 15000000,
        },
        {
            "desc": "Upgradation of 10 Primary Health Centers",
            "mp": "Yogi Adityanath",
            "state": "Uttar Pradesh",
            "district": "Lucknow",
            "category": "Healthcare",
            "authority": "Public Health Engineering",
            "source": "MPLAD/2024/LK-012",
            "code": "MPLAD/2024/LK-012",
            "status": "On Track",
            "amount": 9800000,
        },
    ]

    work_ids = []
    for p in project_templates:
        wid = insert(
            """
            INSERT INTO works (
                work_description, mp_id, state_id, district_id, category_id, ida_id,
                source_work_id, project_code, status, sanctioned_amount
            ) VALUES (
                :desc, :mp_id, :state_id, :district_id, :category_id, :ida_id,
                :source, :code, :status, :amount
            )
            """,
            {
                "desc": p["desc"],
                "mp_id": mp_ids[p["mp"]],
                "state_id": state_ids[p["state"]],
                "district_id": district_ids[next(i for i, d in enumerate(districts) if d[0] == p["district"])],
                "category_id": category_ids[p["category"]],
                "ida_id": authority_ids[next(i for i, a in enumerate(authorities) if a[0] == p["authority"])],
                "source": p["source"],
                "code": p["code"],
                "status": p["status"],
                "amount": p["amount"],
            },
        )
        work_ids.append(wid)
    print(f"  Inserted {len(project_templates)} projects")

    # Seed expenditures
    print("\nSeeding expenditures...")
    expenditure_count = 0
    for wid in work_ids:
        base_date = datetime(2024, 4, 1)
        for i in range(3):
            amount = [250000, 500000, 300000, 450000, 180000][i % 5]
            status = "Payment Success" if i < 2 else "Payment In-Progress"
            exp_date = base_date + timedelta(days=30 * i)
            run(
                """
                INSERT INTO expenditures (work_id, expenditure_amount, payment_status, expenditure_date)
                VALUES (:wid, :amt, :status, :date)
                """,
                {
                    "wid": wid,
                    "amt": amount,
                    "status": status,
                    "date": exp_date.strftime("%Y-%m-%d"),
                },
            )
            expenditure_count += 1
    print(f"  Inserted {expenditure_count} expenditures")

    # Seed work_completions
    print("\nSeeding work completions...")
    completion_count = 0
    for wid in work_ids[:4]:
        run(
            """
            INSERT INTO work_completions (work_id, completion_date)
            VALUES (:wid, :date)
            """,
            {"wid": wid, "date": "2025-03-15"},
        )
        completion_count += 1
    print(f"  Inserted {completion_count} work completions")

    # Seed alerts
    print("\nSeeding alerts...")
    alert_templates = [
        ("Unusual spending spike detected", "Critical", "open", "Single-day vendor payout exceeds Rs 18L threshold"),
        ("Vendor concentration risk", "High", "assigned", "Same GSTIN appearing across 3 high-value works"),
        ("Schedule slippage beyond 45 days", "Medium", "open", "Work progress trails district median by 38%"),
        ("Payment verification pending", "High", "open", "3 transactions awaiting PFMS reconciliation"),
        ("Documentation incomplete", "Medium", "resolved", "Missing UC for Q2 release tranche"),
    ]
    for title, severity, status, assessment in alert_templates:
        wid = work_ids[0]
        run(
            """
            INSERT INTO alerts (title, severity, status, project_name, project_id, time_elapsed, assessment, assignee)
            VALUES (:title, :severity, :status, :pname, :pid, :time, :assessment, :assignee)
            """,
            {
                "title": title,
                "severity": severity,
                "status": status,
                "pname": f"Project {wid}",
                "pid": wid,
                "time": "2 days ago",
                "assessment": assessment,
                "assignee": "S. Iyer (Vigilance)" if status != "resolved" else "",
            },
        )
    print(f"  Inserted {len(alert_templates)} alerts")

    # Seed anomalies
    print("\nSeeding anomalies...")
    anomaly_templates = [
        ("Duplicate billing pattern detected", "Critical", 92, "Two invoices with identical amounts submitted within 48 hours"),
        ("Vendor GSTIN mismatch", "Warning", 78, "GSTIN state code does not match delivery location"),
        ("Progress photo timestamp anomaly", "Medium", 65, "Photo metadata shows future timestamp"),
        ("Beneficiary count inflated", "High", 85, "Claimed 500 beneficiaries but survey shows 320"),
    ]
    for title, severity, confidence, explanation in anomaly_templates:
        wid = work_ids[1]
        run(
            """
            INSERT INTO anomalies (title, severity, confidence, project_name, project_id, time_elapsed, explanation)
            VALUES (:title, :severity, :confidence, :pname, :pid, :time, :explanation)
            """,
            {
                "title": title,
                "severity": severity,
                "confidence": confidence,
                "pname": f"Project {wid}",
                "pid": wid,
                "time": "5 hours ago",
                "explanation": explanation,
            },
        )
    print(f"  Inserted {len(anomaly_templates)} anomalies")

    # Seed documents
    print("\nSeeding documents...")
    doc_count = 0
    for wid in work_ids[:3]:
        run(
            """
            INSERT INTO documents (work_id, document_name, document_type, uploaded_at)
            VALUES (:wid, :name, :type, :date)
            """,
            {
                "wid": wid,
                "name": f"Project_{wid}_Sanction_Order.pdf",
                "type": "Sanction Order",
                "date": "2024-03-01",
            },
        )
        doc_count += 1
    print(f"  Inserted {doc_count} documents")

    print("\nSeeding complete!")
    print("\nSummary:")
    for table in [
        "states",
        "districts",
        "categories",
        "implementing_authorities",
        "mps",
        "works",
        "expenditures",
        "work_completions",
        "alerts",
        "anomalies",
        "documents",
    ]:
        try:
            count = fetch(f"SELECT COUNT(*) as cnt FROM {table}")[0]["cnt"]
            print(f"  {table}: {count} rows")
        except Exception:
            pass


if __name__ == "__main__":
    main()
