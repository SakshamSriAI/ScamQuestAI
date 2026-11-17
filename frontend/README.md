# ScamQuest Frontend

ScamQuest's web client is designed with a **refined editorial fintech aesthetic** (warm paper backdrops, dark ink surfaces, muted sage accents, and restrained terracotta warnings).

---

## Technology Stack

* **Core:** React 18, Vite 6, JavaScript (ES6+)
* **Styling:** Tailwind CSS 3.4 with custom design tokens
* **Animations:** Motion for React (`motion/react`) with `prefers-reduced-motion` compliance
* **Icons:** Lucide React
* **Charts & Analytics:** Recharts
* **Routing:** React Router v6

---

## Directory Organization

```text
frontend/
├── src/
│   ├── assets/          # Static logos and assets
│   ├── components/      # Reusable UI building blocks (Button, Card, Badge)
│   ├── context/         # GameContext for session state and reactivity
│   ├── data/            # Static constants & presentation rules
│   ├── hooks/           # Custom React hooks
│   ├── layouts/         # RootLayout with editorial navigation & status
│   ├── pages/           # Route views (HomePage, ScanPage, LedgerPage)
│   ├── services/        # api.js connecting directly to FastAPI backend
│   ├── utils/           # formatters.js (currency, dates, scam tags)
│   ├── App.jsx          # Router & Provider composition
│   ├── index.css        # Tailwind directives & editorial typography
│   └── main.jsx         # DOM entrypoint
├── tailwind.config.js   # Custom editorial paper & ink color tokens
├── vite.config.js       # Vite bundler & API proxy configuration
└── package.json
```

---

## Running Locally

### 1. Start the FastAPI Backend (Terminal 1)
```bash
# In project root
source .venv/bin/activate
uvicorn backend.app.main:app --reload --port 8000
```

### 2. Start the Vite Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```

Open your browser at `http://localhost:3000`. The Vite development server automatically proxies `/api` and `/health` requests to `http://localhost:8000`.
