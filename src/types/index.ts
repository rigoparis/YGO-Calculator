export interface Player {
  id: 'player1' | 'player2';
  name: string;
  lp: number;
}

export type LPChangeType = 'gain' | 'loss';

export interface LPLogEntry {
  id: string;
  playerId: 'player1' | 'player2';
  playerName: string;
  previousLp: number;
  newLp: number;
  changeAmount: number;
  type: LPChangeType;
  timestamp: number; // Date.now() timestamp
  elapsedSeconds: number; // Match timer timestamp at change
}

export interface MatchTimerState {
  remainingSeconds: number;
  isRunning: boolean;
  endTime: number | null; // Date.now() timestamp when timer is scheduled to end
  pauseTime: number | null; // Date.now() timestamp when paused
}

/** 'setup' → pre-match config screen; 'playing' → match is live. */
export type MatchPhase = 'setup' | 'playing';

/** Supported match formats: Best of 1, 3, or 5. */
export type MatchFormat = 1 | 3 | 5;

export interface PastDuel {
  gameNumber: number;
  winnerName: string;
  log: LPLogEntry[];
}

export interface DuelState {
  // ── Match-level state ──────────────────────────────────────────────────────
  matchPhase: MatchPhase;
  matchFormat: MatchFormat;
  player1Name: string;
  player2Name: string;
  player1Wins: number;
  player2Wins: number;
  pastDuels: PastDuel[];

  // ── Per-game state ─────────────────────────────────────────────────────────
  player1: Player;
  player2: Player;
  log: LPLogEntry[];
  matchTimer: MatchTimerState;
  isMatchFinished: boolean;
}
