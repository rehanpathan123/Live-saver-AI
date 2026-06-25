from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import ai, analytics, auth, calendar, tasks
from app.core.config import settings
from app.db.base import Base
from app.db.session import engine
from app.models import *  # noqa: F401,F403

app = FastAPI(
    title="Life Saver AI API",
    version="1.0.0",
    description="AI productivity companion for proactive planning, prioritization, and execution.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(tasks.router, prefix="/tasks", tags=["Tasks"])
app.include_router(ai.router, prefix="/ai", tags=["AI"])
app.include_router(calendar.router, prefix="/calendar", tags=["Calendar"])
app.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])


@app.on_event("startup")
async def create_local_sqlite_schema() -> None:
    if settings.database_url.startswith("sqlite"):
        async with engine.begin() as connection:
            await connection.run_sync(Base.metadata.create_all)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
