from unittest.mock import MagicMock
from backend.app.ai_service import AIService
from backend.app.schemas import (
    CoachReportRequest,
    DifficultyLevel,
    ExplanationRequest,
    MessageLanguage,
    PlayerPersona,
    ScenarioGenerateRequest,
    ScamType,
)


def test_ai_service_fallback_without_api_key():
    service = AIService(api_key="", model="gemini-2.5-flash")
    
    # 1. Test scenario generation fallback
    request = ScenarioGenerateRequest(
        persona=PlayerPersona.COLLEGE_STUDENT,
        difficulty=DifficultyLevel.EASY,
        language=MessageLanguage.ENGLISH,
        force_scam=True,
    )
    scenario = service.generate_scenario(request)
    assert scenario.is_scam is True
    assert scenario.message_text
    assert len(scenario.red_flags) > 0

    # 2. Test force_scam=False fallback
    safe_request = ScenarioGenerateRequest(
        persona=PlayerPersona.COLLEGE_STUDENT,
        difficulty=DifficultyLevel.EASY,
        language=MessageLanguage.ENGLISH,
        force_scam=False,
    )
    safe_scenario = service.generate_scenario(safe_request)
    assert safe_scenario.is_scam is False
    assert safe_scenario.scam_type in {
        ScamType.SAFE_TRANSACTION,
        ScamType.SAFE_BILL_PAYMENT,
        ScamType.SAFE_SALARY_CREDIT,
        ScamType.SAFE_PEER_TRANSFER,
    }


def test_ai_service_explainer_fallback():
    service = AIService(api_key="")
    request = ExplanationRequest(
        message_text="Enter UPI PIN to receive ₹5,000 refund.",
        is_scam=True,
        scam_type=ScamType.UPI_COLLECT,
        player_tapped_scam=True,
        is_correct=True,
    )
    explanation = service.explain_scenario(request)
    assert explanation.verdict_title
    assert "UPI PIN" in explanation.pro_tip
    assert len(explanation.technical_clues) >= 1


def test_ai_service_coach_report_fallback():
    service = AIService(api_key="")
    request = CoachReportRequest(
        persona=PlayerPersona.COLLEGE_STUDENT,
        total_rounds=10,
        correct_identifications=8,
        scams_fallen_for=[ScamType.WRONG_PAYMENT_REFUND],
        safe_mistaken_as_scams=[],
        final_balance=28500,
        streak_record=5,
    )
    report = service.generate_coach_report(request)
    assert "B" in report.grade or "A" in report.grade
    assert "28,500" in report.summary
    assert len(report.actionable_tips) >= 1


def test_ai_service_handles_client_exception_gracefully():
    # Service with mock client that throws an exception
    service = AIService(api_key="mock_key", model="gemini-2.5-flash")
    mock_client = MagicMock()
    mock_client.models.generate_content.side_effect = RuntimeError("API Network Timeout")
    service._client = mock_client

    request = ScenarioGenerateRequest(
        persona=PlayerPersona.SHOPKEEPER,
        difficulty=DifficultyLevel.MEDIUM,
        language=MessageLanguage.HINGLISH,
    )
    # Should NOT raise RuntimeError; must fall back gracefully
    result = service.generate_scenario(request)
    assert result.message_text
    assert result.scam_type
