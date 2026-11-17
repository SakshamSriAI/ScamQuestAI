import logging
import re
import uuid
from datetime import datetime
from typing import Dict, List, Optional, Set

from backend.app.ai_service import AIService
from backend.app.db import load_session_from_db, save_session_to_db
from backend.app.schemas import (
    CategoryStat,
    CoachReportRequest,
    DifficultyLevel,
    ExplanationRequest,
    GameSessionPublicState,
    GameStartRequest,
    MessageLanguage,
    MonthEndReportResponse,
    PlayerAnswerResponse,
    PlayerPersona,
    PublicScenarioCard,
    RoutineExpenseNotice,
    ScenarioGenerateRequest,
    ScenarioResponse,
    ScamType,
    TransactionRecord,
)

logger = logging.getLogger("scamquest.game_engine")

STARTING_SALARY = 50000

# Normal financial life expenses spread across a 30-day month
ROUTINE_EXPENSES: Dict[int, dict] = {
    3: {
        "title": "Apartment Rent",
        "amount": 12000,
        "description": "Monthly house rent auto-debited via netbanking.",
        "category": "ROUTINE_EXPENSE",
    },
    7: {
        "title": "Nifty 50 Index SIP",
        "amount": 5000,
        "description": "Simulated Systematic Investment Plan allocated to wealth-building portfolio.",
        "category": "SIP_INVESTMENT",
    },
    12: {
        "title": "Grocery & Supermarket",
        "amount": 3500,
        "description": "Monthly pantry restocking and household provisions.",
        "category": "ROUTINE_EXPENSE",
    },
    16: {
        "title": "State Electricity Bill",
        "amount": 1200,
        "description": "Genuine monthly electricity bill paid via official discom portal.",
        "category": "ROUTINE_EXPENSE",
    },
    20: {
        "title": "Broadband & Mobile Recharge",
        "amount": 800,
        "description": "High-speed fiber internet and phone plan renewal.",
        "category": "ROUTINE_EXPENSE",
    },
    25: {
        "title": "Dining & Leisure",
        "amount": 1500,
        "description": "Weekend restaurant dinner and streaming subscriptions.",
        "category": "ROUTINE_EXPENSE",
    },
}


def sanitize_context_title(title: str) -> str:
    """
    Strips evaluative giveaway words (Fake, Scam, Phishing, Trap, Fraud)
    from context_title so public cards cannot leak ground truth to players.
    """
    words_to_strip = [
        "fake", "scam", "phishing", "trap", "fraud", "malicious", "spoof", "spoofed", "extortion"
    ]
    pattern = re.compile(r"\b(" + "|".join(words_to_strip) + r")\b", re.IGNORECASE)
    cleaned = pattern.sub("", title)
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return cleaned if len(cleaned) >= 3 else "Financial Alert"


