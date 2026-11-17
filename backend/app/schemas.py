from enum import Enum
from typing import Dict, List, Optional
from pydantic import BaseModel, Field, field_validator, model_validator


class ScamType(str, Enum):
    # Scam categories
    FAKE_KYC = "FAKE_KYC"
    UPI_COLLECT = "UPI_COLLECT"
    WRONG_PAYMENT_REFUND = "WRONG_PAYMENT_REFUND"
    JOB_OFFER_SCAM = "JOB_OFFER_SCAM"
    LOTTERY_PRIZE = "LOTTERY_PRIZE"
    ELECTRICITY_DISCONNECT = "ELECTRICITY_DISCONNECT"
    PHISHING_LINK = "PHISHING_LINK"
    FAKE_CUSTOMER_SUPPORT = "FAKE_CUSTOMER_SUPPORT"
    QR_CODE_SCAM = "QR_CODE_SCAM"
    REMOTE_ACCESS_APP = "REMOTE_ACCESS_APP"
    IMPERSONATION = "IMPERSONATION"
    INVESTMENT_SCAM = "INVESTMENT_SCAM"
    
    # Safe everyday notifications
    SAFE_TRANSACTION = "SAFE_TRANSACTION"
    SAFE_BILL_PAYMENT = "SAFE_BILL_PAYMENT"
    SAFE_SALARY_CREDIT = "SAFE_SALARY_CREDIT"
    SAFE_PEER_TRANSFER = "SAFE_PEER_TRANSFER"


class DifficultyLevel(str, Enum):
    EASY = "EASY"
    MEDIUM = "MEDIUM"
    HARD = "HARD"


class PlayerPersona(str, Enum):
    COLLEGE_STUDENT = "COLLEGE_STUDENT"
    SHOPKEEPER = "SHOPKEEPER"
    WORKING_PROFESSIONAL = "WORKING_PROFESSIONAL"
    SENIOR_CITIZEN = "SENIOR_CITIZEN"


class MessageLanguage(str, Enum):
    ENGLISH = "ENGLISH"
    HINDI = "HINDI"
    HINGLISH = "HINGLISH"


class ScanVerdict(str, Enum):
    """
    Scan verdicts. Per requirement: Never classify a message as verified legitimate
    merely because no suspicious indicators were found.
    """
    DANGER_HIGH_CONFIDENCE = "DANGER_HIGH_CONFIDENCE"
    SUSPICIOUS_PROCEED_WITH_CAUTION = "SUSPICIOUS_PROCEED_WITH_CAUTION"
    UNVERIFIED_LOW_RISK = "UNVERIFIED_LOW_RISK"


# -------------------------------------------------------------
# 1. Scenario Generation Model
# -------------------------------------------------------------
class ScenarioResponse(BaseModel):
    """
    Strict response schema for scenario generation.
    Note: Game economics (scores, deductions, rewards, balances) are NEVER
    decided by Gemini. claimed_amount is solely for text immersion.
    """
    message_text: str = Field(..., min_length=10, max_length=1000, description="Exact SMS or notification text shown on the phone.")
    sender_id: str = Field(..., min_length=3, max_length=30, description="Sender header like AX-HDFCBK, +919876543210, or QP-PAYTM.")
    is_scam: bool = Field(..., description="True if scam message, False if safe notification.")
    scam_type: ScamType = Field(..., description="Categorization of the message.")
    language: MessageLanguage = Field(..., description="Language of the scenario text.")
    difficulty: DifficultyLevel = Field(..., description="Difficulty level.")
    persona: PlayerPersona = Field(..., description="Target demographic persona.")
    context_title: str = Field(..., min_length=3, max_length=60, description="Short 2-5 word label like 'Electricity Bill Alert' or 'UPI Money Request'.")
    red_flags: List[str] = Field(default_factory=list, description="2-4 specific red flags if scam, or safety indicators if genuine.")
    safe_action: str = Field(..., min_length=5, max_length=300, description="The safe real-world action the citizen should take.")
    claimed_amount: Optional[int] = Field(default=None, ge=0, description="Nominal monetary amount mentioned in message, for UI immersion only.")

    @model_validator(mode="after")
    def validate_scam_alignment(self):
        safe_types = {
            ScamType.SAFE_TRANSACTION,
            ScamType.SAFE_BILL_PAYMENT,
            ScamType.SAFE_SALARY_CREDIT,
            ScamType.SAFE_PEER_TRANSFER,
        }
        if self.is_scam and self.scam_type in safe_types:
            raise ValueError(f"is_scam is True but scam_type is safe category: {self.scam_type}")
        if not self.is_scam and self.scam_type not in safe_types:
            raise ValueError(f"is_scam is False but scam_type is scam category: {self.scam_type}")
        return self


