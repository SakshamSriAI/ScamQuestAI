import json
import logging
import random
from pathlib import Path
from typing import List, Optional

from google import genai
from google.genai import types
from pydantic import ValidationError

from backend.app.config import (
    API_TIMEOUT_SECONDS,
    GEMINI_API_KEY,
    GEMINI_MODEL,
    MAX_SCAN_INPUT_LENGTH,
)
from backend.app.prompts import (
    COACH_SYSTEM_PROMPT,
    EXPLAINER_SYSTEM_PROMPT,
    SCAN_SYSTEM_PROMPT,
    SCENARIO_SYSTEM_PROMPT,
    build_coach_user_prompt,
    build_explainer_user_prompt,
    build_scan_user_prompt,
    build_scenario_user_prompt,
)
from backend.app.rule_checker import (
    run_deterministic_rule_checks,
    sanitize_untrusted_input,
)
from backend.app.schemas import (
    CoachReportRequest,
    CoachReportResponse,
    ExplanationRequest,
    ExplanationResponse,
    ScanRequest,
    ScanResultResponse,
    ScanVerdict,
    ScenarioGenerateRequest,
    ScenarioResponse,
    ScamType,
)

logger = logging.getLogger("scamquest.ai_service")

# Load pre-generated offline fallback scenarios
FALLBACK_FILE = Path(__file__).resolve().parent / "fallback_data.json"
FALLBACK_SCENARIOS: List[dict] = []
if FALLBACK_FILE.exists():
    try:
        with open(FALLBACK_FILE, "r", encoding="utf-8") as f:
            FALLBACK_SCENARIOS = json.load(f)
    except Exception as e:
        logger.error(f"Error loading fallback scenarios: {e}")


