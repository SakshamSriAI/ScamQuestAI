import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.config import CORS_ORIGINS, FRONTEND_URL
from backend.app.db import init_db
from backend.app.routes import router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize PostgreSQL schema on startup (graceful fallback if unset)
    init_db()
    yield


app = FastAPI(
    title="ScamQuest API",
    description="Backend API and Deterministic Game Engine for ScamQuest — Gamified Financial Fraud Awareness",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS for local development and production deployments (Vercel / Render)
cors_origins_set = set()
if CORS_ORIGINS:
    if CORS_ORIGINS == "*":
        cors_origins_set.add("*")
    else:
        for origin in CORS_ORIGINS.split(","):
            cleaned = origin.strip().rstrip("/")
            if cleaned:
                cors_origins_set.add(cleaned)

if FRONTEND_URL and "*" not in cors_origins_set:
    cors_origins_set.add(FRONTEND_URL.rstrip("/"))

if not cors_origins_set or "*" in cors_origins_set:
    cors_origins = ["*"]
    allow_creds = False
else:
    # Always include local dev ports alongside configured production origins
    cors_origins_set.add("http://localhost:5173")
    cors_origins_set.add("http://localhost:3000")
    cors_origins_set.add("http://127.0.0.1:5173")
    cors_origins = list(cors_origins_set)
    allow_creds = True

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=allow_creds,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(router)


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=port, reload=True)
