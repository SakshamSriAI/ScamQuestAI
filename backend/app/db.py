import json
import logging
from typing import Any, Dict, List, Optional, Tuple
import psycopg2
from psycopg2.extras import RealDictCursor

from backend.app.config import DATABASE_URL

logger = logging.getLogger("scamquest.db")

_db_initialized: bool = False
_db_available: bool = False
_db_status_message: str = "uninitialized"


def get_connection(timeout: int = 3):
    """
    Returns a live psycopg2 connection to PostgreSQL using DATABASE_URL.
    Raises psycopg2.Error on failure.
    """
    if not DATABASE_URL:
        raise ValueError("DATABASE_URL is not configured.")
    return psycopg2.connect(DATABASE_URL, connect_timeout=timeout)


def init_db() -> bool:
    """
    Initializes PostgreSQL tables if DATABASE_URL is configured.
    Gracefully falls back if database is not reachable.
    """
    global _db_initialized, _db_available, _db_status_message

    if not DATABASE_URL:
        _db_available = False
        _db_initialized = True
        _db_status_message = "in_memory (no DATABASE_URL configured)"
        logger.info("No DATABASE_URL configured. ScamQuest running with in-memory session storage.")
        return False

    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    CREATE TABLE IF NOT EXISTS game_sessions (
                        session_id VARCHAR(64) PRIMARY KEY,
                        persona VARCHAR(64) NOT NULL,
                        language VARCHAR(32) NOT NULL,
                        total_days INTEGER NOT NULL DEFAULT 30,
                        initial_difficulty VARCHAR(32) NOT NULL DEFAULT 'EASY',
                        current_day INTEGER NOT NULL DEFAULT 1,
                        balance INTEGER NOT NULL DEFAULT 50000,
                        investments INTEGER NOT NULL DEFAULT 0,
                        score INTEGER NOT NULL DEFAULT 0,
                        streak INTEGER NOT NULL DEFAULT 0,
                        max_streak INTEGER NOT NULL DEFAULT 0,
                        money_protected INTEGER NOT NULL DEFAULT 0,
                        money_lost INTEGER NOT NULL DEFAULT 0,
                        is_current_scenario_answered BOOLEAN NOT NULL DEFAULT FALSE,
                        is_completed BOOLEAN NOT NULL DEFAULT FALSE,
                        current_scenario JSONB,
                        last_answer_result JSONB,
                        applied_expense_days JSONB,
                        seen_message_texts JSONB,
                        scenarios_history JSONB,
                        mistakes_by_category JSONB,
                        category_counts JSONB,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                    );

                    CREATE TABLE IF NOT EXISTS game_transactions (
                        id VARCHAR(64) PRIMARY KEY,
                        session_id VARCHAR(64) NOT NULL REFERENCES game_sessions(session_id) ON DELETE CASCADE,
                        day INTEGER NOT NULL,
                        title VARCHAR(255) NOT NULL,
                        amount INTEGER NOT NULL,
                        balance_after INTEGER NOT NULL,
                        category VARCHAR(64) NOT NULL,
                        description TEXT,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                    );

                    CREATE INDEX IF NOT EXISTS idx_transactions_session_id ON game_transactions(session_id);
                    """
                )
            conn.commit()

        _db_available = True
        _db_initialized = True
        _db_status_message = "connected (postgresql)"
        logger.info("PostgreSQL database initialized successfully.")
        return True

    except Exception as exc:
        _db_available = False
        _db_initialized = True
        _db_status_message = f"failed (postgresql connection error: {exc.__class__.__name__})"
        logger.error(
            "CRITICAL: Failed to connect to configured PostgreSQL database (%s: %s).",
            exc.__class__.__name__,
            exc,
        )
        return False


def is_db_available() -> bool:
    """Check if database is connected and initialized."""
    global _db_initialized
    if not _db_initialized:
        init_db()
    return _db_available


def get_db_status() -> str:
    """Return human-readable database connectivity status."""
    global _db_initialized, _db_status_message
    if not _db_initialized:
        init_db()
    return _db_status_message


def save_session_to_db(session_dict: Dict[str, Any], transactions: List[Dict[str, Any]]) -> bool:
    """
    Upserts game session state and appends new transactions to PostgreSQL.
    Returns True if saved, False if skipped/failed.
    """
    if not is_db_available():
        if DATABASE_URL:
            logger.error("CRITICAL: Database write skipped because PostgreSQL is configured but unavailable.")
        return False

    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                # Upsert session
                cur.execute(
                    """
                    INSERT INTO game_sessions (
                        session_id, persona, language, total_days, initial_difficulty,
                        current_day, balance, investments, score, streak, max_streak,
                        money_protected, money_lost, is_current_scenario_answered, is_completed,
                        current_scenario, last_answer_result, applied_expense_days,
                        seen_message_texts, scenarios_history, mistakes_by_category, category_counts,
                        updated_at
                    ) VALUES (
                        %(session_id)s, %(persona)s, %(language)s, %(total_days)s, %(initial_difficulty)s,
                        %(current_day)s, %(balance)s, %(investments)s, %(score)s, %(streak)s, %(max_streak)s,
                        %(money_protected)s, %(money_lost)s, %(is_current_scenario_answered)s, %(is_completed)s,
                        %(current_scenario)s, %(last_answer_result)s, %(applied_expense_days)s,
                        %(seen_message_texts)s, %(scenarios_history)s, %(mistakes_by_category)s, %(category_counts)s,
                        CURRENT_TIMESTAMP
                    )
                    ON CONFLICT (session_id) DO UPDATE SET
                        persona = EXCLUDED.persona,
                        language = EXCLUDED.language,
                        total_days = EXCLUDED.total_days,
                        initial_difficulty = EXCLUDED.initial_difficulty,
                        current_day = EXCLUDED.current_day,
                        balance = EXCLUDED.balance,
                        investments = EXCLUDED.investments,
                        score = EXCLUDED.score,
                        streak = EXCLUDED.streak,
                        max_streak = EXCLUDED.max_streak,
                        money_protected = EXCLUDED.money_protected,
                        money_lost = EXCLUDED.money_lost,
                        is_current_scenario_answered = EXCLUDED.is_current_scenario_answered,
                        is_completed = EXCLUDED.is_completed,
                        current_scenario = EXCLUDED.current_scenario,
                        last_answer_result = EXCLUDED.last_answer_result,
                        applied_expense_days = EXCLUDED.applied_expense_days,
                        seen_message_texts = EXCLUDED.seen_message_texts,
                        scenarios_history = EXCLUDED.scenarios_history,
                        mistakes_by_category = EXCLUDED.mistakes_by_category,
                        category_counts = EXCLUDED.category_counts,
                        updated_at = CURRENT_TIMESTAMP;
                    """,
                    {
                        "session_id": session_dict["session_id"],
                        "persona": session_dict["persona"],
                        "language": session_dict["language"],
                        "total_days": session_dict["total_days"],
                        "initial_difficulty": session_dict["initial_difficulty"],
                        "current_day": session_dict["current_day"],
                        "balance": session_dict["balance"],
                        "investments": session_dict["investments"],
                        "score": session_dict["score"],
                        "streak": session_dict["streak"],
                        "max_streak": session_dict["max_streak"],
                        "money_protected": session_dict["money_protected"],
                        "money_lost": session_dict["money_lost"],
                        "is_current_scenario_answered": session_dict["is_current_scenario_answered"],
                        "is_completed": session_dict["is_completed"],
                        "current_scenario": json.dumps(session_dict.get("current_scenario")),
                        "last_answer_result": json.dumps(session_dict.get("last_answer_result")),
                        "applied_expense_days": json.dumps(session_dict.get("applied_expense_days", [])),
                        "seen_message_texts": json.dumps(session_dict.get("seen_message_texts", [])),
                        "scenarios_history": json.dumps(session_dict.get("scenarios_history", [])),
                        "mistakes_by_category": json.dumps(session_dict.get("mistakes_by_category", {})),
                        "category_counts": json.dumps(session_dict.get("category_counts", {})),
                    },
                )

                # Insert transactions
                for tx in transactions:
                    cur.execute(
                        """
                        INSERT INTO game_transactions (
                            id, session_id, day, title, amount, balance_after, category, description
                        ) VALUES (
                            %(id)s, %(session_id)s, %(day)s, %(title)s, %(amount)s, %(balance_after)s, %(category)s, %(description)s
                        )
                        ON CONFLICT (id) DO NOTHING;
                        """,
                        {
                            "id": tx["id"],
                            "session_id": session_dict["session_id"],
                            "day": tx["day"],
                            "title": tx["title"],
                            "amount": tx["amount"],
                            "balance_after": tx["balance_after"],
                            "category": tx["category"],
                            "description": tx.get("description", ""),
                        },
                    )

            conn.commit()
            return True

    except Exception as exc:
        logger.warning("Failed to save session to PostgreSQL: %s", exc)
        return False


def load_session_from_db(session_id: str) -> Optional[Tuple[Dict[str, Any], List[Dict[str, Any]]]]:
    """
    Loads session state and transaction history from PostgreSQL.
    Returns (session_dict, transactions_list) or None.
    """
    if not is_db_available():
        if DATABASE_URL:
            logger.error("CRITICAL: Database read skipped because PostgreSQL is configured but unavailable.")
        return None

    try:
        with get_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    "SELECT * FROM game_sessions WHERE session_id = %s;",
                    (session_id,),
                )
                session_row = cur.fetchone()
                if not session_row:
                    return None

                cur.execute(
                    "SELECT * FROM game_transactions WHERE session_id = %s ORDER BY day ASC, created_at ASC;",
                    (session_id,),
                )
                tx_rows = cur.fetchall()

        session_dict = dict(session_row)
        # Parse JSON fields if returned as string or already decoded
        for field in [
            "current_scenario",
            "last_answer_result",
            "applied_expense_days",
            "seen_message_texts",
            "scenarios_history",
            "mistakes_by_category",
            "category_counts",
        ]:
            val = session_dict.get(field)
            if isinstance(val, str):
                try:
                    session_dict[field] = json.loads(val)
                except Exception:
                    session_dict[field] = None

        transactions = [dict(tx) for tx in tx_rows]
        return session_dict, transactions

    except Exception as exc:
        logger.warning("Failed to load session %s from PostgreSQL: %s", session_id, exc)
        return None
