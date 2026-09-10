from fastapi import APIRouter
from sqlalchemy import text

from db import engine


router = APIRouter(
    prefix="/api/financial",
    tags=["Financial Analytics"]
)


@router.get("/summary")
def get_financial_summary():

    query = text(
        "SELECT "
        "COUNT(*) AS expenditure_count, "
        "COALESCE(SUM(expenditure_amount), 0) AS total_expenditure, "
        "COALESCE(SUM(CASE "
        "WHEN payment_status = 'Payment Success' "
        "THEN expenditure_amount ELSE 0 END), 0) AS successful_expenditure, "
        "COALESCE(SUM(CASE "
        "WHEN payment_status = 'Payment In-Progress' "
        "THEN expenditure_amount ELSE 0 END), 0) AS pending_expenditure "
        "FROM expenditures"
    )

    with engine.connect() as connection:
        row = connection.execute(query).mappings().first()

    return {
        "expenditure_count": row["expenditure_count"],
        "total_expenditure": float(row["total_expenditure"]),
        "successful_expenditure": float(row["successful_expenditure"]),
        "pending_expenditure": float(row["pending_expenditure"])
    }


@router.get("/by-status")
def get_expenditure_by_status():

    query = text(
        "SELECT "
        "payment_status, "
        "COUNT(*) AS transaction_count, "
        "COALESCE(SUM(expenditure_amount), 0) AS amount "
        "FROM expenditures "
        "GROUP BY payment_status "
        "ORDER BY payment_status"
    )

    with engine.connect() as connection:
        rows = connection.execute(query).mappings().all()

    return [dict(row) for row in rows]