import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.routes import router

app = FastAPI(
    title="ScamQuest API",
    description="Backend API and Deterministic Game Engine for ScamQuest — Gamified Financial Fraud Awareness",
    version="1.0.0",
)

# Configure CORS for local development and production deployments (Vercel / Render)
raw_cors = os.getenv("CORS_ORIGINS", "*")
if raw_cors == "*":
    cors_origins = ["*"]
    allow_creds = False
else:
    cors_origins = [origin.strip() for origin in raw_cors.split(",") if origin.strip()]
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
