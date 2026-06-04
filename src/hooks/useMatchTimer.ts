import { useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useDuelStore } from '../store/useDuelStore';

/**
 * Drift-resilient tournament match timer hook.
 * Uses Date.now() to calculate time elapsed and handles app background/foreground transitions.
 * Accesses Zustand store imperatively inside tick loops to prevent rendering infinite loops.
 */
export function useMatchTimer() {
  const syncTimerState = useDuelStore((state) => state.syncTimerState);
  
  // Reactively subscribe to only the minimal state properties required to render the UI
  const isRunning = useDuelStore((state) => state.matchTimer.isRunning);
  const remainingSeconds = useDuelStore((state) => state.matchTimer.remainingSeconds);

  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  // Clear running intervals
  const stopInterval = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  // Timer Tick implementation - fetches store state dynamically to avoid updates depth issue
  const tick = useCallback(() => {
    const state = useDuelStore.getState();
    const currentTimer = state.matchTimer;
    
    if (!currentTimer.isRunning || !currentTimer.endTime) {
      stopInterval();
      return;
    }

    const now = Date.now();
    const diffMs = currentTimer.endTime - now;
    const remaining = Math.max(-3600, Math.ceil(diffMs / 1000)); // Cap negative time to 1 hr overtime for safety

    // Only sync to state if the value has changed to avoid redundant re-renders
    if (remaining !== currentTimer.remainingSeconds) {
      syncTimerState({
        ...currentTimer,
        remainingSeconds: remaining,
      });
    }
  }, [syncTimerState, stopInterval]);

  // Start the timer loop
  const startInterval = useCallback(() => {
    stopInterval();
    tick(); // Run immediate check
    timerIntervalRef.current = setInterval(tick, 200); // Check every 200ms
  }, [tick, stopInterval]);

  // Toggle play/pause
  const toggleTimer = useCallback(() => {
    const state = useDuelStore.getState();
    const currentTimer = state.matchTimer;

    if (currentTimer.isRunning) {
      // Pause action
      stopInterval();
      syncTimerState({
        remainingSeconds: currentTimer.remainingSeconds,
        isRunning: false,
        endTime: null,
        pauseTime: Date.now(),
      });
    } else {
      // Play action
      const newEndTime = Date.now() + currentTimer.remainingSeconds * 1000;
      syncTimerState({
        remainingSeconds: currentTimer.remainingSeconds,
        isRunning: true,
        endTime: newEndTime,
        pauseTime: null,
      });
    }
  }, [syncTimerState, stopInterval]);

  // Reset timer back to tournament duration
  const resetTimer = useCallback((durationSeconds: number) => {
    stopInterval();
    syncTimerState({
      remainingSeconds: durationSeconds,
      isRunning: false,
      endTime: null,
      pauseTime: null,
    });
  }, [syncTimerState, stopInterval]);

  // Effect to manage ticking interval based on isRunning state
  useEffect(() => {
    if (isRunning) {
      startInterval();
    } else {
      stopInterval();
    }
    return () => stopInterval();
  }, [isRunning, startInterval, stopInterval]);

  // Effect to handle App background/foreground transitions smoothly without timing drift
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App has come to the foreground, recalculate remainingSeconds immediately
        const state = useDuelStore.getState();
        if (state.matchTimer.isRunning && state.matchTimer.endTime) {
          tick();
        }
      }
      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, [tick]);

  return {
    remainingSeconds,
    isRunning,
    toggleTimer,
    resetTimer,
  };
}

export default useMatchTimer;
