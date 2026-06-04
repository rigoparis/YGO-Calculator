/**
 * Official tournament constraints for Yu-Gi-Oh! TCG matches.
 */
export const GAME_RULES = {
  // LP Values
  DEFAULT_STARTING_LP: 8000,
  SPEED_DUEL_STARTING_LP: 4000,
  MAX_LP: 99999, // Cap to prevent UI breakages
  MIN_LP: 0,
  
  // Time limits
  MATCH_DURATION_SECONDS: 40 * 60, // 40 minutes (official tournament time limit)
  WARNING_TIME_SECONDS: 5 * 60,    // 5 minutes warning
};