class GameSession:
    def __init__(
        self,
        session_id: str,
        persona: PlayerPersona = PlayerPersona.COLLEGE_STUDENT,
        language: MessageLanguage = MessageLanguage.HINGLISH,
        total_days: int = 30,
        initial_difficulty: DifficultyLevel = DifficultyLevel.EASY,
    ):
        self.session_id = session_id
        self.persona = persona
        self.language = language
        self.total_days = total_days
        self.initial_difficulty = initial_difficulty

        self.current_day: int = 1
        self.balance: int = STARTING_SALARY       # Liquid cash
        self.investments: int = 0                  # Accumulated SIP portfolio
        self.score: int = 0
        self.streak: int = 0
        self.max_streak: int = 0
        self.money_protected: int = 0
        self.money_lost: int = 0

        self.current_scenario: Optional[ScenarioResponse] = None
        self.is_current_scenario_answered: bool = False
        self.last_answer_result: Optional[PlayerAnswerResponse] = None
        self.is_completed: bool = False

        self.applied_expense_days: Set[int] = set()
        self.seen_message_texts: Set[str] = set()
        self.scenarios_history: List[dict] = []
        self.transactions: List[TransactionRecord] = []
        self.mistakes_by_category: Dict[str, int] = {}
        self.category_counts: Dict[str, dict] = {}

        # Record starting salary
        self._record_transaction(
            day=1,
            title="Monthly Salary Credit",
            amount=STARTING_SALARY,
            category="SALARY",
            description=f"Initial fictional salary credited for {persona.value}.",
        )

    @property
    def net_worth(self) -> int:
        """Total financial worth: available cash balance + accumulated investments."""
        return self.balance + self.investments

    def _record_transaction(self, day: int, title: str, amount: int, category: str, description: str):
        record = TransactionRecord(
            id=f"tx_{len(self.transactions) + 1}_{uuid.uuid4().hex[:6]}",
            day=day,
            title=title,
            amount=amount,
            balance_after=self.balance,
            category=category,
            description=description,
        )
        self.transactions.append(record)

    def to_public_state(self, new_expenses: Optional[List[RoutineExpenseNotice]] = None) -> GameSessionPublicState:
        public_card = None
        if self.current_scenario:
            # Strip giveaway keywords to prevent accidental disclosure before answer
            sanitized_title = sanitize_context_title(self.current_scenario.context_title)
            public_card = PublicScenarioCard(
                message_text=self.current_scenario.message_text,
                sender_id=self.current_scenario.sender_id,
                context_title=sanitized_title,
                language=self.current_scenario.language,
                difficulty=self.current_scenario.difficulty,
                claimed_amount=self.current_scenario.claimed_amount,
            )

        return GameSessionPublicState(
            session_id=self.session_id,
            persona=self.persona,
            language=self.language,
            current_day=self.current_day,
            total_days=self.total_days,
            balance=self.balance,
            investments=self.investments,
            net_worth=self.net_worth,
            score=self.score,
            streak=self.streak,
            max_streak=self.max_streak,
            money_protected=self.money_protected,
            money_lost=self.money_lost,
            is_current_scenario_answered=self.is_current_scenario_answered,
            current_scenario=public_card,
            # Reveal last_answer_result only when answered to prevent confusion
            last_answer_result=self.last_answer_result if self.is_current_scenario_answered else None,
            new_routine_expenses=new_expenses or [],
            is_completed=self.is_completed,
            transactions_count=len(self.transactions),
        )

    def to_state_dict(self) -> dict:
        return {
            "session_id": self.session_id,
            "persona": self.persona.value if hasattr(self.persona, "value") else str(self.persona),
            "language": self.language.value if hasattr(self.language, "value") else str(self.language),
            "total_days": self.total_days,
            "initial_difficulty": self.initial_difficulty.value if hasattr(self.initial_difficulty, "value") else str(self.initial_difficulty),
            "current_day": self.current_day,
            "balance": self.balance,
            "investments": self.investments,
            "score": self.score,
            "streak": self.streak,
            "max_streak": self.max_streak,
            "money_protected": self.money_protected,
            "money_lost": self.money_lost,
            "is_current_scenario_answered": self.is_current_scenario_answered,
            "is_completed": self.is_completed,
            "current_scenario": self.current_scenario.model_dump() if self.current_scenario else None,
            "last_answer_result": self.last_answer_result.model_dump() if self.last_answer_result else None,
            "applied_expense_days": list(self.applied_expense_days),
            "seen_message_texts": list(self.seen_message_texts),
            "scenarios_history": self.scenarios_history,
            "mistakes_by_category": self.mistakes_by_category,
            "category_counts": self.category_counts,
        }

    def get_serialized_transactions(self) -> List[dict]:
        return [tx.model_dump() for tx in self.transactions]

    @classmethod
    def from_state_dict(cls, data: dict, transactions: List[dict]) -> "GameSession":
        session = cls.__new__(cls)
        session.session_id = data["session_id"]
        session.persona = PlayerPersona(data["persona"])
        session.language = MessageLanguage(data["language"])
        session.total_days = data["total_days"]
        session.initial_difficulty = DifficultyLevel(data["initial_difficulty"])
        session.current_day = data["current_day"]
        session.balance = data["balance"]
        session.investments = data.get("investments", 0)
        session.score = data["score"]
        session.streak = data["streak"]
        session.max_streak = data["max_streak"]
        session.money_protected = data["money_protected"]
        session.money_lost = data["money_lost"]
        session.is_current_scenario_answered = data["is_current_scenario_answered"]
        session.is_completed = data["is_completed"]

        if data.get("current_scenario"):
            session.current_scenario = ScenarioResponse(**data["current_scenario"])
        else:
            session.current_scenario = None

        if data.get("last_answer_result"):
            session.last_answer_result = PlayerAnswerResponse(**data["last_answer_result"])
        else:
            session.last_answer_result = None

        session.applied_expense_days = set(data.get("applied_expense_days") or [])
        session.seen_message_texts = set(data.get("seen_message_texts") or [])
        session.scenarios_history = data.get("scenarios_history") or []
        session.mistakes_by_category = data.get("mistakes_by_category") or {}
        session.category_counts = data.get("category_counts") or {}
        session.transactions = [
            TransactionRecord(**tx) if isinstance(tx, dict) else tx
            for tx in transactions
        ]
        return session


