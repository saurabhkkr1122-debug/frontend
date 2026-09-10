from fastapi import APIRouter, HTTPException
from sqlalchemy import text

from db import engine


router = APIRouter(
    prefix="/api/projects",
    tags=["Projects"]
)


def _row_to_frontend(row) -> dict:
    sanctioned = float(row.get("sanctioned_amount") or 0)
    expenditure = float(row.get("total_expenditure") or 0)
    progress = int((expenditure / sanctioned * 100) if sanctioned > 0 else 0)
    status = row.get("status") or "On Track"
    return {
        "id": row["work_id"],
        "project_id": row.get("source_work_id") or row.get("project_code") or f"MPLAD/{row['work_id']}",
        "name": row.get("work_description") or "",
        "constituency": row.get("mp_name") or "",
        "state": row.get("state_name") or "",
        "sector": row.get("category_name") or "",
        "nodal_district": row.get("district_name") or "",
        "amount": int(sanctioned / 100000),
        "progress": min(100, progress),
        "status": status,
        "risk_score": 0,
        "anomaly_score": 0,
        "utilisation": progress,
        "is_delayed": status == "Delayed",
        "vendor_name": "",
        "vendor_gstin": "",
        "implementing_agency": row.get("implementing_authority") or "",
        "description": row.get("work_description") or "",
        "sanctioned_date": "",
        "started_date": "",
        "expected_completion": "",
    }


@router.get("")
def get_projects():

    query = text(
        "SELECT "
        "w.work_id, "
        "w.source_work_id, "
        "w.work_description, "
        "w.status, "
        "w.sanctioned_amount, "
        "m.mp_name, "
        "s.state_name, "
        "d.district_name, "
        "c.description AS category_name, "
        "w.project_code, "
        "ia.authority_name AS implementing_authority, "
        "COALESCE(SUM(e.expenditure_amount), 0) as total_expenditure "
        "FROM works w "
        "JOIN mps m ON w.mp_id = m.mp_id "
        "JOIN states s ON m.state_id = s.state_id "
        "LEFT JOIN districts d ON w.district_id = d.district_id "
        "LEFT JOIN categories c ON w.category_id = c.category_id "
        "LEFT JOIN implementing_authorities ia "
        "ON w.ida_id = ia.ida_id "
        "LEFT JOIN expenditures e ON w.work_id = e.work_id "
        "GROUP BY w.work_id, w.source_work_id, w.work_description, w.status, w.sanctioned_amount, "
        "m.mp_name, s.state_name, d.district_name, c.description, w.project_code, ia.authority_name "
        "ORDER BY w.work_id"
    )

    with engine.connect() as connection:
        rows = connection.execute(query).mappings().all()

    return [_row_to_frontend(row) for row in rows]


@router.get("/{work_id}")
def get_project(work_id: int):

    query = text(
        "SELECT "
        "w.work_id, "
        "w.source_work_id, "
        "w.project_code, "
        "w.work_description, "
        "w.status, "
        "w.sanctioned_amount, "
        "m.mp_name, "
        "m.house, "
        "s.state_name, "
        "d.district_name, "
        "c.description AS category_name, "
        "ia.authority_name AS implementing_authority, "
        "COALESCE(SUM(e.expenditure_amount), 0) as total_expenditure "
        "FROM works w "
        "JOIN mps m ON w.mp_id = m.mp_id "
        "JOIN states s ON m.state_id = s.state_id "
        "LEFT JOIN districts d ON w.district_id = d.district_id "
        "LEFT JOIN categories c ON w.category_id = c.category_id "
        "LEFT JOIN implementing_authorities ia "
        "ON w.ida_id = ia.ida_id "
        "LEFT JOIN expenditures e ON w.work_id = e.work_id "
        "WHERE w.work_id = :work_id "
        "GROUP BY w.work_id, w.source_work_id, w.project_code, w.work_description, "
        "w.status, w.sanctioned_amount, m.mp_name, m.house, s.state_name, "
        "d.district_name, c.description, ia.authority_name"
    )

    with engine.connect() as connection:
        row = connection.execute(
            query,
            {"work_id": work_id}
        ).mappings().first()

    if row is None:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    return _row_to_frontend(row)


@router.delete("/{work_id}")
def delete_project(work_id: int):
    with engine.connect() as connection:
        result = connection.execute(
            text("DELETE FROM works WHERE work_id = :work_id"),
            {"work_id": work_id}
        )
        connection.commit()

    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Project not found")

    return {"ok": True}


@router.post("")
def create_project(body: dict):
    with engine.connect() as connection:
        row = connection.execute(
            text("""
                INSERT INTO works (work_description, mp_id, state_id, district_id, category_id, ida_id, source_work_id, project_code)
                VALUES (:desc, 1, 1, :district, 1, 1, :source, :code)
                RETURNING work_id
            """),
            {
                "desc": body.get("description") or body.get("name") or "New Work",
                "district": body.get("nodal_district"),
                "source": body.get("project_id"),
                "code": body.get("project_id"),
            }
        ).mappings().first()
        connection.commit()
        new_id = row["work_id"]

    return {"id": new_id, "project_id": body.get("project_id"), "name": body.get("name")}