class AIService:
    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        self.api_key = api_key if api_key is not None else GEMINI_API_KEY
        self.model = model if model is not None else GEMINI_MODEL
        self._client: Optional[genai.Client] = None

        if self.api_key:
            try:
                self._client = genai.Client(api_key=self.api_key)
            except Exception as e:
                logger.warning(f"Could not initialize GenAI Client with provided key: {e}")

    @property
    def client(self) -> Optional[genai.Client]:
        if not self._client and self.api_key:
            try:
                self._client = genai.Client(api_key=self.api_key)
            except Exception as e:
                logger.error(f"Failed to initialize GenAI Client: {e}")
        return self._client

    # -------------------------------------------------------------------------
    # 1. Scenario Generator
    # -------------------------------------------------------------------------
    def generate_scenario(self, request: ScenarioGenerateRequest) -> ScenarioResponse:
        """
        Generates a fresh scam or safe scenario.
        Falls back to curated scenarios if the LLM is unreachable or fails schema validation.
        """
        if self.client:
            prompt = build_scenario_user_prompt(
                persona=request.persona,
                difficulty=request.difficulty,
                language=request.language,
                focus_scam_type=request.focus_scam_type,
                force_scam=request.force_scam,
            )
            config = types.GenerateContentConfig(
                system_instruction=SCENARIO_SYSTEM_PROMPT,
                response_mime_type="application/json",
                response_schema=ScenarioResponse,
                temperature=0.7,
            )
            try:
                response = self.client.models.generate_content(
                    model=self.model,
                    contents=prompt,
                    config=config,
                )
                if response and response.text:
                    parsed = json.loads(response.text)
                    validated = ScenarioResponse(**parsed)
                    return validated
            except (ValidationError, json.JSONDecodeError) as e:
                logger.warning(f"Scenario validation error from Gemini response: {e}. Falling back.")
            except Exception as e:
                logger.warning(f"Gemini API failure during scenario generation: {e}. Falling back.")

        return self._get_fallback_scenario(request)

    def _get_fallback_scenario(self, request: ScenarioGenerateRequest) -> ScenarioResponse:
        """Picks a matching scenario from the fallback dataset."""
        candidates = FALLBACK_SCENARIOS.copy()

        # Filter by force_scam if requested
        if request.force_scam is not None:
            candidates = [c for c in candidates if c["is_scam"] == request.force_scam]

        # Filter by focus_scam_type if requested
        if request.focus_scam_type:
            focused = [c for c in candidates if c.get("scam_type") == request.focus_scam_type.value]
            if focused:
                candidates = focused

        # Filter by difficulty if requested
        if request.difficulty:
            diff_matches = [c for c in candidates if c.get("difficulty") == request.difficulty.value]
            if diff_matches:
                candidates = diff_matches

        # Filter by persona if available
        persona_matches = [c for c in candidates if c.get("persona") == request.persona.value]
        if persona_matches:
            candidates = persona_matches

        selected = random.choice(candidates if candidates else FALLBACK_SCENARIOS).copy()
        if request.difficulty:
            selected["difficulty"] = request.difficulty.value
        return ScenarioResponse(**selected)

    # -------------------------------------------------------------------------
    # 2. Red-Flag Explainer
    # -------------------------------------------------------------------------
    def explain_scenario(self, request: ExplanationRequest) -> ExplanationResponse:
        """
        Generates simple, conversational red-flag breakdown after the user's answer.
        """
        if self.client:
            prompt = build_explainer_user_prompt(
                message_text=request.message_text,
                is_scam=request.is_scam,
                scam_type=request.scam_type,
                player_tapped_scam=request.player_tapped_scam,
                is_correct=request.is_correct,
            )
            config = types.GenerateContentConfig(
                system_instruction=EXPLAINER_SYSTEM_PROMPT,
                response_mime_type="application/json",
                response_schema=ExplanationResponse,
                temperature=0.4,
            )
            try:
                response = self.client.models.generate_content(
                    model=self.model,
                    contents=prompt,
                    config=config,
                )
                if response and response.text:
                    parsed = json.loads(response.text)
                    return ExplanationResponse(**parsed)
            except Exception as e:
                logger.warning(f"Explainer Gemini call failed: {e}. Using deterministic fallback.")

        return self._get_fallback_explanation(request)

    def _get_fallback_explanation(self, request: ExplanationRequest) -> ExplanationResponse:
        """High quality deterministic breakdown when AI is unavailable."""
        if request.is_scam:
            if request.is_correct:
                verdict = "Sharp Eye! Scam Defeated"
                explanation = f"You correctly flagged this {request.scam_type.value} attempt. Fraudsters use urgent threats and lookalike sender names to trigger panic."
            else:
                verdict = "Trapped! This was a Scam"
                explanation = f"This message was a deceptive {request.scam_type.value} scam. Tapping safe or interacting with the link/requester compromises your funds."

            pro_tips = {
                ScamType.UPI_COLLECT: "Remember: Entering UPI PIN ALWAYS deducts money from your account. You NEVER enter a PIN to receive or refund money.",
                ScamType.FAKE_KYC: "Banks NEVER ask you to download .apk files or update KYC through SMS links.",
                ScamType.ELECTRICITY_DISCONNECT: "Power boards never send urgent same-night cutoff messages from personal 10-digit mobile numbers.",
                ScamType.REMOTE_ACCESS_APP: "Never install screen-sharing apps (AnyDesk, QuickSupport) on instruction from callers.",
                ScamType.JOB_OFFER_SCAM: "Legitimate employers never pay thousands for liking YouTube videos or ask for advance registration fees.",
            }
            pro_tip = pro_tips.get(request.scam_type, "Always verify alarming banking notifications by typing official bank URLs directly.")
            return ExplanationResponse(
                verdict_title=verdict,
                explanation=explanation,
                technical_clues=["Unverified sender identity", "High psychological urgency", "Deceptive financial action"],
                pro_tip=pro_tip,
            )
        else:
            if request.is_correct:
                verdict = "Spot On! Legitimate Notification"
                explanation = "You rightly recognized a safe financial notification. It came from a verified shortcode with standard transactional details."
            else:
                verdict = "False Alarm! This was Safe"
                explanation = "This was actually a legitimate bank/service notification. It contains standard masking (e.g. *1204) and no malicious links or credential requests."

            return ExplanationResponse(
                verdict_title=verdict,
                explanation=explanation,
                technical_clues=["Official registered alphanumeric header", "Standard masked transaction format", "No external credential requests"],
                pro_tip="Legitimate bank updates inform you about activity; they never threaten immediate account suspension via third-party links.",
            )

    # -------------------------------------------------------------------------
    # 3. Scan Mode Analysis (Hybrid: Deterministic Rules + Gemini)
    # -------------------------------------------------------------------------
    def scan_message(self, request: ScanRequest) -> ScanResultResponse:
        """
        Scans untrusted user message for financial fraud indicators.
        Requirement: Never classify as verified legitimate even with 0 flags.
        """
        # Step A: Sanitize untrusted input (prevent injection, length cap, strip bad chars)
        sanitized_text = sanitize_untrusted_input(request.message_text, max_length=MAX_SCAN_INPUT_LENGTH)

        # Step B: Fast deterministic heuristic rules
        rule_results = run_deterministic_rule_checks(sanitized_text)

        # Step C: Gemini Analysis (if client available)
        if self.client:
            prompt = build_scan_user_prompt(
                sanitized_message=sanitized_text,
                rule_flags=rule_results.flags,
                heuristic_score=rule_results.heuristic_score,
                detected_urls=rule_results.extracted_urls,
            )
            config = types.GenerateContentConfig(
                system_instruction=SCAN_SYSTEM_PROMPT,
                response_mime_type="application/json",
                response_schema=ScanResultResponse,
                temperature=0.2,
            )
            try:
                response = self.client.models.generate_content(
                    model=self.model,
                    contents=prompt,
                    config=config,
                )
                if response and response.text:
                    parsed = json.loads(response.text)
                    # Merge deterministic rule flags
                    existing_rule_flags = set(parsed.get("rule_flags", []))
                    existing_rule_flags.update(rule_results.flags)
                    parsed["rule_flags"] = list(existing_rule_flags)

                    # HARD SAFETY RULE: Never allow verified legitimate claim
                    # If score is very low, clamp verdict to UNVERIFIED_LOW_RISK
                    if parsed.get("risk_score", 0) < 30:
                        parsed["verdict"] = ScanVerdict.UNVERIFIED_LOW_RISK.value
                    elif parsed.get("risk_score", 0) < 70:
                        parsed["verdict"] = ScanVerdict.SUSPICIOUS_PROCEED_WITH_CAUTION.value
                    else:
                        parsed["verdict"] = ScanVerdict.DANGER_HIGH_CONFIDENCE.value

                    validated = ScanResultResponse(**parsed)
                    return validated
            except Exception as e:
                logger.warning(f"Scan Mode Gemini call failed: {e}. Falling back to deterministic rules.")

        # Step D: Deterministic Fallback if Gemini is unavailable
        return self._build_deterministic_scan_fallback(sanitized_text, rule_results)

    def _build_deterministic_scan_fallback(self, text: str, rule_results) -> ScanResultResponse:
        """Creates a forensic scan response strictly from deterministic rule findings."""
        score = rule_results.heuristic_score

        if score >= 60:
            verdict = ScanVerdict.DANGER_HIGH_CONFIDENCE
            scam_category = ScamType.PHISHING_LINK
            explanation = "High risk of financial fraud detected based on multiple danger flags including suspicious links, urgency patterns, or sensitive credential prompts."
            tactics = ["Credential harvesting", "Urgency pressure", "Deceptive routing"]
            actions = ["Do NOT click any links.", "Do NOT call numbers listed in the message.", "Report message on Cybercrime helpline 1930."]
        elif score >= 25:
            verdict = ScanVerdict.SUSPICIOUS_PROCEED_WITH_CAUTION
            scam_category = ScamType.FAKE_KYC
            explanation = "Suspicious markers found in this message. The wording or format exhibits common social engineering indicators."
            tactics = ["Suspicious urgency", "Unverified sender pattern"]
            actions = ["Verify transaction status directly inside your official bank app.", "Do not enter UPI PIN or share OTPs."]
        else:
            # Crucial requirement: NEVER claim verified legitimate
            verdict = ScanVerdict.UNVERIFIED_LOW_RISK
            scam_category = ScamType.SAFE_TRANSACTION
            explanation = "No obvious high-risk markers or blacklisted patterns detected. However, automated scans cannot guarantee authenticity. Genuine institutions will never ask for PIN or passwords."
            tactics = ["No obvious red flags detected"]
            actions = ["Always verify sender independently via official website or customer care.", "Never share OTP or banking credentials."]

        return ScanResultResponse(
            risk_score=score,
            verdict=verdict,
            scam_category=scam_category,
            detected_tactics=tactics,
            rule_flags=rule_results.flags,
            explanation=explanation,
            actionable_steps=actions,
            disclaimer="AI scan is advisory only. Absence of flags does not guarantee safety. When in doubt, verify via official bank apps or call 1930."
        )

    # -------------------------------------------------------------------------
    # 4. Month-End AI Coaching Report
    # -------------------------------------------------------------------------
    def generate_coach_report(self, request: CoachReportRequest) -> CoachReportResponse:
        """Generates comprehensive month-end review of the player's run."""
        if self.client:
            prompt = build_coach_user_prompt(
                persona=request.persona,
                total_rounds=request.total_rounds,
                correct_identifications=request.correct_identifications,
                scams_fallen_for=request.scams_fallen_for,
                safe_mistaken_as_scams=request.safe_mistaken_as_scams,
                final_balance=request.final_balance,
                streak_record=request.streak_record,
            )
            config = types.GenerateContentConfig(
                system_instruction=COACH_SYSTEM_PROMPT,
                response_mime_type="application/json",
                response_schema=CoachReportResponse,
                temperature=0.5,
            )
            try:
                response = self.client.models.generate_content(
                    model=self.model,
                    contents=prompt,
                    config=config,
                )
                if response and response.text:
                    parsed = json.loads(response.text)
                    return CoachReportResponse(**parsed)
            except Exception as e:
                logger.warning(f"Coach report Gemini call failed: {e}. Falling back to deterministic summary.")

        return self._build_deterministic_coach_fallback(request)

    def _build_deterministic_coach_fallback(self, request: CoachReportRequest) -> CoachReportResponse:
        """Deterministic coach report when offline."""
        accuracy = (request.correct_identifications / request.total_rounds) if request.total_rounds > 0 else 0

        if accuracy >= 0.85:
            grade = "A+ / Cyber Shield Master"
            summary = f"Outstanding month! You survived the month with ₹{request.final_balance:,} intact and spotted {round(accuracy * 100)}% of threats with a streak of {request.streak_record}."
            tips = ["Keep sharing these scam patterns with family and friends.", "Stay alert for new deepfake and voice-cloning fraud."]
        elif accuracy >= 0.60:
            grade = "B / Vigilant Citizen"
            summary = f"Good financial discipline, but a few subtle traps slipped through, ending the month at ₹{request.final_balance:,}."
            tips = ["Always remember that UPI PIN is solely for paying, never receiving.", "Double check sender shortcodes before reacting."]
        else:
            grade = "C / High Scam Exposure"
            summary = f"Rough month for your finances (ending at ₹{request.final_balance:,}). You were vulnerable to urgency pressure and collect requests."
            tips = ["Pause for 60 seconds whenever a message demands immediate action.", "Never download APK files sent via SMS or WhatsApp."]

        vulnerabilities = [f"Fell for {s.value}" for s in request.scams_fallen_for] if request.scams_fallen_for else ["None identified!"]
        strengths = [f"Maintained max streak of {request.streak_record} rounds", f"Accurately handled {request.correct_identifications} situations"]

        return CoachReportResponse(
            grade=grade,
            summary=summary,
            top_vulnerabilities=vulnerabilities,
            strengths=strengths,
            actionable_tips=tips,
        )
