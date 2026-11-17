from fastapi import APIRouter, HTTPException, Path, status
from backend.app.game_engine import GameEngine
from backend.app.schemas import (
    GameSessionPublicState,
    GameStartRequest,
    MonthEndReportResponse,
    PlayerAnswerRequest,
    PlayerAnswerResponse,
    ScanRequest,
    ScanResultResponse,
)

router = APIRouter()

# Global game engine instance
engine = GameEngine()


@router.get("/health", tags=["System"])
def health_check():
    from backend.app.config import DATABASE_URL
    from backend.app.db import get_db_status, is_db_available
    db_status = get_db_status()
    db_ok = is_db_available()

    if DATABASE_URL:
        # Production environment: DATABASE_URL is configured
        if db_ok:
            status_text = "healthy"
            storage_mode = "postgresql"
        else:
            status_text = "degraded (database unavailable)"
            storage_mode = "error (database unavailable)"
    else:
        # Local / test environment: no DATABASE_URL configured
        status_text = "healthy"
        storage_mode = "in_memory"

    return {
        "status": status_text,
        "service": "ScamQuest API",
        "version": "1.0.0",
        "session_storage": storage_mode,
        "database": db_status,
    }


@router.post("/api/game/start", response_model=GameSessionPublicState, status_code=status.HTTP_201_CREATED, tags=["Game"])
def start_game(request: GameStartRequest):
    """
    Initializes a new 30-day ScamQuest run with ₹50,000 fictional starting salary.
    Returns session ID and initial Day 1 scenario.
    """
    return engine.create_session(request)


@router.get("/api/game/{session_id}", response_model=GameSessionPublicState, tags=["Game"])
def get_game_state(session_id: str = Path(..., description="Unique game session ID")):
    """
    Retrieves the current public state of the game session.
    Withholds ground truth for the active scenario until answered.
    """
    session = engine.get_session(session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Game session '{session_id}' not found. Note: Server restarts clear in-memory sessions."
        )
    return session.to_public_state()


@router.post("/api/game/{session_id}/next", response_model=GameSessionPublicState, tags=["Game"])
def next_scenario(session_id: str = Path(..., description="Unique game session ID")):
    """
    Advances to the next day's scenario.
    Enforces strict progression: Current scenario must be answered first.
    Applies scheduled routine expenses (rent, groceries, SIP) on specific days.
    """
    try:
        return engine.advance_to_next_scenario(session_id)
    except KeyError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Game session '{session_id}' not found."
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/api/game/{session_id}/answer", response_model=PlayerAnswerResponse, tags=["Game"])
def submit_answer(
    answer: PlayerAnswerRequest,
    session_id: str = Path(..., description="Unique game session ID")
):
    """
    Submits player's verdict ('SCAM' or 'SAFE') for the active scenario.
    Evaluates correctness, updates score and streak, applies deterministic penalties,
    and returns an AI-generated explanation. Prevents duplicate submissions.
    """
    try:
        return engine.evaluate_player_answer(session_id, choice=answer.choice)
    except KeyError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Game session '{session_id}' not found."
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/api/game/{session_id}/report", response_model=MonthEndReportResponse, tags=["Game"])
def get_month_end_report(session_id: str = Path(..., description="Unique game session ID")):
    """
    Calculates final simulated ledger statistics, Scam Survival Score,
    achievements, and generates a personalized month-end coaching breakdown.
    Available only after completing all days of the month.
    """
    try:
        return engine.generate_month_end_report(session_id)
    except KeyError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Game session '{session_id}' not found."
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/api/game/{session_id}/restart", response_model=GameSessionPublicState, tags=["Game"])
def restart_game(session_id: str = Path(..., description="Unique game session ID")):
    """
    Restarts an existing session back to Day 1 with fresh ₹50,000 balance and state.
    """
    session = engine.get_session(session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Game session '{session_id}' not found."
        )
    return engine.restart_session(session_id)


@router.post("/api/scan", response_model=ScanResultResponse, tags=["Forensics"])
def scan_untrusted_message(request: ScanRequest):
    """
    Forensic Scan Mode: Analyzes user-pasted message using deterministic rules + Gemini.
    Returns risk score (0-100), detected tactics, and actionable advice.
    Never guarantees absolute legitimacy.
    """
    return engine.ai_service.scan_message(request)
