import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DuelState,
  Player,
  LPLogEntry,
  LPChangeType,
  MatchPhase,
  MatchFormat,
} from '../types';
import { GAME_RULES } from '../constants/gameRules';

// ── Action interface ──────────────────────────────────────────────────────────
interface DuelActions {
  // LP Management
  updateLp: (playerId: 'player1' | 'player2', amount: number, type: LPChangeType, elapsedSeconds: number) => void;
  undoLastChange: () => void;
  resetDuel: (startingLp?: number) => void;

  // Player Configuration
  setPlayerName: (playerId: 'player1' | 'player2', name: string) => void;

  // Timer State syncing
  setTimerRunning: (isRunning: boolean) => void;
  setTimerRemaining: (seconds: number) => void;
  syncTimerState: (timerState: DuelState['matchTimer']) => void;

  // End Game
  setMatchFinished: (finished: boolean) => void;

  // ── Match Manager actions ───────────────────────────────────────────────────
  /**
   * Called from the setup screen. Configures player names + format,
   * resets LP to 8000, clears the log, resets the timer, and moves
   * matchPhase → 'playing'.
   */
  setMatchConfig: (p1Name: string, p2Name: string, format: MatchFormat) => void;

  /**
   * Records a game win for the given player. If the match is NOT yet decided,
   * the per-game state (LP + log + timer) is reset for the next game.
   * Phase is intentionally left unchanged here — the UI decides what to show
   * based on win counts vs. the wins-required threshold.
   */
  registerGameWin: (winner: 'player1' | 'player2') => void;

  /** Full factory reset — returns every field to its default value. */
  resetEntireMatch: () => void;
}

type DuelStore = DuelState & DuelActions;

// ── Shared defaults ───────────────────────────────────────────────────────────
const DEFAULT_NAMES = { player1: 'Player 1', player2: 'Player 2' } as const;
const DEFAULT_FORMAT: MatchFormat = 3;
const DEFAULT_LP = GAME_RULES.DEFAULT_STARTING_LP;

const initialTimerState: DuelState['matchTimer'] = {
  remainingSeconds: GAME_RULES.MATCH_DURATION_SECONDS,
  isRunning: false,
  endTime: null,
  pauseTime: null,
};

const makePlayer = (id: 'player1' | 'player2', name: string, lp = DEFAULT_LP): Player => ({
  id,
  name,
  lp,
});

/** Returns the wins needed to claim the match (majority of games). */
function winsRequired(format: MatchFormat): number {
  return Math.ceil(format / 2);
}

