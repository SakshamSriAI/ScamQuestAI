import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.schemas import ScamType

client = TestClient(app)


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["session_storage"] == "in_memory"


def test_start_game_initializes_state():
    payload = {
        "persona": "COLLEGE_STUDENT",
        "language": "HINGLISH",
        "total_days": 30
    }
    response = client.post("/api/game/start", json=payload)
    assert response.status_code == 201
    data = response.json()

    assert "session_id" in data
    assert data["balance"] == 50000
    assert data["score"] == 0
    assert data["streak"] == 0
    assert data["current_day"] == 1
    assert data["total_days"] == 30
    assert data["is_completed"] is False
    assert data["is_current_scenario_answered"] is False
    assert data["current_scenario"] is not None
    assert "message_text" in data["current_scenario"]
    # Ground truth must be hidden in public card before answer
    assert "is_scam" not in data["current_scenario"]


def test_start_game_with_working_professional_and_difficulty():
    payload = {
        "persona": "WORKING_PROFESSIONAL",
        "language": "ENGLISH",
        "initial_difficulty": "MEDIUM",
        "total_days": 30
    }
    response = client.post("/api/game/start", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["persona"] == "WORKING_PROFESSIONAL"
    assert data["balance"] == 50000
    assert data["current_scenario"]["difficulty"] == "MEDIUM"


def test_get_game_state_and_404_handling():
    # Valid session
    start_res = client.post("/api/game/start", json={})
    session_id = start_res.json()["session_id"]

    res = client.get(f"/api/game/{session_id}")
    assert res.status_code == 200
    assert res.json()["session_id"] == session_id

    # Invalid session
    res_404 = client.get("/api/game/non_existent_session_12345")
    assert res_404.status_code == 404
    assert "not found" in res_404.json()["detail"].lower()


def test_scenario_progression_enforces_answer_first():
    start_res = client.post("/api/game/start", json={})
    session_id = start_res.json()["session_id"]

    # Attempting to go to /next before answering must fail with 400
    res = client.post(f"/api/game/{session_id}/next")
    assert res.status_code == 400
    assert "without answering" in res.json()["detail"].lower()


def test_submit_answer_and_duplicate_prevention():
    start_res = client.post("/api/game/start", json={})
    session_id = start_res.json()["session_id"]

    # Submit answer
    answer_res = client.post(f"/api/game/{session_id}/answer", json={"choice": "SCAM"})
    assert answer_res.status_code == 200
    ans_data = answer_res.json()

    assert "is_correct" in ans_data
    assert "was_scam" in ans_data
    assert "explanation" in ans_data
    assert "current_balance" in ans_data
    assert "current_score" in ans_data

    # Submitting again on same scenario must fail with 400
    dup_res = client.post(f"/api/game/{session_id}/answer", json={"choice": "SAFE"})
    assert dup_res.status_code == 400
    assert "already answered" in dup_res.json()["detail"].lower()


def test_balance_and_routine_expenses_progression():
    # Start game
    start_res = client.post("/api/game/start", json={"total_days": 10})
    session_id = start_res.json()["session_id"]
    initial_balance = start_res.json()["balance"]
    assert initial_balance == 50000

    # Answer Day 1
    ans_res = client.post(f"/api/game/{session_id}/answer", json={"choice": "SCAM"})
    day1_balance = ans_res.json()["current_balance"]

    # Advance to Day 2
    day2_res = client.post(f"/api/game/{session_id}/next")
    assert day2_res.status_code == 200
    assert day2_res.json()["current_day"] == 2

    # Answer Day 2
    client.post(f"/api/game/{session_id}/answer", json={"choice": "SAFE"})

    # Advance to Day 3 (Apartment Rent Day: -₹12,000)
    day3_res = client.post(f"/api/game/{session_id}/next")
    assert day3_res.status_code == 200
    data3 = day3_res.json()
    assert data3["current_day"] == 3
    # Check that routine expense was applied and notified
    assert any(exp["title"] == "Apartment Rent" for exp in data3["new_routine_expenses"])
    # Balance should be deducted by at least 12,000
    assert data3["balance"] <= 50000 - 12000


def test_session_isolation():
    # Create session 1
    res1 = client.post("/api/game/start", json={"persona": "COLLEGE_STUDENT"})
    id1 = res1.json()["session_id"]

    # Create session 2
    res2 = client.post("/api/game/start", json={"persona": "SHOPKEEPER"})
    id2 = res2.json()["session_id"]

    assert id1 != id2

    # Answer session 1
    client.post(f"/api/game/{id1}/answer", json={"choice": "SCAM"})

    # State of session 2 must remain completely untouched
    state2 = client.get(f"/api/game/{id2}").json()
    assert state2["is_current_scenario_answered"] is False
    assert state2["persona"] == "SHOPKEEPER"


def test_restart_session():
    start_res = client.post("/api/game/start", json={})
    session_id = start_res.json()["session_id"]

    # Answer and advance
    client.post(f"/api/game/{session_id}/answer", json={"choice": "SCAM"})
    client.post(f"/api/game/{session_id}/next")

    state_before = client.get(f"/api/game/{session_id}").json()
    assert state_before["current_day"] == 2

    # Restart session
    restart_res = client.post(f"/api/game/{session_id}/restart")
    assert restart_res.status_code == 200
    state_after = restart_res.json()

    assert state_after["current_day"] == 1
    assert state_after["balance"] == 50000
    assert state_after["score"] == 0
    assert state_after["streak"] == 0
    assert state_after["is_current_scenario_answered"] is False


def test_month_end_report():
    # Quick 5-day session
    start_res = client.post("/api/game/start", json={"total_days": 5})
    session_id = start_res.json()["session_id"]

    # Play through days 1 to 5
    for _ in range(5):
        client.post(f"/api/game/{session_id}/answer", json={"choice": "SCAM"})
        # Next unless completed
        res = client.post(f"/api/game/{session_id}/next")
        if res.json()["is_completed"]:
            break

    # Get report
    report_res = client.get(f"/api/game/{session_id}/report")
    assert report_res.status_code == 200
    report = report_res.json()

    assert report["session_id"] == session_id
    assert report["starting_balance"] == 50000
    assert "survival_score" in report
    assert 0 <= report["survival_score"] <= 100
    assert "ai_coach_report" in report
    assert "achievements" in report
    assert "transactions" in report
    assert len(report["transactions"]) >= 1


def test_scan_api_endpoint():
    res = client.post("/api/scan", json={"message_text": "Click http://sbi-fake.apk to update PAN immediately."})
    assert res.status_code == 200
    data = res.json()
    assert data["risk_score"] >= 30
    assert data["verdict"] in ("DANGER_HIGH_CONFIDENCE", "SUSPICIOUS_PROCEED_WITH_CAUTION")
    assert len(data["actionable_steps"]) > 0


def test_invalid_endpoints_404():
    bogus = "bogus_id_999"
    assert client.get(f"/api/game/{bogus}").status_code == 404
    assert client.post(f"/api/game/{bogus}/next").status_code == 404
    assert client.post(f"/api/game/{bogus}/answer", json={"choice": "SCAM"}).status_code == 404
    assert client.get(f"/api/game/{bogus}/report").status_code == 404
    assert client.post(f"/api/game/{bogus}/restart").status_code == 404


def test_day_progression_caps_at_30_and_locks_premature_report():
    # 1. Start a 30-day game
    start_res = client.post("/api/game/start", json={"total_days": 30})
    session_id = start_res.json()["session_id"]

    # 2. Premature report request on Day 1 must return 400
    premature_report = client.get(f"/api/game/{session_id}/report")
    assert premature_report.status_code == 400
    assert "not complete yet" in premature_report.json()["detail"].lower()

    # 3. Play through Day 1 to Day 29
    for day in range(1, 30):
        # Answer
        ans_res = client.post(f"/api/game/{session_id}/answer", json={"choice": "SCAM"})
        assert ans_res.status_code == 200
        # Next
        nxt_res = client.post(f"/api/game/{session_id}/next")
        assert nxt_res.status_code == 200

    # We should now be on Day 30
    state_day_30 = client.get(f"/api/game/{session_id}").json()
    assert state_day_30["current_day"] == 30
    assert state_day_30["is_completed"] is False

    # 4. Answer Day 30 (the final day)
    final_ans = client.post(f"/api/game/{session_id}/answer", json={"choice": "SCAM"})
    assert final_ans.status_code == 200
    assert final_ans.json()["is_month_complete"] is True

    # 5. Calling /next after Day 30 must never progress to Day 31
    post_30_res = client.post(f"/api/game/{session_id}/next")
    assert post_30_res.status_code == 200
    post_30_data = post_30_res.json()
    assert post_30_data["current_day"] == 30
    assert post_30_data["is_completed"] is True
    assert post_30_data["current_scenario"] is None

    # 6. Final report should now be unlocked and valid
    unlocked_report = client.get(f"/api/game/{session_id}/report")
    assert unlocked_report.status_code == 200
    rep_data = unlocked_report.json()
    assert rep_data["total_scenarios_faced"] == 30


def test_sip_accounting_and_net_worth_separation():
    # Start 10-day game
    start_res = client.post("/api/game/start", json={"total_days": 10})
    session_id = start_res.json()["session_id"]

    # Play until Day 7 (when Day 7 SIP occurs on Day 6 -> Day 7 advance)
    for _ in range(6):
        client.post(f"/api/game/{session_id}/answer", json={"choice": "SCAM"})
        client.post(f"/api/game/{session_id}/next")

    state_day_7 = client.get(f"/api/game/{session_id}").json()
    assert state_day_7["current_day"] == 7
    # Day 7 SIP: ₹5,000 should be in investments
    assert state_day_7["investments"] == 5000
    # Net worth must equal cash balance + investments
    assert state_day_7["net_worth"] == state_day_7["balance"] + state_day_7["investments"]


def test_scenario_security_sanitizes_giveaways_in_context_title():
    from backend.app.game_engine import sanitize_context_title

    # Obvious scam indicators in raw context titles must be stripped
    assert "fake" not in sanitize_context_title("Fake UPI Wrong Transfer").lower()
    assert "scam" not in sanitize_context_title("500% Guaranteed Return Scam").lower()
    assert "phishing" not in sanitize_context_title("Phishing Link to Raw IP").lower()
    assert "trap" not in sanitize_context_title("Remote Screen Share Trap").lower()

    # Verify public card returned to client omits truth fields
    start_res = client.post("/api/game/start", json={})
    card = start_res.json()["current_scenario"]
    assert "is_scam" not in card
    assert "red_flags" not in card
    assert "safe_action" not in card
    assert "scam_type" not in card


def test_balanced_difficulty_calculation():
    from backend.app.game_engine import GameEngine, GameSession, DifficultyLevel
    from backend.app.schemas import PlayerPersona, MessageLanguage, ScamType

    engine = GameEngine()
    session = GameSession(session_id="test_diff", persona=PlayerPersona.COLLEGE_STUDENT)

    # Day 1 with high streak should still stay EASY for gentle onboarding
    session.current_day = 2
    session.streak = 4
    diff_early = engine._calculate_balanced_difficulty(session, focus_scam_type=None)
    assert diff_early == DifficultyLevel.EASY

    # Day 12 with high streak (>=5) and high accuracy (>=80%) unlocks HARD
    session.current_day = 12
    session.streak = 5
    session.scenarios_history = [{"is_correct": True}] * 10
    diff_hard = engine._calculate_balanced_difficulty(session, focus_scam_type=None)
    assert diff_hard == DifficultyLevel.HARD

    # If targeting a failed category, it must avoid HARD to allow learning
    diff_target = engine._calculate_balanced_difficulty(session, focus_scam_type=ScamType.FAKE_KYC)
    assert diff_target in (DifficultyLevel.EASY, DifficultyLevel.MEDIUM)
    assert diff_target != DifficultyLevel.HARD
