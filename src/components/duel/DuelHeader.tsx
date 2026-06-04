import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMatchTimer } from '../../hooks/useMatchTimer';
import { formatTime } from '../../utils/timeFormatter';
import { COLORS } from '../../constants/colors';
import { THEME } from '../../constants/theme';
import { GAME_RULES } from '../../constants/gameRules';
import { useDuelStore } from '../../store/useDuelStore';
import MatchHistory from './MatchHistory';
import RNGSuite from './RNGSuite';



// ── Component ─────────────────────────────────────────────────────────────────
/**
 * DuelHeader: slim center divider bar containing the match-win pip trackers,
 * timer, RNG suite, and play/log controls.
 */
export const DuelHeader: React.FC<{ onOpenLog: () => void }> = ({ onOpenLog }) => {
  const { remainingSeconds, isRunning, toggleTimer, resetTimer } = useMatchTimer();

  const player1Wins  = useDuelStore((s) => s.player1Wins);
  const player2Wins  = useDuelStore((s) => s.player2Wins);
  const matchFormat  = useDuelStore((s) => s.matchFormat);
  const player1Name  = useDuelStore((s) => s.player1Name);

  const handleReset = () => resetTimer(GAME_RULES.MATCH_DURATION_SECONDS);

  const isLowTime = remainingSeconds > 0 && remainingSeconds <= GAME_RULES.WARNING_TIME_SECONDS;
  const isTimeUp  = remainingSeconds <= 0;

  let timerColor = COLORS.text;
  if (isTimeUp)   timerColor = COLORS.lpLoss;
  else if (isLowTime) timerColor = COLORS.warning;

  return (
    <View style={styles.centerBar}>

      {/* ── Left cluster: RESET ── */}
      <View style={styles.leftCluster}>
        <TouchableOpacity style={styles.barButton} onPress={handleReset}>
          <Text style={styles.buttonText}>RESET</Text>
        </TouchableOpacity>
      </View>

      {/* ── Center: Timer ── */}
      <View style={styles.timerWrapper}>
        <Text style={[styles.timerText, { color: timerColor }]}>
          {formatTime(remainingSeconds)}
        </Text>
      </View>

      {/* ── Right cluster: RNG + START/PAUSE + LOG ── */}
      <View style={styles.rightCluster}>
        <RNGSuite />

        <TouchableOpacity
          style={[styles.barButton, isRunning ? styles.pauseButton : styles.playButton]}
          onPress={toggleTimer}
        >
          <Text style={styles.buttonText}>{isRunning ? 'PAUSE' : 'START'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.barButton} onPress={onOpenLog}>
          <Text style={styles.buttonText}>LOG</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  centerBar: {
    height: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: THEME.spacing.sm,
    backgroundColor: COLORS.surfaceElevated,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    zIndex: 10,
  },
  leftCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.sm,
  },
  rightCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.xs,
  },
  timerWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerText: {
    ...THEME.typography.timerDisplay,
    fontSize: 22,
  },
  barButton: {
    paddingVertical: THEME.spacing.xs + 2,
    paddingHorizontal: THEME.spacing.sm + 2,
    borderRadius: 6,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    borderColor: COLORS.lpGain,
  },
  pauseButton: {
    borderColor: COLORS.warning,
  },
  buttonText: {
    ...THEME.typography.bodyMedium,
    fontSize: 12,
    color: COLORS.text,
    fontWeight: 'bold',
  },
});

export default DuelHeader;