// ── Store ─────────────────────────────────────────────────────────────────────
export const useDuelStore = create<DuelStore>()(
  persist(
    (set, get) => ({
      // ── Initial State ─────────────────────────────────────────────────────

      // Match-level
      matchPhase: 'setup' as MatchPhase,
      matchFormat: DEFAULT_FORMAT,
      player1Name: DEFAULT_NAMES.player1,
      player2Name: DEFAULT_NAMES.player2,
      player1Wins: 0,
      player2Wins: 0,
      pastDuels: [],

      // Per-game
      player1: makePlayer('player1', DEFAULT_NAMES.player1),
      player2: makePlayer('player2', DEFAULT_NAMES.player2),
      log: [],
      matchTimer: initialTimerState,
      isMatchFinished: false,

      // ── LP Actions ────────────────────────────────────────────────────────

      updateLp: (playerId, amount, type, elapsedSeconds) => {
        set((state) => {
          const player = state[playerId];
          const previousLp = player.lp;

          let newLp = previousLp;
          if (type === 'gain') {
            newLp = Math.min(GAME_RULES.MAX_LP, previousLp + amount);
          } else {
            newLp = Math.max(GAME_RULES.MIN_LP, previousLp - amount);
          }

          // No change — skip log entry
          if (previousLp === newLp) return {};

          const updatedPlayer = { ...player, lp: newLp };

          const logEntry: LPLogEntry = {
            id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            playerId,
            playerName: player.name,
            previousLp,
            newLp,
            changeAmount: amount,
            type,
            timestamp: Date.now(),
            elapsedSeconds,
          };

          return {
            [playerId]: updatedPlayer,
            log: [logEntry, ...state.log],
            isMatchFinished:
              state.player1.lp === 0 || state.player2.lp === 0
                ? true
                : state.isMatchFinished,
          };
        });
      },

      undoLastChange: () => {
        set((state) => {
          if (state.log.length === 0) return {};

          const [lastEntry, ...remainingLog] = state.log;
          const { playerId, previousLp } = lastEntry;
          const updatedPlayer = { ...state[playerId], lp: previousLp };

          return {
            [playerId]: updatedPlayer,
            log: remainingLog,
            isMatchFinished: false,
          };
        });
      },

      resetDuel: (startingLp = DEFAULT_LP) => {
        set((state) => ({
          player1: { ...state.player1, lp: startingLp },
          player2: { ...state.player2, lp: startingLp },
          log: [],
          matchTimer: initialTimerState,
          isMatchFinished: false,
        }));
      },

      // ── Player Config ─────────────────────────────────────────────────────

      setPlayerName: (playerId, name) => {
        const trimmed = name.trim() || DEFAULT_NAMES[playerId];
        set((state) => ({
          [playerId]: {
            ...state[playerId],
            name: trimmed,
          },
          [playerId === 'player1' ? 'player1Name' : 'player2Name']: trimmed,
        }));
      },

      // ── Timer Sync ────────────────────────────────────────────────────────

      setTimerRunning: (isRunning) => {
        set((state) => ({ matchTimer: { ...state.matchTimer, isRunning } }));
      },

      setTimerRemaining: (seconds) => {
        set((state) => ({
          matchTimer: { ...state.matchTimer, remainingSeconds: seconds },
        }));
      },

      syncTimerState: (timerState) => {
        set({ matchTimer: timerState });
      },

      setMatchFinished: (finished) => {
        set({ isMatchFinished: finished });
      },

      // ── Match Manager Actions ─────────────────────────────────────────────

      setMatchConfig: (p1Name, p2Name, format) => {
        const trimmed1 = p1Name.trim() || DEFAULT_NAMES.player1;
        const trimmed2 = p2Name.trim() || DEFAULT_NAMES.player2;

        set({
          // Match-level
          matchPhase: 'playing',
          matchFormat: format,
          player1Name: trimmed1,
          player2Name: trimmed2,
          player1Wins: 0,
          player2Wins: 0,
          pastDuels: [],

          // Per-game — fresh start
          player1: makePlayer('player1', trimmed1, DEFAULT_LP),
          player2: makePlayer('player2', trimmed2, DEFAULT_LP),
          log: [],
          matchTimer: initialTimerState,
          isMatchFinished: false,
        });
      },

      registerGameWin: (winner) => {
        set((state) => {
          const newP1Wins =
            winner === 'player1' ? state.player1Wins + 1 : state.player1Wins;
          const newP2Wins =
            winner === 'player2' ? state.player2Wins + 1 : state.player2Wins;

          const required = winsRequired(state.matchFormat);
          const matchDecided =
            newP1Wins >= required || newP2Wins >= required;

          // Archive the current game's log
          const currentDuel = {
            gameNumber: state.player1Wins + state.player2Wins + 1,
            winnerName: winner === 'player1' ? state.player1Name : state.player2Name,
            log: state.log,
          };
          const updatedPastDuels = [...(state.pastDuels || []), currentDuel];

          // If match still ongoing, reset LP + log + timer for next game.
          // If match is decided, keep the final state as-is but clear current log.
          const nextGameReset = matchDecided
            ? {
                log: [],
              }
            : {
                player1: { ...state.player1, lp: DEFAULT_LP },
                player2: { ...state.player2, lp: DEFAULT_LP },
                log: [],
                matchTimer: initialTimerState,
                isMatchFinished: false,
              };

          return {
            player1Wins: newP1Wins,
            player2Wins: newP2Wins,
            pastDuels: updatedPastDuels,
            ...nextGameReset,
          };
        });
      },

      resetEntireMatch: () => {
        set({
          // Match-level
          matchPhase: 'setup',
          matchFormat: DEFAULT_FORMAT,
          player1Name: DEFAULT_NAMES.player1,
          player2Name: DEFAULT_NAMES.player2,
          player1Wins: 0,
          player2Wins: 0,
          pastDuels: [],

          // Per-game
          player1: makePlayer('player1', DEFAULT_NAMES.player1),
          player2: makePlayer('player2', DEFAULT_NAMES.player2),
          log: [],
          matchTimer: initialTimerState,
          isMatchFinished: false,
        });
      },
    }),
    {
      name: 'ygo-calculator-duel-state',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
