from fastapi import FastAPI
from routers.projects import router as projects_router
from db import test_database_connection
from routers.dashboard import router as dashboard_router
from routers.financial import router as financial_router
from routers.risk import router as risk_router
from routers.module_status import router as module_status_router
from routers.compat import router as compat_router

app = FastAPI(
    title="MPLADS Monitoring API",
    description="Backend API for the MPLADS AI Monitoring Portal",
    version="1.0.0"
)


app.include_router(dashboard_router)
app.include_router(projects_router)
app.include_router(financial_router)
app.include_router(risk_router)
app.include_router(module_status_router)
app.include_router(compat_router)

@app.get("/")
def root():
    return {
        "message": "MPLADS Monitoring API is running",
        "status": "ok"
    }


@app.get("/api/health")
def health():
    try:
        database_connected = test_database_connection()

        return {
            "status": "healthy",
            "database": "connected" if database_connected else "not connected"
        }

    except Exception as error:
        return {
            "status": "unhealthy",
            "database": "not connected",
            "error": str(error)
        }