MAX_ACTIVE_SESSIONS = 1000


class GameEngine:
    """
    Deterministic Game Engine and Session Manager for ScamQuest.
    Ensures zero AI influence over scores, penalties, and wallet balances.
    """

    def __init__(self, ai_service: Optional[AIService] = None):
        self.ai_service = ai_service or AIService()
        self.sessions: Dict[str, GameSession] = {}

    def _persist_session(self, session: GameSession) -> None:
        try:
            save_session_to_db(session.to_state_dict(), session.get_serialized_transactions())
        except Exception as e:
            logger.debug("Database persistence skipped or failed: %s", e)

    def create_session(self, request: GameStartRequest) -> GameSessionPublicState:
        session_id = uuid.uuid4().hex
        session = GameSession(
            session_id=session_id,
            persona=request.persona,
            language=request.language,
            total_days=request.total_days,
            initial_difficulty=request.initial_difficulty or DifficultyLevel.EASY,
        )

        # LRU memory protection: evict oldest session if capacity reached
        if len(self.sessions) >= MAX_ACTIVE_SESSIONS:
            oldest_id = next(iter(self.sessions))
            del self.sessions[oldest_id]

        self.sessions[session_id] = session

        # Automatically roll Day 1 scenario & expenses
        new_expenses = self._apply_scheduled_expenses(session)
        self._generate_next_scenario_for_session(session)

        self._persist_session(session)
        return session.to_public_state(new_expenses=new_expenses)

    def get_session(self, session_id: str) -> Optional[GameSession]:
        session = self.sessions.get(session_id)
        if session:
            return session
        db_res = load_session_from_db(session_id)
        if db_res:
            session_dict, txs = db_res
            session = GameSession.from_state_dict(session_dict, txs)
            self.sessions[session_id] = session
            return session
        return None

    def restart_session(self, session_id: str) -> GameSessionPublicState:
        existing = self.get_session(session_id)
        persona = existing.persona if existing else PlayerPersona.COLLEGE_STUDENT
        language = existing.language if existing else MessageLanguage.HINGLISH
        total_days = existing.total_days if existing else 30
        initial_difficulty = existing.initial_difficulty if existing else DifficultyLevel.EASY

        new_session = GameSession(
            session_id=session_id,
            persona=persona,
            language=language,
            total_days=total_days,
            initial_difficulty=initial_difficulty,
        )
        self.sessions[session_id] = new_session

        new_expenses = self._apply_scheduled_expenses(new_session)
        self._generate_next_scenario_for_session(new_session)

        self._persist_session(new_session)
        return new_session.to_public_state(new_expenses=new_expenses)

    def advance_to_next_scenario(self, session_id: str) -> GameSessionPublicState:
        session = self.get_session(session_id)
        if not session:
            raise KeyError(f"Session {session_id} not found.")

        # If already completed at total_days, stay at Day 30 and return completed state
        if session.is_completed:
            session.current_scenario = None
            self._persist_session(session)
            return session.to_public_state()

        # Strict progression rule: Cannot progress without submitting an answer
        if session.current_scenario and not session.is_current_scenario_answered:
            raise ValueError("Cannot proceed without answering the current scenario.")

        # If current_day is already at total_days and answered, finalize month
        if session.current_day >= session.total_days:
            session.is_completed = True
            session.current_scenario = None
            self._persist_session(session)
            return session.to_public_state()

        # Advance Day (Day 30 is the maximum allowed; never Day 31)
        session.current_day += 1

        # Check & Apply routine financial events (rent, groceries, SIP)
        new_expenses = self._apply_scheduled_expenses(session)

        # Generate fresh scenario with balanced adaptive difficulty
        self._generate_next_scenario_for_session(session)

        self._persist_session(session)
        return session.to_public_state(new_expenses=new_expenses)

    def evaluate_player_answer(self, session_id: str, choice: str) -> PlayerAnswerResponse:
        session = self.get_session(session_id)
        if not session:
            raise KeyError(f"Session {session_id} not found.")

        if not session.current_scenario:
            raise ValueError("No active scenario to answer.")

        # Duplicate answer prevention
        if session.is_current_scenario_answered:
            raise ValueError("Current scenario already answered. Call /next to advance.")

        scenario = session.current_scenario
        player_tapped_scam = (choice.upper() == "SCAM")
        is_correct = (player_tapped_scam == scenario.is_scam)

        # -------------------------------------------------------------
        # Deterministic Scoring & Economics
        # -------------------------------------------------------------
        score_change = 0
        financial_impact = 0
        money_protected = 0

        # Update category tracking
        cat_key = scenario.scam_type.value
        if cat_key not in session.category_counts:
            session.category_counts[cat_key] = {"seen": 0, "correct": 0, "wrong": 0}
        session.category_counts[cat_key]["seen"] += 1

        if is_correct:
            session.category_counts[cat_key]["correct"] += 1
            # Base points + streak multiplier
            score_change = 100 + (session.streak * 25)
            session.score += score_change
            session.streak += 1
            session.max_streak = max(session.max_streak, session.streak)

            if scenario.is_scam:
                # Value of scam avoided
                protected_val = scenario.claimed_amount if (scenario.claimed_amount and scenario.claimed_amount <= 20000) else 5000
                money_protected = protected_val
                session.money_protected += protected_val

                # Record distinct protected transaction
                session._record_transaction(
                    day=session.current_day,
                    title=f"Scam Blocked: {scenario.scam_type.value}",
                    amount=0,
                    category="SCAM_PROTECTED",
                    description=f"Spotted fraud '{sanitize_context_title(scenario.context_title)}'. Protected ₹{protected_val:,} from theft.",
                )
        else:
            session.category_counts[cat_key]["wrong"] += 1
            session.streak = 0  # Reset streak

            if scenario.is_scam and not player_tapped_scam:
                # Player FELL for the scam! Apply simulated penalty.
                session.mistakes_by_category[cat_key] = session.mistakes_by_category.get(cat_key, 0) + 1
                
                # Penalty based on scenario difficulty & type
                base_penalty = {
                    DifficultyLevel.EASY: 2500,
                    DifficultyLevel.MEDIUM: 4500,
                    DifficultyLevel.HARD: 7500,
                }.get(scenario.difficulty, 3000)

                if scenario.claimed_amount and 500 <= scenario.claimed_amount <= 15000:
                    penalty_amount = scenario.claimed_amount
                else:
                    penalty_amount = base_penalty

                # Apply penalty without letting balance go negative
                actual_deduction = min(session.balance, penalty_amount)
                session.balance -= actual_deduction
                financial_impact = -actual_deduction
                session.money_lost += actual_deduction

                # Record distinct simulated loss transaction
                session._record_transaction(
                    day=session.current_day,
                    title=f"Scam Loss: {scenario.scam_type.value}",
                    amount=-actual_deduction,
                    category="SCAM_LOSS",
                    description=f"Fell for '{sanitize_context_title(scenario.context_title)}'. Fictional money lost to fraudster.",
                )
            else:
                # Safe message falsely flagged as scam (False alarm)
                session.mistakes_by_category["FALSE_ALARM"] = session.mistakes_by_category.get("FALSE_ALARM", 0) + 1

        # Mark scenario as answered
        session.is_current_scenario_answered = True

        # Generate red-flag explanation with robust AI failure fallback
        try:
            explanation = self.ai_service.explain_scenario(
                ExplanationRequest(
                    message_text=scenario.message_text,
                    is_scam=scenario.is_scam,
                    scam_type=scenario.scam_type,
                    player_tapped_scam=player_tapped_scam,
                    is_correct=is_correct,
                )
            )
        except Exception as e:
            logger.warning(f"Unexpected error in explain_scenario: {e}. Using deterministic fallback.")
            explanation = self.ai_service._get_fallback_explanation(
                ExplanationRequest(
                    message_text=scenario.message_text,
                    is_scam=scenario.is_scam,
                    scam_type=scenario.scam_type,
                    player_tapped_scam=player_tapped_scam,
                    is_correct=is_correct,
                )
            )

        # Record in scenario history
        session.scenarios_history.append({
            "day": session.current_day,
            "context_title": scenario.context_title,
            "scam_type": scenario.scam_type.value,
            "is_scam": scenario.is_scam,
            "player_choice": choice.upper(),
            "is_correct": is_correct,
            "financial_impact": financial_impact,
        })

        is_month_complete = (session.current_day >= session.total_days)
        if is_month_complete:
            session.is_completed = True

        answer_response = PlayerAnswerResponse(
            is_correct=is_correct,
            was_scam=scenario.is_scam,
            scam_type=scenario.scam_type,
            score_change=score_change,
            financial_impact=financial_impact,
            money_protected=money_protected,
            current_balance=session.balance,
            current_score=session.score,
            current_streak=session.streak,
            max_streak=session.max_streak,
            day=session.current_day,
            explanation=explanation,
            red_flags=scenario.red_flags,
            safe_action=scenario.safe_action,
            is_month_complete=is_month_complete,
        )
        session.last_answer_result = answer_response
        self._persist_session(session)
        return answer_response

    def generate_month_end_report(self, session_id: str) -> MonthEndReportResponse:
        session = self.get_session(session_id)
        if not session:
            raise KeyError(f"Session {session_id} not found.")

        # Final report is unlocked only after completing all days of the month
        if not session.is_completed:
            raise ValueError(
                f"Month is not complete yet. Currently on Day {session.current_day}/{session.total_days}. Complete the final scenario to unlock your report."
            )

        total_scenarios = len(session.scenarios_history)
        correct_count = sum(1 for s in session.scenarios_history if s["is_correct"])
        overall_accuracy = round((correct_count / total_scenarios) * 100, 1) if total_scenarios > 0 else 0.0

        # Category breakdown
        category_stats: List[CategoryStat] = []
        for scam_type_member in ScamType:
            key = scam_type_member.value
            if key in session.category_counts:
                data = session.category_counts[key]
                seen = data["seen"]
                correct = data["correct"]
                acc = round((correct / seen) * 100, 1) if seen > 0 else 0.0
                category_stats.append(
                    CategoryStat(
                        scam_type=scam_type_member,
                        times_encountered=seen,
                        correctly_identified=correct,
                        mistakes=data["wrong"],
                        accuracy_percentage=acc,
                    )
                )

        # Distinguish pure consumption routine expenses from SIP investment allocations
        total_routine_consumption = sum(
            abs(tx.amount) for tx in session.transactions if tx.category == "ROUTINE_EXPENSE"
        )

        # Composite Scam Survival Score (0 - 100)
        # 45% Accuracy + 35% Net Worth Preservation + 20% Streak
        accuracy_component = (overall_accuracy / 100.0) * 45.0
        # Expected baseline net worth without scam losses is ~30,200 (Salary - Routine Consumption)
        wealth_ratio = max(0.0, min(1.0, session.net_worth / 30200))
        wealth_component = wealth_ratio * 35.0
        streak_ratio = min(1.0, session.max_streak / 6.0)
        streak_component = streak_ratio * 20.0
        survival_score = int(round(accuracy_component + wealth_component + streak_component))

        # Achievements
        achievements = []
        if session.balance > 0:
            achievements.append("Survivor: Finished the month without zeroing out your cash balance.")
        if session.net_worth >= 28000:
            achievements.append("Fortress Wallet: Preserved monthly wealth with minimal fraud losses.")
        if session.max_streak >= 3:
            achievements.append("Keen Eye: Sustained a 3+ correct decision streak.")
        if session.max_streak >= 6:
            achievements.append("Scam Hunter: Sustained a 6+ master streak.")
        if overall_accuracy >= 90.0:
            achievements.append("Cyber Sentinel: Maintained 90%+ scam detection accuracy.")
        if session.investments > 0:
            achievements.append("Disciplined Wealth Builder: Successfully funded simulated Index SIP portfolio.")

        # Identify scams fallen for
        scams_fallen = [
            ScamType(s["scam_type"])
            for s in session.scenarios_history
            if s["is_scam"] and not s["is_correct"] and s["scam_type"] in ScamType._value2member_map_
        ]
        safe_mistakes = [
            s["context_title"]
            for s in session.scenarios_history
            if not s["is_scam"] and not s["is_correct"]
        ]

        # Call AI coach with robust fallback
        try:
            coach_report = self.ai_service.generate_coach_report(
                CoachReportRequest(
                    persona=session.persona,
                    total_rounds=total_scenarios if total_scenarios > 0 else 1,
                    correct_identifications=correct_count,
                    scams_fallen_for=scams_fallen,
                    safe_mistaken_as_scams=safe_mistakes,
                    final_balance=session.balance,
                    streak_record=session.max_streak,
                )
            )
        except Exception as e:
            logger.warning(f"Unexpected error in coach_report: {e}. Using deterministic fallback.")
            coach_report = self.ai_service._build_deterministic_coach_fallback(
                CoachReportRequest(
                    persona=session.persona,
                    total_rounds=total_scenarios if total_scenarios > 0 else 1,
                    correct_identifications=correct_count,
                    scams_fallen_for=scams_fallen,
                    safe_mistaken_as_scams=safe_mistakes,
                    final_balance=session.balance,
                    streak_record=session.max_streak,
                )
            )

        return MonthEndReportResponse(
            session_id=session.session_id,
            persona=session.persona,
            starting_balance=STARTING_SALARY,
            final_balance=session.balance,
            investments_balance=session.investments,
            net_worth=session.net_worth,
            total_routine_expenses=total_routine_consumption,
            money_protected=session.money_protected,
            money_lost=session.money_lost,
            total_scenarios_faced=total_scenarios,
            correct_decisions=correct_count,
            overall_accuracy_percentage=overall_accuracy,
            max_streak=session.max_streak,
            survival_score=survival_score,
            category_breakdown=category_stats,
            achievements=achievements,
            ai_coach_report=coach_report,
            transactions=session.transactions,
        )

    # -------------------------------------------------------------
    # Internal Helpers: Adaptive Generation & Scheduled Expenses
    # -------------------------------------------------------------
    def _apply_scheduled_expenses(self, session: GameSession) -> List[RoutineExpenseNotice]:
        """Applies normal financial life events (rent, groceries, SIP) on specific days."""
        notices: List[RoutineExpenseNotice] = []
        day = session.current_day

        if day in ROUTINE_EXPENSES and day not in session.applied_expense_days:
            expense = ROUTINE_EXPENSES[day]
            amount = expense["amount"]
            actual_deduction = min(session.balance, amount)
            session.balance -= actual_deduction

            # If SIP investment, transfer cash to investment portfolio
            if expense["category"] == "SIP_INVESTMENT":
                session.investments += actual_deduction

            session.applied_expense_days.add(day)

            session._record_transaction(
                day=day,
                title=expense["title"],
                amount=-actual_deduction,
                category=expense["category"],
                description=expense["description"],
            )

            notices.append(
                RoutineExpenseNotice(
                    day=day,
                    title=expense["title"],
                    amount=actual_deduction,
                    description=expense["description"],
                )
            )

        return notices

    def _calculate_balanced_difficulty(
        self, session: GameSession, focus_scam_type: Optional[ScamType]
    ) -> DifficultyLevel:
        """
        Holistic difficulty balancing:
        Combines day progression, winning streak, overall accuracy, and targeted category weaknesses.
        Prevents punishing players with HARD scenarios after brief early streaks.
        """
        total_answered = len(session.scenarios_history)
        correct_count = sum(1 for s in session.scenarios_history if s["is_correct"])
        accuracy = (correct_count / total_answered) if total_answered > 0 else 1.0

        # Rule 1: Early game (Days 1 to 4) uses initial_difficulty for onboarding
        if session.current_day <= 4:
            return session.initial_difficulty

        # Rule 2: If targeting a category the player recently failed,
        # keep at EASY or MEDIUM so they can learn to spot the red flags
        if focus_scam_type is not None:
            return DifficultyLevel.MEDIUM if (session.streak >= 3 and accuracy >= 0.70) else DifficultyLevel.EASY

        # Rule 3: Recovery mode — if accuracy is low or player just made a mistake, stay EASY
        if accuracy < 0.60 or session.streak <= 1:
            return DifficultyLevel.EASY

        # Rule 4: HARD requires proven consistency (Day 10+, streak >= 5, AND accuracy >= 80%)
        if session.current_day >= 10 and session.streak >= 5 and accuracy >= 0.80:
            return DifficultyLevel.HARD

        # Rule 5: MEDIUM for steady performers (streak >= 3 and accuracy >= 70%)
        if session.streak >= 3 and accuracy >= 0.70:
            return DifficultyLevel.MEDIUM

        return DifficultyLevel.EASY

    def _generate_next_scenario_for_session(self, session: GameSession):
        """Generates the scenario for current_day using balanced adaptive difficulty."""
        # 1. Adaptive Scam Type (Target weaknesses)
        focus_scam_type: Optional[ScamType] = None
        if session.mistakes_by_category:
            sorted_mistakes = sorted(
                [(k, v) for k, v in session.mistakes_by_category.items() if k in ScamType._value2member_map_],
                key=lambda x: x[1],
                reverse=True,
            )
            if sorted_mistakes:
                focus_scam_type = ScamType(sorted_mistakes[0][0])

        # 2. Balanced Difficulty
        difficulty = self._calculate_balanced_difficulty(session, focus_scam_type)

        # 3. Balanced mixture: roughly 55% scams, 45% safe notifications
        force_scam = None
        if session.current_day % 2 == 1:
            force_scam = True
        elif session.current_day % 4 == 0:
            force_scam = False

        scenario_req = ScenarioGenerateRequest(
            persona=session.persona,
            difficulty=difficulty,
            language=session.language,
            focus_scam_type=focus_scam_type,
            force_scam=force_scam,
        )

        scenario = self.ai_service.generate_scenario(scenario_req)

        # Deduplication check: if seen before, pick another fallback
        retry_count = 0
        while scenario.message_text in session.seen_message_texts and retry_count < 3:
            scenario = self.ai_service._get_fallback_scenario(scenario_req)
            retry_count += 1

        session.seen_message_texts.add(scenario.message_text)
        session.current_scenario = scenario
        session.is_current_scenario_answered = False
