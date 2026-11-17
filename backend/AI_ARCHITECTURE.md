# ScamQuest — AI Architecture & Engineering Specification

## 1. Overview & Architecture Philosophy

ScamQuest utilizes a **Hybrid AI + Deterministic Game Architecture**. 
While Large Language Models (LLMs) excel at generating realistic, human-deceptive scam scenarios and explaining psychological manipulation, financial game mechanics and critical safety verdicts must remain deterministic, tamper-proof, and explainable.

```
                           +----------------------------------------+
                           |           Frontend Client             |
                           +----------------------------------------+
                                       |                 |
                   Game Loop Requests  |                 |  Scan Untrusted Message
                                       v                 v
+----------------------------------------------------------------------------------+
|                             FastAPI Backend Core                                 |
|                                                                                  |
|   +------------------------------------+   +---------------------------------+   |
|   | Deterministic Game Engine          |   | Input Sanitizer & Heuristics    |   |
|   | - Wallet Balances                  |   | - Strip control chars & tags    |   |
|   | - Streak & Multipliers             |   | - Length limit (1000 chars)     |   |
|   | - Economic Penalties & Deductions  |   | - Regex & keyword detection     |   |
|   | - Deterministic Scorer             |   | - Heuristic risk score (0-100)  |   |
|   +------------------------------------+   +---------------------------------+   |
|                                                              |                   |
|                                                              v                   |
|   +--------------------------------------------------------------------------+   |
|   | AIService (Google GenAI SDK + Gemini 2.5 Flash Structured Outputs)       |   |
|   | - Scenario Generator (Persona, Difficulty, Language, 12 Scam Categories) |   |
|   | - Red-Flag Explainer (Psychological & Technical breakdown)               |   |
|   | - Hybrid Scan Mode (Never flags as verified safe)                        |   |
|   | - Month-End AI Coaching Report                                           |   |
|   +--------------------------------------------------------------------------+   |
|                  |                                          |                    |
|      (On Failure / Timeout)                    (Pydantic Validation Pass)        |
|                  v                                          v                    |
|   +------------------------------------+    +--------------------------------+   |
|   | Curated Fallback Data (15 Scenarios|    | Validated Structured Response  |   |
|   | + Deterministic Rules Engine)      |    +--------------------------------+   |
|   +------------------------------------+                                         |
+----------------------------------------------------------------------------------+
```

---

## 2. Key Architecture Principles

### A. Strict Separation of AI and Game Economics
* **Gemini never calculates or decides game state:** It does not decide player scores, wallet deductions, streak multipliers, or bank balances.
* The backend game engine handles all mathematics deterministically. The AI's `claimed_amount` field is strictly used for narrative realism in the SMS text.

### B. Untrusted Input Handling & Prompt Injection Defense
* In **Scan Mode**, all user-supplied messages are treated as completely untrusted data.
* Inputs are capped at 1,000 characters, stripped of control characters, and sanitized of XML breakout tags (`</untrusted_user_message>`).
* In the prompt, the text is sandboxed within `<untrusted_user_message>` delimiters, and the model is explicitly instructed never to execute commands or instructions within the tags.

### C. The "Zero False Security" Rule in Scan Mode
* Automated algorithms cannot definitively prove a message is authentic.
* **Scan Mode never returns `VERIFIED_LEGITIMATE`** or promises 100% safety.
* If 0 flags are detected, the system returns `UNVERIFIED_LOW_RISK` alongside a mandatory advisory notice directing users to confirm with official bank apps or call the national cybercrime helpline (`1930`).

### D. Zero-Downtime Fallback Mechanism
* If the Gemini API key is missing, network fails, API times out, or the LLM returns invalid JSON:
  * Scenarios are loaded from `fallback_data.json` matching the requested persona and difficulty.
  * Explanations and Scan Mode fall back to the deterministic heuristic engine.
  * The frontend receives valid, structured data without error popups.

---

## 3. Supported Scenarios & Diversity

### Scam Categories
1. `FAKE_KYC`: Bank account / SIM card suspension warnings urging APK download.
2. `UPI_COLLECT`: "Wrong transfer" claims where fraudster sends a collect request instead of receiving money.
3. `WRONG_PAYMENT_REFUND`: Emotional manipulation asking for refunds for unreceived funds.
4. `JOB_OFFER_SCAM`: Work-from-home YouTube like / Telegram review tasks.
5. `LOTTERY_PRIZE`: Kaun Banega Crorepati (KBC) WhatsApp lucky draw scams.
6. `ELECTRICITY_DISCONNECT`: Urgent same-night power cut threats with personal contact numbers.
7. `PHISHING_LINK`: Direct links to lookalike domains or raw IP addresses.
8. `FAKE_CUSTOMER_SUPPORT`: Bogus toll-free customer care numbers.
9. `QR_CODE_SCAM`: Tricking merchants/users to scan QR codes to "receive" payments.
10. `REMOTE_ACCESS_APP`: Demands to install AnyDesk/QuickSupport for "technical support".
11. `IMPERSONATION`: Digital arrest or fake police/CBI intimidation.
12. `INVESTMENT_SCAM`: Unrealistic guaranteed return schemes in private Telegram groups.

### Safe Transaction Categories
1. `SAFE_TRANSACTION`: Routine grocery / merchant debit with valid bank shortcodes.
2. `SAFE_BILL_PAYMENT`: Official electricity/utility receipt with masked accounts.
3. `SAFE_SALARY_CREDIT`: Legitimate corporate NEFT salary notification.
4. `SAFE_PEER_TRANSFER`: Normal split expense notification from friends.

### Personas & Languages
* **Personas:** `COLLEGE_STUDENT`, `SHOPKEEPER`, `SENIOR_CITIZEN`.
* **Languages:** `ENGLISH`, `HINDI` (Devanagari), and `HINGLISH` (Romanized Hindi).
* **Difficulties:** `EASY`, `MEDIUM`, `HARD`.

---

## 4. Test Coverage & Verification

Run tests inside the virtual environment:
```bash
source .venv/bin/activate
PYTHONPATH=. pytest backend/tests -v
```

### Verified Test Suites:
1. `test_schemas.py`: Verifies Pydantic schemas, bounds checking, and bidirectional scam/safe alignment.
2. `test_rule_checker.py`: Verifies regex extraction of APK links, credentials, remote access software, and collect requests, plus sanitization.
3. `test_ai_service_fallback.py`: Verifies zero-API-key fallback generation, exception handling, and criteria filtering.
4. `test_scan_mode_security.py`: Verifies prompt injection neutralization and enforces that clean messages are never labeled `VERIFIED_LEGITIMATE`.