# -------------------------------------------------------------
# 2. Red-Flag Explainer Model
# -------------------------------------------------------------
class ExplanationResponse(BaseModel):
    """
    Strict response schema for red-flag breakdown after player answer.
    """
    verdict_title: str = Field(..., min_length=3, max_length=80, description="Punchy verdict heading, e.g. 'UPI Collect Trap Avoided!'")
    explanation: str = Field(..., min_length=20, max_length=600, description="Simple non-technical explanation of why this was scam/safe.")
    technical_clues: List[str] = Field(..., min_length=1, max_length=5, description="Specific giveaways like lookalike domain, fake urgency, or APK.")
    pro_tip: str = Field(..., min_length=10, max_length=250, description="One memorable golden rule for real-life protection.")


# -------------------------------------------------------------
# 3. Scan Mode Response Model
# -------------------------------------------------------------
class ScanResultResponse(BaseModel):
    """
    Output model for Scan Mode combining deterministic rules + Gemini analysis.
    """
    risk_score: int = Field(..., ge=0, le=100, description="Fraud risk score between 0 and 100.")
    verdict: ScanVerdict = Field(..., description="High risk, suspicious caution, or unverified low risk.")
    scam_category: ScamType = Field(..., description="Primary category detected.")
    detected_tactics: List[str] = Field(default_factory=list, description="Psychological or social engineering tactics detected.")
    rule_flags: List[str] = Field(default_factory=list, description="Heuristic indicators triggered by deterministic checks.")
    explanation: str = Field(..., min_length=20, max_length=800, description="Plain language breakdown for the user.")
    actionable_steps: List[str] = Field(..., min_length=1, max_length=5, description="Next steps (e.g. 'Do not click links', 'Call 1930').")
    disclaimer: str = Field(
        default="AI scan is advisory only. Absence of flags does not guarantee safety. When in doubt, verify via official bank apps or call 1930.",
        description="Mandatory advisory notice."
    )

    @field_validator("verdict")
    @classmethod
    def ensure_no_guarantee_of_safety(cls, v: ScanVerdict):
        if v not in (ScanVerdict.DANGER_HIGH_CONFIDENCE, ScanVerdict.SUSPICIOUS_PROCEED_WITH_CAUTION, ScanVerdict.UNVERIFIED_LOW_RISK):
            raise ValueError("Scan verdict cannot guarantee legitimacy.")
        return v


# -------------------------------------------------------------
# 4. Month-End AI Coaching Model
# -------------------------------------------------------------
class CoachReportResponse(BaseModel):
    """
    Personalized month-end review generated from the player's run.
    """
    grade: str = Field(..., min_length=1, max_length=30, description="Grade or persona rating, e.g. 'Cyber Guardian', 'Vulnerable to Urgency'.")
    summary: str = Field(..., min_length=20, max_length=600, description="Casual, encouraging financial coach summary of player run.")
    top_vulnerabilities: List[str] = Field(default_factory=list, description="Specific fraud techniques the player fell for.")
    strengths: List[str] = Field(default_factory=list, description="Techniques the player identified successfully.")
    actionable_tips: List[str] = Field(..., min_length=1, max_length=4, description="Targeted real-world defense habits.")


# -------------------------------------------------------------
# Request Models (Input DTOs)
# -------------------------------------------------------------
class ScenarioGenerateRequest(BaseModel):
    persona: PlayerPersona = PlayerPersona.COLLEGE_STUDENT
    difficulty: DifficultyLevel = DifficultyLevel.EASY
    language: MessageLanguage = MessageLanguage.HINGLISH
    focus_scam_type: Optional[ScamType] = None
    force_scam: Optional[bool] = None  # None = random choice, True = scam, False = safe


class ExplanationRequest(BaseModel):
    message_text: str = Field(..., max_length=1000)
    is_scam: bool
    scam_type: ScamType
    player_tapped_scam: bool
    is_correct: bool


class ScanRequest(BaseModel):
    message_text: str = Field(..., min_length=5, max_length=1000, description="User submitted message, truncated and untrusted.")


