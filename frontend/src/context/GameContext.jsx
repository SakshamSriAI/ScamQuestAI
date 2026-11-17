import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '@/services/api';

const GameContext = createContext(null);

const STORAGE_KEY = 'scamquest_session_id';

export function GameProvider({ children }) {
  const [sessionId, setSessionId] = useState(() => localStorage.getItem(STORAGE_KEY) || null);
  const [gameState, setGameState] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [serverHealth, setServerHealth] = useState(null);

  // Check backend connectivity on mount
  useEffect(() => {
    let mounted = true;
    api.getHealth()
      .then((data) => {
        if (mounted) setServerHealth(data);
      })
      .catch((err) => {
        if (mounted) setServerHealth({ status: 'offline', error: err.message });
      });
    return () => { mounted = false; };
  }, []);

  // Sync state if session exists
  const fetchGameState = useCallback(async (sid) => {
    if (!sid) return;
    setIsLoading(true);
    setError(null);
    try {
      const state = await api.getGameState(sid);
      setGameState(state);
    } catch (err) {
      // If 404 (server restarted), clear dead session
      if (err.status === 404) {
        localStorage.removeItem(STORAGE_KEY);
        setSessionId(null);
        setGameState(null);
      } else {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (sessionId && !gameState) {
      fetchGameState(sessionId);
    }
  }, [sessionId, gameState, fetchGameState]);

  // Start new run
  const startNewGame = async (config = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const state = await api.startGame(config);
      localStorage.setItem(STORAGE_KEY, state.session_id);
      setSessionId(state.session_id);
      setGameState(state);
      return state;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Answer
  const submitDecision = async (choice) => {
    if (!sessionId) return null;
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await api.submitAnswer(sessionId, choice);
      // Refresh game state to update score, streak, balance
      await fetchGameState(sessionId);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Advance to next day
  const advanceDay = async () => {
    if (!sessionId) return null;
    setIsLoading(true);
    setError(null);
    try {
      const state = await api.nextScenario(sessionId);
      setGameState(state);
      return state;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Restart session
  const restartGame = async () => {
    if (!sessionId) return null;
    setIsLoading(true);
    setError(null);
    try {
      const state = await api.restartGame(sessionId);
      setGameState(state);
      return state;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const clearSession = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSessionId(null);
    setGameState(null);
    setError(null);
  };

  return (
    <GameContext.Provider
      value={{
        sessionId,
        gameState,
        isLoading,
        isSubmitting,
        error,
        serverHealth,
        startNewGame,
        submitDecision,
        advanceDay,
        restartGame,
        clearSession,
        refreshState: () => fetchGameState(sessionId),
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
