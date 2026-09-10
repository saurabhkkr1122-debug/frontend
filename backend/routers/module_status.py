from fastapi import APIRouter
from sqlalchemy import text

from db import engine


router = APIRouter(
    prefix="/api",
    tags=["Module Status"]
)


def get_count(table_name: str) -> int:
    with engine.connect() as connection:
        result = connection.execute(
            text(f"SELECT COUNT(*) FROM {table_name}")
        )
        return int(result.scalar() or 0)


@router.get("/risk/summary")
def risk_summary():
    return {
        "risk_assessments": get_count("risk_assessments"),
        "anomalies": get_count("anomalies")
    }


@router.get("/anomalies/summary")
def anomalies_summary():
    return {
        "anomalies": get_count("anomalies"),
        "risk_assessments": get_count("risk_assessments")
    }


@router.get("/alerts/summary")
def alerts_summary():
    return {
        "alerts": get_count("alerts"),
        "anomalies": get_count("anomalies")
    }


@router.get("/map/summary")
def map_summary():
    return {
        "states": get_count("states"),
        "districts": get_count("districts"),
        "projects": get_count("works")
    }


@router.get("/evidence/summary")
def evidence_summary():
    return {
        "documents": get_count("documents"),
        "projects": get_count("works")
    }


@router.get("/copilot/context")
def copilot_context():
    return {
        "projects": get_count("works"),
        "expenditures": get_count("expenditures"),
        "risk_assessments": get_count("risk_assessments"),
        "anomalies": get_count("anomalies"),
        "alerts": get_count("alerts")
    }


@router.get("/reports/summary")
def reports_summary():
    return {
        "projects": get_count("works"),
        "expenditures": get_count("expenditures"),
        "risk_assessments": get_count("risk_assessments"),
        "anomalies": get_count("anomalies"),
        "alerts": get_count("alerts"),
        "documents": get_count("documents")
    }