import { COLORS } from './colors';

/**
 * Base layout spacing, typography levels, and shadow helpers.
 */
export const THEME = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  typography: {
    titleLarge: {
      fontSize: 32,
      fontWeight: 'bold' as const,
      color: COLORS.text,
    },
    titleMedium: {
      fontSize: 24,
      fontWeight: '600' as const,
      color: COLORS.text,
    },
    bodyLarge: {
      fontSize: 18,
      fontWeight: 'normal' as const,
      color: COLORS.text,
    },
    bodyMedium: {
      fontSize: 14,
      fontWeight: 'normal' as const,
      color: COLORS.textMuted,
    },
    lpDisplay: {
      fontSize: 48,
      fontWeight: 'bold' as const,
      letterSpacing: 2,
    },
    timerDisplay: {
      fontSize: 28,
      fontWeight: '700' as const,
      fontVariant: ['tabular-nums' as const],
    },
  },
  shadow: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
};
