/**
 * ScamQuest Frontend API Service Layer
 * Connects directly to the FastAPI backend.
 */

const rawBase = import.meta.env.VITE_API_BASE_URL || '';
const API_BASE = rawBase.endsWith('/') ? rawBase.slice(0, -1) : rawBase;

class APIError extends Error {
  constructor(message, status, detail) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.detail = detail;
  }
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage = data?.detail || `Request failed with status ${response.status}`;
      throw new APIError(errorMessage, response.status, data);
    }

    return data;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    // Network or client error
    throw new APIError(
      error.message || 'Unable to connect to ScamQuest backend server. Please check your connection.',
      0,
      null
    );
  }
}

export const api = {
  // System Health
  async getHealth() {
    return request('/health');
  },

  // Game Lifecycle
  async startGame({ persona = 'COLLEGE_STUDENT', language = 'HINGLISH', initial_difficulty = 'EASY', total_days = 30 } = {}) {
    return request('/api/game/start', {
      method: 'POST',
      body: JSON.stringify({ persona, language, initial_difficulty, total_days }),
    });
  },

  async getGameState(sessionId) {
    return request(`/api/game/${encodeURIComponent(sessionId)}`);
  },

  async nextScenario(sessionId) {
    return request(`/api/game/${encodeURIComponent(sessionId)}/next`, {
      method: 'POST',
    });
  },

  async submitAnswer(sessionId, choice) {
    return request(`/api/game/${encodeURIComponent(sessionId)}/answer`, {
      method: 'POST',
      body: JSON.stringify({ choice }),
    });
  },

  async getMonthEndReport(sessionId) {
    return request(`/api/game/${encodeURIComponent(sessionId)}/report`);
  },

  async restartGame(sessionId) {
    return request(`/api/game/${encodeURIComponent(sessionId)}/restart`, {
      method: 'POST',
    });
  },

  // Forensic Scan Mode
  async scanMessage(messageText) {
    return request('/api/scan', {
      method: 'POST',
      body: JSON.stringify({ message_text: messageText }),
    });
  },
};
