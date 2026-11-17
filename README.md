# ScamQuest — Gamified Financial & UPI Scam Simulator

**ScamQuest** is an educational, interactive financial fraud survival game and forensic scanner built for the **Arthathon** hackathon ("AI for Finance"). It trains citizens to spot deceptive UPI collect requests, fake KYC expiry notices, job scams, and phishing attempts without risking real money.

---

## Architecture Overview

ScamQuest pairs **FastAPI** with **Google's official `google-genai` SDK** (Gemini 2.5 Flash) and a strictly **deterministic game engine**:
* **Deterministic Economics:** Starting with a fictional ₹50,000 salary, all balance deductions, penalties, rewards, streak bonuses, and routine expenses (rent, groceries, SIP) are calculated by the Python backend. Gemini never touches wallet math or scores.
* **Hybrid Scan Mode:** User-pasted messages undergo deterministic regex checks (raw IPs, lookalike domains, credential requests, remote-access apps) combined with LLM context analysis. The engine strictly avoids false security: clean messages receive an `UNVERIFIED_LOW_RISK` advisory rather than a guarantee of safety.
* **Resilient Fallback Engine:** If the Gemini API is offline or times out during a live demo, the engine seamlessly switches to curated fallback scenarios and heuristic explanations with zero UI interruption.

---

## API Endpoints

All endpoints are served at `http://localhost:8000`. Automatic OpenAPI documentation is available at `http://localhost:8000/docs`.

| Method | Endpoint | Description | Request Body | Response |
|---|---|---|---|---|
| `GET` | `/health` | System health check & storage status | None | `{"status": "healthy", ...}` |
| `POST` | `/api/game/start` | Initialize 30-day session with ₹50,000 starting salary | `{"persona": "COLLEGE_STUDENT", "language": "HINGLISH", "total_days": 30}` | `GameSessionPublicState` |
| `GET` | `/api/game/{session_id}` | Retrieve public state (scenario ground truth is withheld) | None | `GameSessionPublicState` |
| `POST` | `/api/game/{session_id}/next` | Advance to the next day's scenario (requires prior answer) | None | `GameSessionPublicState` |
| `POST` | `/api/game/{session_id}/answer` | Submit verdict (`SCAM` or `SAFE`); applies penalties/rewards | `{"choice": "SCAM"}` | `PlayerAnswerResponse` |
| `GET` | `/api/game/{session_id}/report` | Final ledger breakdown, survival score, and AI coaching | None | `MonthEndReportResponse` |
| `POST` | `/api/game/{session_id}/restart`| Reset session back to Day 1 with initial balance | None | `GameSessionPublicState` |
| `POST` | `/api/scan` | Forensic scan of untrusted user-submitted messages | `{"message_text": "..."}` | `ScanResultResponse` |

---

## Routine Financial Life Events

During the 30-day simulated month, the player experiences normal living expenses:
* **Day 1:** Starting Salary Credit (+₹50,000)
* **Day 3:** Apartment Rent (-₹12,000)
* **Day 7:** Systematic Investment Plan (SIP) in Index Fund (-₹5,000)
* **Day 12:** Grocery & Supermarket Provisions (-₹3,500)
* **Day 16:** State Electricity Utility Bill (-₹1,200)
* **Day 20:** Broadband & Mobile Plan Renewal (-₹800)
* **Day 25:** Dining & Leisure (-₹1,500)

Falling for scams (e.g. paying an unreceived refund or clicking a fake KYC link) inflicts simulated financial penalties (e.g., -₹2,500 to -₹7,500), forcing the player to balance everyday living costs with cyber vigilance to survive the month.

---

## Session Storage & Known Limitations

* **In-Memory Session Storage:** For the hackathon prototype, session states are stored in an in-memory dictionary keyed by `session_id`.
* **Server Restarts:** Any server restart clears active in-memory sessions. Clients will receive `404 Not Found` for previous session IDs and can restart via `POST /api/game/start`.
* **Zero Real Money:** All transactions, bank notifications, balances, and deductions are purely simulated and fictional.

---

## Running the Backend & Tests

### Setup
```bash
# 1. Activate Python virtual environment
source .venv/bin/activate

# 2. Configure environment variables
cp backend/.env.example backend/.env
# Add your GEMINI_API_KEY in backend/.env

# 3. Start FastAPI server
uvicorn backend.app.main:app --reload --port 8000
```

### Running Test Suites
```bash
source .venv/bin/activate

# 1. Full Unit & Regression Test Suite (35 tests)
PYTHONPATH=. pytest backend/tests -v

# 2. Automated End-to-End User Journey Audit (11 stages)
PYTHONPATH=. python backend/tests/run_e2e_integration_qa.py
```
All 35 tests validate schema compliance, deterministic math, scheduled expenses, anti-cheat ground-truth withholding, and hybrid forensics.

---

## Running Frontend & Production Build

```bash
cd frontend

# Install dependencies (if not already installed)
npm install

# Start development server on http://localhost:3000
npm run dev

# Run production build (Vite bundle verification)
npm run build
```

---

## Deployment Readiness

### Frontend (Vercel)
- **Root Directory:** `frontend/`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Environment Variable:** `VITE_API_BASE_URL` (Points to Render backend URL e.g. `https://scamquest-backend.onrender.com`)

### Backend (Render)
- **Environment:** Python 3.14 / 3.11
- **Build Command:** `pip install -r backend/requirements.txt`
- **Start Command:** `uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`
- **Environment Variables:**
  - `GEMINI_API_KEY`: (Optional) Your Google GenAI API key. If absent, engine operates with curated fallbacks.
  - `GEMINI_MODEL`: `gemini-2.5-flash`
  - `CORS_ORIGINS`: Comma-separated allowed frontend origins (or `*`)
  - `PORT`: (Provided automatically by Render)
