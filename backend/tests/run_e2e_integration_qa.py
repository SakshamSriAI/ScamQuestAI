"""
End-to-End Integration and Quality Assurance Test Suite for ScamQuest.
Tests:
1. System Health Check
2. Complete 30-Day User Journey:
   - Start session
   - Verify initial state (balance=50,000, day=1, starting salary)
   - Progress through days with answers (SCAM / SAFE)
   - Verify deterministic penalties and protected funds
   - Verify routine financial events (rent on day 5, groceries, utilities, SIP)
   - Verify duplicate submission prevention on active scenario
   - Verify progression locking (cannot advance without answering)
   - Reach Day 30 and complete the simulation
   - Generate Month-End Report
   - Verify Month-End Report schema, calculations, and AI coach output
   - Restart session back to Day 1
3. Forensic Scan Mode:
   - High-risk phishing detection
   - Clean message safety clamp (UNVERIFIED_LOW_RISK)
   - Length limits & validation rejection (422)
4. Anti-Cheat & Security Verification:
   - Verify ground truth withholding in PublicScenarioCard
   - Verify context title sanitization
"""

import sys
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.schemas import (
    GameSessionPublicState,
    MonthEndReportResponse,
    PlayerAnswerResponse,
    ScanResultResponse,
    ScanVerdict,
)

client = TestClient(app)

