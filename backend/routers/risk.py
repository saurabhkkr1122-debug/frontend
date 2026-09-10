from fastapi import APIRouter, HTTPException
from sqlalchemy import text

from db import engine


router = APIRouter(
    prefix="/api",
    tags=["Risk & Alerts"]
)


def _alert_row(row) -> dict:
    return {
        "id": row.get("id"),
        "alert_id": row.get("alert_id") or row.get("id"),
        "title": row.get("title") or row.get("alert_type") or "Alert",
        "severity": row.get("severity") or "Medium",
        "status": row.get("status") or "open",
        "project_name": row.get("project_name") or "",
        "project_id": row.get("project_id") or row.get("work_id"),
        "time_elapsed": row.get("time_elapsed") or "",
        "assessment": row.get("assessment") or row.get("description") or "",
        "notes": row.get("notes") or "",
        "evidence_count": row.get("evidence_count") or 0,
        "assignee": row.get("assignee") or "",
    }


def _anomaly_row(row) -> dict:
    return {
        "id": row.get("id"),
        "alert_id": row.get("anomaly_id") or row.get("id"),
        "severity": row.get("severity") or "Medium",
        "confidence": row.get("confidence") or 0,
        "title": row.get("title") or row.get("anomaly_type") or "Anomaly",
        "project_name": row.get("project_name") or "",
        "project_id": row.get("project_id") or row.get("work_id"),
        "time_elapsed": row.get("time_elapsed") or "",
        "explanation": row.get("explanation") or row.get("description") or "",
    }


@router.get("/risk/assessments")
def get_risk_assessments():

    query = text(
        "SELECT * FROM risk_assessments"
    )

    with engine.connect() as connection:
        rows = connection.execute(query).mappings().all()

    return [dict(row) for row in rows]


@router.get("/anomalies")
def get_anomalies():

    query = text(
        "SELECT * FROM anomalies"
    )

    with engine.connect() as connection:
        rows = connection.execute(query).mappings().all()

    return [_anomaly_row(row) for row in rows]


@router.get("/alerts")
def get_alerts():

    query = text(
        "SELECT * FROM alerts"
    )

    with engine.connect() as connection:
        rows = connection.execute(query).mappings().all()

    return [_alert_row(row) for row in rows]


@router.put("/alerts")
def update_alert(body: dict):
    alert_id = body.get("id")
    if alert_id is None:
        raise HTTPException(status_code=400, detail="id required")

    set_clauses = []
    params = {"id": alert_id}

    if "status" in body:
        set_clauses.append("status = :status")
        params["status"] = body["status"]
    if "assignee" in body:
        set_clauses.append("assignee = :assignee")
        params["assignee"] = body["assignee"]
    if "notes" in body:
        set_clauses.append("notes = :notes")
        params["notes"] = body["notes"]
    if "evidence_count" in body:
        set_clauses.append("evidence_count = :evidence_count")
        params["evidence_count"] = body["evidence_count"]

    if not set_clauses:
        raise HTTPException(status_code=400, detail="No fields to update")

    query = text(f"UPDATE alerts SET {', '.join(set_clauses)} WHERE id = :id")

    with engine.connect() as connection:
        result = connection.execute(query, params)
        connection.commit()

    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Alert not found")

    return {"ok": True}
