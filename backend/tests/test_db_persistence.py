import pytest
from unittest.mock import MagicMock, patch
from backend.app.game_engine import GameEngine, GameSession, STARTING_SALARY
from backend.app.schemas import (
    DifficultyLevel,
    GameStartRequest,
    MessageLanguage,
    PlayerPersona,
    ScenarioResponse,
    ScamType,
    TransactionRecord,
)
from backend.app.db import get_db_status, is_db_available, init_db, save_session_to_db, load_session_from_db


def test_game_session_serialization_roundtrip():
    """Verify that GameSession accurately serializes to dictionary and deserializes back."""
    session = GameSession(
        session_id="test_sess_123",
        persona=PlayerPersona.WORKING_PROFESSIONAL,
        language=MessageLanguage.ENGLISH,
        total_days=30,
        initial_difficulty=DifficultyLevel.MEDIUM,
    )
    session.current_day = 5
    session.balance = 45000
    session.investments = 5000
    session.score = 350
    session.streak = 3
    session.max_streak = 4
    session.money_protected = 12000
    session.money_lost = 2000
    session.applied_expense_days = {3, 7}
    session.seen_message_texts = {"Electricity bill due", "UPI refund"}
    session.mistakes_by_category = {"ELECTRICITY_BILL": 1}
    session.category_counts = {"ELECTRICITY_BILL": {"seen": 2, "correct": 1, "wrong": 1}}

    # Add a mock scenario
    session.current_scenario = ScenarioResponse(
        message_text="Electricity supply will be disconnected tonight. Call 9876543210 immediately.",
        sender_id="BW-DISCOM",
        is_scam=True,
        scam_type=ScamType.ELECTRICITY_DISCONNECT,
        persona=PlayerPersona.WORKING_PROFESSIONAL,
        claimed_amount=1200,
        context_title="Fake Discom Disconnection",
        difficulty=DifficultyLevel.MEDIUM,
        language=MessageLanguage.ENGLISH,
        red_flags=["Unverified mobile number", "Urgency threats"],
        safe_action="Pay only via official utility portal.",
        explanation="Official discoms do not threaten immediate disconnection via personal numbers.",
    )

    state_dict = session.to_state_dict()
    transactions = session.get_serialized_transactions()

    assert state_dict["session_id"] == "test_sess_123"
    assert state_dict["balance"] == 45000
    assert state_dict["investments"] == 5000
    assert len(transactions) == 1
    assert transactions[0]["category"] == "SALARY"

    # Restore session
    restored = GameSession.from_state_dict(state_dict, transactions)

    assert restored.session_id == session.session_id
    assert restored.persona == session.persona
    assert restored.language == session.language
    assert restored.current_day == 5
    assert restored.balance == 45000
    assert restored.investments == 5000
    assert restored.net_worth == 50000
    assert restored.score == 350
    assert restored.streak == 3
    assert restored.max_streak == 4
    assert restored.money_protected == 12000
    assert restored.money_lost == 2000
    assert restored.applied_expense_days == {3, 7}
    assert restored.seen_message_texts == {"Electricity bill due", "UPI refund"}
    assert restored.current_scenario is not None
    assert restored.current_scenario.sender_id == "BW-DISCOM"
    assert len(restored.transactions) == 1


def test_in_memory_fallback_when_db_url_unset():
    """Verify that when no DATABASE_URL is set, engine operates smoothly in-memory."""
    with patch("backend.app.db.DATABASE_URL", ""):
        # Re-initialize
        status = get_db_status()
        assert "in_memory" in status


def test_engine_recovers_session_from_db_on_cache_miss():
    """Verify that GameEngine.get_session attempts to load from database when not in memory."""
    engine = GameEngine()
    fake_state = {
        "session_id": "persisted_sess_999",
        "persona": "SENIOR_CITIZEN",
        "language": "HINDI",
        "total_days": 30,
        "initial_difficulty": "EASY",
        "current_day": 10,
        "balance": 35000,
        "investments": 0,
        "score": 800,
        "streak": 5,
        "max_streak": 5,
        "money_protected": 25000,
        "money_lost": 0,
        "is_current_scenario_answered": False,
        "is_completed": False,
        "current_scenario": None,
        "last_answer_result": None,
        "applied_expense_days": [3],
        "seen_message_texts": [],
        "scenarios_history": [],
        "mistakes_by_category": {},
        "category_counts": {},
    }
    fake_txs = [
        {
            "id": "tx_1",
            "day": 1,
            "title": "Monthly Salary Credit",
            "amount": 50000,
            "balance_after": 50000,
            "category": "SALARY",
            "description": "Salary",
        }
    ]

    with patch("backend.app.game_engine.load_session_from_db", return_value=(fake_state, fake_txs)):
        session = engine.get_session("persisted_sess_999")
        assert session is not None
        assert session.session_id == "persisted_sess_999"
        assert session.persona == PlayerPersona.SENIOR_CITIZEN
        assert session.balance == 35000
        assert "persisted_sess_999" in engine.sessions


def test_production_reports_clear_database_failure_when_unreachable():
    """Verify that in production (DATABASE_URL configured), connection failures are reported explicitly and not hidden."""
    from fastapi.testclient import TestClient
    from backend.app.main import app

    client = TestClient(app)

    with patch("backend.app.config.DATABASE_URL", "postgresql://user:pass@nonexistent:5432/db"), \
         patch("backend.app.db.DATABASE_URL", "postgresql://user:pass@nonexistent:5432/db"), \
         patch("backend.app.db.is_db_available", return_value=False), \
         patch("backend.app.db.get_db_status", return_value="failed (postgresql connection error: OperationalError)"):
        
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert "degraded" in data["status"] or "unhealthy" in data["status"]
        assert data["session_storage"] == "error (database unavailable)"
        assert "failed" in data["database"]