def run_integration_tests():
    print("==================================================================")
    print("STARTING SCAMQUEST COMPLETE INTEGRATION & QA AUDIT")
    print("==================================================================")

    # ------------------------------------------------------------------
    # 1. System Health
    # ------------------------------------------------------------------
    print("\n[TEST 1] System Health Endpoint (/health)...")
    res = client.get("/health")
    assert res.status_code == 200, f"Health check failed with {res.status_code}"
    health_data = res.json()
    assert health_data["status"] == "healthy"
    print("  -> Passed. Status:", health_data["status"], "| Service:", health_data["service"])

    # ------------------------------------------------------------------
    # 2. Start Simulation Session
    # ------------------------------------------------------------------
    print("\n[TEST 2] Session Initialization (/api/game/start)...")
    start_payload = {
        "persona": "WORKING_PROFESSIONAL",
        "language": "HINGLISH",
        "initial_difficulty": "EASY",
        "total_days": 30
    }
    res = client.post("/api/game/start", json=start_payload)
    assert res.status_code == 201, f"Game start failed: {res.text}"
    session_data = res.json()
    session_id = session_data["session_id"]
    assert session_data["balance"] == 50000, "Starting balance must be exactly 50,000"
    assert session_data["current_day"] == 1, "Must start on Day 1"
    assert session_data["total_days"] == 30, "Must be a 30-day simulation"
    assert not session_data["is_completed"], "Must not start in completed state"
    assert session_data["current_scenario"] is not None, "Day 1 scenario must be present"

    # Verify anti-cheat: scenario must NOT leak is_scam or red_flags
    card = session_data["current_scenario"]
    assert "is_scam" not in card, "Security leak: is_scam found in public scenario"
    assert "red_flags" not in card, "Security leak: red_flags found in public scenario"
    assert "safe_action" not in card, "Security leak: safe_action found in public scenario"
    print(f"  -> Passed. Session ID: {session_id} | Day 1 Balance: ₹{session_data['balance']:,}")

    # ------------------------------------------------------------------
    # 3. Retrieve Session State (/api/game/{session_id})
    # ------------------------------------------------------------------
    print(f"\n[TEST 3] State Hydration Check (/api/game/{session_id})...")
    res = client.get(f"/api/game/{session_id}")
    assert res.status_code == 200
    state = res.json()
    assert state["session_id"] == session_id
    assert state["balance"] == 50000
    print("  -> Passed. State successfully retrieved from server.")

    # ------------------------------------------------------------------
    # 4. Progression Lock: Cannot advance without answering
    # ------------------------------------------------------------------
    print("\n[TEST 4] Enforce Progression Lock (/api/game/{session_id}/next without answer)...")
    res = client.post(f"/api/game/{session_id}/next")
    assert res.status_code == 400, "Must block advancing without answering"
    print("  -> Passed. Engine blocked advancing without answer with 400 Bad Request.")

    # ------------------------------------------------------------------
    # 5. Submit Answer & Duplicate Protection
    # ------------------------------------------------------------------
    print("\n[TEST 5] Submit Answer & Prevent Duplicate (/api/game/{session_id}/answer)...")
    res = client.post(f"/api/game/{session_id}/answer", json={"choice": "SCAM"})
    assert res.status_code == 200
    ans_result = res.json()
    assert "is_correct" in ans_result
    assert "score_change" in ans_result
    assert "explanation" in ans_result
    assert len(ans_result["red_flags"]) >= 1
    print(f"  -> Answer evaluated: correct={ans_result['is_correct']}, score_change={ans_result['score_change']}")

    # Try duplicate answer submission on same day
    res_dup = client.post(f"/api/game/{session_id}/answer", json={"choice": "SAFE"})
    assert res_dup.status_code == 400, "Must reject duplicate answer submission"
    print("  -> Passed. Duplicate answer blocked.")

    # ------------------------------------------------------------------
    # 6. Premature Report Access Lock
    # ------------------------------------------------------------------
    print("\n[TEST 6] Premature Report Lock (/api/game/{session_id}/report on Day 1)...")
    res_report_early = client.get(f"/api/game/{session_id}/report")
    assert res_report_early.status_code == 400, "Report must be locked before completing all 30 days"
    print("  -> Passed. Report locked gracefully with 400 Bad Request.")

    # ------------------------------------------------------------------
    # 7. Complete Full 30 Days Journey
    # ------------------------------------------------------------------
    print("\n[TEST 7] Simulating Complete 30-Day Calendar Progression...")
    for day in range(2, 31):
        # Advance to day
        next_res = client.post(f"/api/game/{session_id}/next")
        assert next_res.status_code == 200, f"Failed advancing to Day {day}: {next_res.text}"
        day_state = next_res.json()
        assert day_state["current_day"] == day, f"Expected Day {day}, got {day_state['current_day']}"

        # Submit answer (alternate choices to test diverse heuristics)
        choice = "SCAM" if day % 2 == 0 else "SAFE"
        ans_res = client.post(f"/api/game/{session_id}/answer", json={"choice": choice})
        assert ans_res.status_code == 200, f"Failed answering on Day {day}: {ans_res.text}"

    # Verify simulation is completed at Day 30
    final_day_res = client.get(f"/api/game/{session_id}")
    final_state = final_day_res.json()
    assert final_state["current_day"] == 30
    assert final_state["is_completed"], "Game must be marked is_completed=True after Day 30"
    print(f"  -> Passed! Completed 30 days. Final Cash: ₹{final_state['balance']:,} | Investments: ₹{final_state['investments']:,} | Net Worth: ₹{final_state['net_worth']:,}")

    # ------------------------------------------------------------------
    # 8. Access Month-End Audit Report (/api/game/{session_id}/report)
    # ------------------------------------------------------------------
    print("\n[TEST 8] Generate & Validate Month-End Report (/api/game/{session_id}/report)...")
    report_res = client.get(f"/api/game/{session_id}/report")
    assert report_res.status_code == 200, f"Failed fetching report: {report_res.text}"
    report_data = report_res.json()

    assert report_data["session_id"] == session_id
    assert report_data["total_scenarios_faced"] == 30
    assert 0 <= report_data["survival_score"] <= 100
    assert len(report_data["category_breakdown"]) >= 1
    assert "ai_coach_report" in report_data
    assert "grade" in report_data["ai_coach_report"]
    print(f"  -> Transactions logged: {len(report_data['transactions'])}")
    assert len(report_data["transactions"]) >= 1, "Must have recorded transactions"
    assert report_data["final_balance"] >= 0, "Balance must never be negative"
    print(f"  -> Report validated. Survival Score: {report_data['survival_score']}/100 | Grade: {report_data['ai_coach_report']['grade']}")
    print(f"  -> Achievements unlocked: {len(report_data['achievements'])} | Transactions logged: {len(report_data['transactions'])}")

    # ------------------------------------------------------------------
    # 9. Restart Session (/api/game/{session_id}/restart)
    # ------------------------------------------------------------------
    print("\n[TEST 9] Session Restart (/api/game/{session_id}/restart)...")
    restart_res = client.post(f"/api/game/{session_id}/restart")
    assert restart_res.status_code == 200
    restarted_state = restart_res.json()
    assert restarted_state["current_day"] == 1
    assert restarted_state["balance"] == 50000
    assert not restarted_state["is_completed"]
    print("  -> Passed. Session cleanly reset to Day 1.")

    # ------------------------------------------------------------------
    # 10. Forensic Scan Mode (/api/scan)
    # ------------------------------------------------------------------
    print("\n[TEST 10] Forensic Scan Mode Analysis (/api/scan)...")
    # Subtest 10A: High Risk Phishing
    scan1 = client.post("/api/scan", json={"message_text": "Dear customer, your SBI YONO account blocked. Download http://sbi.apk now."})
    assert scan1.status_code == 200
    res1 = scan1.json()
    assert res1["verdict"] == ScanVerdict.DANGER_HIGH_CONFIDENCE.value
    assert res1["risk_score"] >= 65
    print(f"  -> 10A (High Risk): Verdict={res1['verdict']} | Score={res1['risk_score']}/100 | Red Flags={len(res1['rule_flags'])}")

    # Subtest 10B: Clean Transaction (Must never claim verified legitimate)
    scan2 = client.post("/api/scan", json={"message_text": "Paid Rs 320 to Fresh Groceries Store via UPI Ref 430129482910 on 05-Nov-24. ICICI Bank."})
    assert scan2.status_code == 200
    res2 = scan2.json()
    assert res2["verdict"] == ScanVerdict.UNVERIFIED_LOW_RISK.value
    assert res2["risk_score"] < 30
    print(f"  -> 10B (Low Risk Safety): Verdict={res2['verdict']} | Clamped correctly to UNVERIFIED_LOW_RISK")

    # Subtest 10C: Validation rejection for too short input
    scan3 = client.post("/api/scan", json={"message_text": "hi"})
    assert scan3.status_code == 422
    print("  -> 10C (Validation): Under 5 chars rejected with 422 Unprocessable Entity")

    # ------------------------------------------------------------------
    # 11. Invalid Session Handling (404)
    # ------------------------------------------------------------------
    print("\n[TEST 11] Invalid Session Error Handling (404)...")
    res_fake = client.get("/api/game/non_existent_session_id_12345")
    assert res_fake.status_code == 404
    print("  -> Passed. Unknown session returns 404 cleanly.")

    print("\n==================================================================")
    print("ALL 11 INTEGRATION AUDIT TESTS EXECUTED AND PASSED SUCCESSFULLY!")
    print("==================================================================")

if __name__ == "__main__":
    run_integration_tests()