class CoachReportRequest(BaseModel):
    persona: PlayerPersona
    total_rounds: int = Field(..., ge=1)
    correct_identifications: int = Field(..., ge=0)
    scams_fallen_for: List[ScamType] = Field(default_factory=list)
    safe_mistaken_as_scams: List[str] = Field(default_factory=list)
    final_balance: int  # Deterministically computed by backend game engine
    streak_record: int = Field(default=0, ge=0)


# =============================================================
# Step 4: Game Engine DTOs & Public Client Models
# =============================================================

class PublicScenarioCard(BaseModel):
    """
    Scenario presented to the user BEFORE answering.
    Ground truth (is_scam, red_flags, safe_action) is withheld to prevent cheating.
    """
    message_text: str
    sender_id: str
    context_title: str
    language: MessageLanguage
    difficulty: DifficultyLevel
    claimed_amount: Optional[int] = None


class TransactionRecord(BaseModel):
    """
    Deterministic ledger entry for player's financial history.
    """
    id: str
    day: int
    title: str
    amount: int  # Positive for credit, negative for debit
    balance_after: int
    category: str  # "SALARY", "ROUTINE_EXPENSE", "SCAM_PENALTY", "SIP_INVESTMENT"
    description: str


class GameStartRequest(BaseModel):
    persona: PlayerPersona = PlayerPersona.COLLEGE_STUDENT
    language: MessageLanguage = MessageLanguage.HINGLISH
    total_days: int = Field(default=30, ge=5, le=30, description="Simulated days in the month (default 30).")
    initial_difficulty: Optional[DifficultyLevel] = Field(default=DifficultyLevel.EASY, description="Initial starting difficulty (adaptive system adjusts during run).")


class PlayerAnswerRequest(BaseModel):
    choice: str = Field(..., description="'SCAM' or 'SAFE'")

    @field_validator("choice")
    @classmethod
    def validate_choice(cls, v: str):
        normalized = v.strip().upper()
        if normalized not in ("SCAM", "SAFE"):
            raise ValueError("Choice must be either 'SCAM' or 'SAFE'.")
        return normalized


class PlayerAnswerResponse(BaseModel):
    is_correct: bool
    was_scam: bool
    scam_type: ScamType
    score_change: int
    financial_impact: int  # Negative deduction if fallen for scam, 0 otherwise
    money_protected: int   # Fictional amount protected by spotting a scam
    current_balance: int
    current_score: int
    current_streak: int
    max_streak: int
    day: int
    explanation: ExplanationResponse
    red_flags: List[str]
    safe_action: str
    is_month_complete: bool


class RoutineExpenseNotice(BaseModel):
    day: int
    title: str
    amount: int
    description: str


class GameSessionPublicState(BaseModel):
    session_id: str
    persona: PlayerPersona
    language: MessageLanguage
    current_day: int
    total_days: int
    balance: int = Field(..., description="Available liquid cash balance in INR.")
    investments: int = Field(default=0, description="Simulated wealth allocated to SIP investments.")
    net_worth: int = Field(..., description="Total net worth (cash balance + investments).")
    score: int
    streak: int
    max_streak: int
    money_protected: int
    money_lost: int
    is_current_scenario_answered: bool
    current_scenario: Optional[PublicScenarioCard] = None
    last_answer_result: Optional[PlayerAnswerResponse] = None
    new_routine_expenses: List[RoutineExpenseNotice] = Field(default_factory=list)
    is_completed: bool
    transactions_count: int


class CategoryStat(BaseModel):
    scam_type: ScamType
    times_encountered: int
    correctly_identified: int
    mistakes: int
    accuracy_percentage: float


class MonthEndReportResponse(BaseModel):
    session_id: str
    persona: PlayerPersona
    starting_balance: int
    final_balance: int = Field(..., description="Remaining liquid cash balance in INR.")
    investments_balance: int = Field(default=0, description="Accumulated simulated SIP investment allocations.")
    net_worth: int = Field(..., description="Final net worth (cash balance + investment portfolio).")
    total_routine_expenses: int = Field(..., description="Total routine consumption expenses (rent, groceries, utilities).")
    money_protected: int
    money_lost: int
    total_scenarios_faced: int
    correct_decisions: int
    overall_accuracy_percentage: float
    max_streak: int
    survival_score: int  # 0-100 composite index
    category_breakdown: List[CategoryStat]
    achievements: List[str]
    ai_coach_report: CoachReportResponse
    transactions: List[TransactionRecord]
