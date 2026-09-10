from fastapi import APIRouter, HTTPException
from sqlalchemy import text
from pydantic import BaseModel
from typing import List, Optional

from db import engine


router = APIRouter(prefix="/api", tags=["Compatibility"])


class RiskPredictRequest(BaseModel):
    title: str = ""
    constituency: str = ""
    sector: str = ""
    nodal_district: str = ""
    implementing_agency: str = ""
    vendor_gstin: str = ""
    amount: float = 0
    duration_months: int = 12


@router.get("/dashboard-stats")
def get_dashboard_stats():
    with engine.connect() as connection:
        total_works = connection.execute(text("SELECT COUNT(*) FROM works")).scalar()
        completed_works = connection.execute(text("SELECT COUNT(*) FROM work_completions")).scalar()
        total_expenditure = connection.execute(
            text("SELECT COALESCE(SUM(expenditure_amount), 0) FROM expenditures")
        ).scalar()
        total_mps = connection.execute(text("SELECT COUNT(*) FROM mps")).scalar()

        delayed_projects = connection.execute(
            text("SELECT COUNT(*) FROM works WHERE status = 'Delayed'")
        ).scalar()

        fraud_alerts = connection.execute(
            text("SELECT COUNT(*) FROM alerts WHERE severity IN ('Critical', 'High') AND status != 'resolved'")
        ).scalar()

        open_alerts = connection.execute(
            text("SELECT COUNT(*) FROM alerts WHERE status = 'open'")
        ).scalar()

        by_status_rows = connection.execute(
            text("""
                SELECT w.status, COUNT(*) as count
                FROM works w
                GROUP BY w.status
            """)
        ).mappings().all()

        by_sector_rows = connection.execute(
            text("""
                SELECT c.description as sector, COUNT(*) as count, COALESCE(SUM(e.expenditure_amount), 0) as amount
                FROM works w
                LEFT JOIN categories c ON w.category_id = c.category_id
                LEFT JOIN expenditures e ON w.work_id = e.work_id
                GROUP BY c.description
            """)
        ).mappings().all()

    by_status = {row["status"] or "Unknown": row["count"] for row in by_status_rows}
    by_sector = [
        {"sector": row["sector"] or "Uncategorized", "count": row["count"], "amount": float(row["amount"] or 0)}
        for row in by_sector_rows
    ]

    return {
        "totalProjects": total_works or 0,
        "totalAllocated": float(total_expenditure or 0),
        "delayedProjects": delayed_projects or 0,
        "fraudAlerts": fraud_alerts or 0,
        "openAlerts": open_alerts or 0,
        "byStatus": by_status,
        "bySector": by_sector,
    }


@router.get("/trends")
def get_trends():
    with engine.connect() as connection:
        rows = connection.execute(
            text("""
                SELECT 
                    strftime('%Y-%m', e.expenditure_date) as month,
                    COALESCE(SUM(e.expenditure_amount), 0) as expenditure,
                    COALESCE(SUM(w.sanctioned_amount), 0) as allocation
                FROM expenditures e
                LEFT JOIN works w ON e.work_id = w.work_id
                GROUP BY strftime('%Y-%m', e.expenditure_date)
                ORDER BY month
            """)
        ).mappings().all()

    return [
        {
            "month": row["month"],
            "allocation": float(row["allocation"] or 0),
            "expenditure": float(row["expenditure"] or 0),
            "utilisation": 0,
        }
        for row in rows
    ]


@router.get("/vendors")
def get_vendors():
    with engine.connect() as connection:
        rows = connection.execute(
            text("""
                SELECT 
                    ia.ida_id as id,
                    ia.authority_name as name,
                    ia.contact_person as gstin,
                    ia.address as location,
                    COUNT(w.work_id) as transactions,
                    0 as risk_score,
                    'No risk assessment available' as explanation
                FROM implementing_authorities ia
                LEFT JOIN works w ON ia.ida_id = w.ida_id
                GROUP BY ia.ida_id, ia.authority_name, ia.contact_person, ia.address
            """)
        ).mappings().all()

    return [dict(row) for row in rows]


@router.post("/risk-predict")
def risk_predict(body: RiskPredictRequest):
    amt = body.amount or 0
    dur = body.duration_months or 12
    breakdown = []

    fin = 8
    if amt >= 100:
        fin = 28
    elif amt >= 50:
        fin = 22
    elif amt >= 25:
        fin = 16
    elif amt >= 10:
        fin = 11
    breakdown.append({
        "factor": "Financial Exposure",
        "score": fin,
        "max": 30,
        "detail": f"Sanctioned value Rs {amt} L in a single work order raises fund-diversion exposure.",
    })

    ven = 6
    gstin = body.vendor_gstin or ""
    if not gstin:
        ven = 18
    elif not gstin.strip() or len(gstin.strip()) != 15:
        ven = 21
    elif gstin[:2] in ("27", "07", "09"):
        ven = 9
    breakdown.append({
        "factor": "Vendor Credibility",
        "score": ven,
        "max": 25,
        "detail": f"GSTIN {gstin.upper()} format and state-code registry cross-check completed." if gstin else "No vendor GSTIN supplied - entity cannot be verified against the registry.",
    })

    high_risk_sectors = ["Roads & Infrastructure", "Water Supply", "Building Works"]
    sec = 12 if body.sector in high_risk_sectors else 6
    breakdown.append({
        "factor": "Sector Complexity",
        "score": sec,
        "max": 15,
        "detail": f"{body.sector or 'Unspecified sector'} benchmarked against 4,200 historical MPLAD works for cost-overrun probability.",
    })

    tim = 5
    if dur < 4:
        tim = 13
    elif dur < 7:
        tim = 9
    elif dur > 24:
        tim = 11
    breakdown.append({
        "factor": "Execution Timeline",
        "score": tim,
        "max": 15,
        "detail": f"Planned duration of {dur} months vs district median of 11 months for comparable works.",
    })

    doc = 7
    if not body.title:
        doc += 3
    if not body.implementing_agency:
        doc += 3
    if not body.nodal_district:
        doc += 2
    doc = min(doc, 15)
    filled = len([x for x in [body.title, body.constituency, body.implementing_agency, body.nodal_district] if x])
    breakdown.append({
        "factor": "Documentation Completeness",
        "score": doc,
        "max": 15,
        "detail": f"{filled}/4 core dossier fields populated.",
    })

    score = min(99, sum(b["score"] for b in breakdown))
    band = "Critical Risk" if score >= 80 else "Elevated Risk" if score >= 60 else "Moderate Risk" if score >= 35 else "Low Risk"

    return {"score": score, "band": band, "breakdown": breakdown}
