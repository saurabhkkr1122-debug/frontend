from fastapi import APIRouter
from sqlalchemy import text

from db import engine


router = APIRouter(
    prefix="/api/dashboard",
    tags=["Dashboard"]
)


@router.get("/summary")
def dashboard_summary():
    with engine.connect() as connection:

        total_works = connection.execute(
            text("SELECT COUNT(*) FROM works")
        ).scalar()

        completed_works = connection.execute(
            text("SELECT COUNT(*) FROM work_completions")
        ).scalar()

        total_expenditure = connection.execute(
            text("""
                SELECT COALESCE(SUM(expenditure_amount), 0)
                FROM expenditures
            """)
        ).scalar()

        total_mps = connection.execute(
            text("SELECT COUNT(*) FROM mps")
        ).scalar()

    return {
        "total_works": total_works,
        "completed_works": completed_works,
        "total_expenditure": float(total_expenditure),
        "total_mps": total_mps
    }


@router.get("/stats")
def dashboard_stats():
    with engine.connect() as connection:
        total_projects = connection.execute(text("SELECT COUNT(*) FROM works")).scalar()
        
        total_allocated = connection.execute(text("SELECT COALESCE(SUM(sanctioned_amount), 0) FROM works")).scalar()
        
        delayed_projects = connection.execute(text("SELECT COUNT(*) FROM works WHERE status = 'Delayed'")).scalar()
        
        fraud_alerts = connection.execute(text("SELECT COUNT(*) FROM alerts WHERE severity IN ('Critical', 'High') AND status != 'resolved'")).scalar()
        
        by_status_rows = connection.execute(text("SELECT status, COUNT(*) as cnt FROM works GROUP BY status")).mappings().all()
        by_status = {row["status"]: row["cnt"] for row in by_status_rows}
        
        by_sector_rows = connection.execute(text("""
            SELECT c.description as sector, COALESCE(SUM(w.sanctioned_amount), 0) as amount
            FROM works w
            LEFT JOIN categories c ON w.category_id = c.category_id
            GROUP BY c.description
            ORDER BY amount DESC
        """)).mappings().all()
        by_sector = [{"sector": row["sector"] or "Unknown", "amount": float(row["amount"]) / 100000} for row in by_sector_rows]

    return {
        "totalProjects": total_projects,
        "totalAllocated": float(total_allocated),
        "delayedProjects": delayed_projects,
        "fraudAlerts": fraud_alerts,
        "byStatus": by_status,
        "bySector": by_sector
    }