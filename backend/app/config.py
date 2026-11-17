import os
from pathlib import Path
from dotenv import load_dotenv

# Locate .env file in backend/ or root
env_path = Path(__file__).resolve().parent.parent / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
# Requirement: Do not use deprecated Gemini 1.5 Flash. Default to gemini-2.5-flash
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
MAX_SCAN_INPUT_LENGTH = int(os.getenv("MAX_SCAN_INPUT_LENGTH", "1000"))
API_TIMEOUT_SECONDS = float(os.getenv("API_TIMEOUT_SECONDS", "10.0"))

# Database Configuration (PostgreSQL on Render / local)
DATABASE_URL = os.getenv("DATABASE_URL", "").strip()
# Normalize Render's postgres:// scheme to postgresql://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Frontend & CORS Configuration
FRONTEND_URL = os.getenv("FRONTEND_URL", "").strip()
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "").strip()
