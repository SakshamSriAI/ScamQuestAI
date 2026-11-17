import pytest
from pydantic import ValidationError
from backend.app.schemas import (
    DifficultyLevel,
    ExplanationResponse,
    MessageLanguage,
    PlayerPersona,
    ScanResultResponse,
    ScanVerdict,
    ScenarioResponse,
    ScamType,
    CoachReportResponse,
)


def test_valid_scenario_response():
    data = {
        "message_text": "Your electricity connection will be disconnected tonight. Call 9876543210.",
        "sender_id": "+919876543210",
        "is_scam": True,
        "scam_type": ScamType.ELECTRICITY_DISCONNECT,
        "language": MessageLanguage.ENGLISH,
        "difficulty": DifficultyLevel.EASY,
        "persona": PlayerPersona.SENIOR_CITIZEN,
        "context_title": "Power Cut Notice",
        "red_flags": ["Personal 10-digit phone sender", "Threatens immediate cut"],
        "safe_action": "Check dues on official discom website.",
        "claimed_amount": 1200,
    }
    model = ScenarioResponse(**data)
    assert model.is_scam is True
    assert model.scam_type == ScamType.ELECTRICITY_DISCONNECT
    assert model.claimed_amount == 1200


def test_invalid_scenario_scam_alignment_mismatch():
    # is_scam=True with safe category must fail
    with pytest.raises(ValidationError):
        ScenarioResponse(
            message_text="Salary credited Rs 50,000 to account *1234.",
            sender_id="AX-HDFCBK",
            is_scam=True,
            scam_type=ScamType.SAFE_SALARY_CREDIT,
            language=MessageLanguage.ENGLISH,
            difficulty=DifficultyLevel.EASY,
            persona=PlayerPersona.COLLEGE_STUDENT,
            context_title="Salary alert",
            red_flags=[],
            safe_action="Verify in mobile app.",
        )

    # is_scam=False with scam category must fail
    with pytest.raises(ValidationError):
        ScenarioResponse(
            message_text="Your bank account is suspended, download sbi.apk now.",
            sender_id="+919876543210",
            is_scam=False,
            scam_type=ScamType.FAKE_KYC,
            language=MessageLanguage.ENGLISH,
            difficulty=DifficultyLevel.EASY,
            persona=PlayerPersona.SENIOR_CITIZEN,
            context_title="KYC Suspended",
            red_flags=["Phishing link"],
            safe_action="Do not download.",
        )


def test_explanation_response_validation():
    data = {
        "verdict_title": "Deceptive UPI Collect Trap",
        "explanation": "The requester attempted to trigger an incoming UPI collect request. Entering a PIN always debits funds.",
        "technical_clues": ["Collect request disguised as refund", "Urgent medical excuse"],
        "pro_tip": "You never enter UPI PIN to receive money.",
    }
    model = ExplanationResponse(**data)
    assert len(model.technical_clues) == 2


def test_scan_result_score_bounds():
    # Valid model
    valid_data = {
        "risk_score": 85,
        "verdict": ScanVerdict.DANGER_HIGH_CONFIDENCE,
        "scam_category": ScamType.PHISHING_LINK,
        "detected_tactics": ["Raw IP", "Urgency"],
        "rule_flags": ["Suspicious IP detected"],
        "explanation": "High fraud probability detected due to suspicious raw IP address.",
        "actionable_steps": ["Do not click the link", "Report to 1930"],
    }
    model = ScanResultResponse(**valid_data)
    assert model.risk_score == 85

    # Out of bounds score (>100) must fail
    invalid_data = valid_data.copy()
    invalid_data["risk_score"] = 105
    with pytest.raises(ValidationError):
        ScanResultResponse(**invalid_data)

    # Negative score must fail
    invalid_data["risk_score"] = -5
    with pytest.raises(ValidationError):
        ScanResultResponse(**invalid_data)


def test_scan_verdict_cannot_guarantee_legitimacy():
    # Verdict must strictly be one of ScanVerdict enum members
    with pytest.raises(ValidationError):
        ScanResultResponse(
            risk_score=0,
            verdict="100%_VERIFIED_LEGITIMATE",  # Invalid enum value
            scam_category=ScamType.SAFE_TRANSACTION,
            detected_tactics=[],
            rule_flags=[],
            explanation="This message is completely safe.",
            actionable_steps=["No action needed"],
        )


def test_coach_report_response_validation():
    data = {
        "grade": "Cyber Guardian",
        "summary": "Great run! You successfully identified 9 out of 10 scams with sharp awareness of UPI collect traps.",
        "top_vulnerabilities": ["Electricity disconnect SMS"],
        "strengths": ["Spotted fake job scams", "Identified valid salary notifications"],
        "actionable_tips": ["Always check electricity dues on the discom app"],
    }
    model = CoachReportResponse(**data)
    assert model.grade == "Cyber Guardian"
