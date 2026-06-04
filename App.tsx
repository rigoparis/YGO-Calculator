import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { NavigationBar } from 'expo-navigation-bar';
import { useDuelStore } from './src/store/useDuelStore';
import { useKeepAwakeEffect } from './src/hooks/useKeepAwakeEffect';
import { COLORS } from './src/constants/colors';
import { THEME } from './src/constants/theme';

// Components
import DuelHeader from './src/components/duel/DuelHeader';
import AnimatedLP from './src/components/common/AnimatedLP';
import CalculatorGrid from './src/components/duel/CalculatorGrid';
import MatchSetup from './src/components/setup/MatchSetup';
import ConfirmWinModal from './src/components/duel/ConfirmWinModal';
import MatchVictoryOverlay from './src/components/duel/MatchVictoryOverlay';
import MatchHistory from './src/components/duel/MatchHistory';

// ── Wins required helper (mirrors store logic) ────────────────────────────────
// ── Pip renderer ──────────────────────────────────────────────────────────────
const WinPips: React.FC<{ wins: number; total: number; reversed?: boolean }> = ({
  wins,
  total,
  reversed = false,
}) => {
  const pips = Array.from({ length: total }, (_, i) => i < wins);
  const ordered = reversed ? [...pips].reverse() : pips;

  return (
    <View style={styles.pipRow}>
      {ordered.map((filled, i) => (
        <View key={i} style={[styles.pip, filled && styles.pipFilled]} />
      ))}
    </View>
  );
};

export default function App() {
  const matchPhase    = useDuelStore((s) => s.matchPhase);
  const player1       = useDuelStore((s) => s.player1);
  const player2       = useDuelStore((s) => s.player2);
  const player1Wins   = useDuelStore((s) => s.player1Wins);
  const player2Wins   = useDuelStore((s) => s.player2Wins);
  const matchFormat   = useDuelStore((s) => s.matchFormat);
  const player1Name   = useDuelStore((s) => s.player1Name);
  const player2Name   = useDuelStore((s) => s.player2Name);
  const isTimerRunning  = useDuelStore((s) => s.matchTimer.isRunning);
  const isMatchFinished = useDuelStore((s) => s.isMatchFinished);

  const registerGameWin  = useDuelStore((s) => s.registerGameWin);
  const undoLastChange   = useDuelStore((s) => s.undoLastChange);
  const resetEntireMatch = useDuelStore((s) => s.resetEntireMatch);

  // Keep screen awake while the match timer is running
  useKeepAwakeEffect(isTimerRunning && !isMatchFinished);

  // ── Modal state ────────────────────────────────────────────────────────────
  // confirmWin: tracks which player just hit 0 LP
  const [confirmWinner, setConfirmWinner] = useState<'player1' | 'player2' | null>(null);
  const [logVisible, setLogVisible] = useState(false);

  // ── Listener: 0 LP trigger ─────────────────────────────────────────────────
  useEffect(() => {
    if (matchPhase !== 'playing') return;

    // Only open modal if no modal is already showing (prevents double-fire)
    if (confirmWinner !== null) return;

    if (player1.lp <= 0) setConfirmWinner('player2'); // P1 lost → P2 wins
    else if (player2.lp <= 0) setConfirmWinner('player1'); // P2 lost → P1 wins
  }, [player1.lp, player2.lp, matchPhase]);

  // ── Derived: match completely decided? ────────────────────────────────────
  const required     = Math.ceil(matchFormat / 2);
  const matchWinner: 'player1' | 'player2' | null =
    player1Wins >= required ? 'player1' :
    player2Wins >= required ? 'player2' :
    null;

  // ── Confirm win handlers ──────────────────────────────────────────────────
  const handleConfirmWin = () => {
    if (!confirmWinner) return;
    setConfirmWinner(null);
    registerGameWin(confirmWinner);
  };

  const handleUndoWin = () => {
    setConfirmWinner(null);
    undoLastChange();
  };

  // ── Phase gate ────────────────────────────────────────────────────────────
  if (matchPhase === 'setup') {
    return (
      <>
        <StatusBar hidden />
        <NavigationBar hidden />
        <MatchSetup />
      </>
    );
  }

  // ── LP color helper ───────────────────────────────────────────────────────
  const getLpColor = (lp: number) => {
    if (lp <= 0)    return COLORS.lpLoss;
    if (lp <= 1000) return COLORS.lpLoss;
    if (lp <= 2000) return COLORS.warning;
    return COLORS.text;
  };

  // ── Derive names to pass into modals ──────────────────────────────────────
  const confirmLoserName  = confirmWinner === 'player2' ? player1Name : player2Name;
  const confirmWinnerName = confirmWinner === 'player2' ? player2Name : player1Name;
  const matchWinnerName   = matchWinner === 'player1' ? player1Name : player2Name;

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <NavigationBar hidden />

      {/* ── TOP HALF: Player 2 (rotated 180° for tabletop play) ── */}
      <View style={[styles.playerHalf, styles.player2Half]}>
        <View style={styles.contentWrapper}>
          <View style={styles.headerRow}>
            <View>
              <WinPips wins={player2Wins} total={matchFormat} reversed />
              <Text style={styles.playerName}>{player2.name}</Text>
              {player2.lp === 0 && <Text style={styles.defeatText}>DEFEATED</Text>}
            </View>
            <AnimatedLP value={player2.lp} color={getLpColor(player2.lp)} />
          </View>
          <View style={styles.calculatorWrapper}>
            <CalculatorGrid activePlayerId="player2" />
          </View>
        </View>
      </View>

      {/* ── CENTER DIVIDER: Timer, controls ── */}
      <View style={styles.centerDivider}>
        <DuelHeader onOpenLog={() => setLogVisible(true)} />
      </View>

      {/* ── BOTTOM HALF: Player 1 (standard orientation) ── */}
      <View style={[styles.playerHalf, styles.player1Half]}>
        <View style={styles.contentWrapper}>
          <View style={styles.headerRow}>
            <View>
              <WinPips wins={player1Wins} total={matchFormat} />
              <Text style={styles.playerName}>{player1.name}</Text>
              {player1.lp === 0 && <Text style={styles.defeatText}>DEFEATED</Text>}
            </View>
            <AnimatedLP value={player1.lp} color={getLpColor(player1.lp)} />
          </View>
          <View style={styles.calculatorWrapper}>
            <CalculatorGrid activePlayerId="player1" />
          </View>
        </View>
      </View>

      {/* ── 0 LP "Confirm Win?" modal ── */}
      <ConfirmWinModal
        visible={confirmWinner !== null && matchWinner === null}
        loserName={confirmLoserName}
        winnerName={confirmWinnerName}
        onConfirm={handleConfirmWin}
        onUndo={handleUndoWin}
      />

      {/* ── Grand match victory overlay ── */}
      <MatchVictoryOverlay
        visible={matchWinner !== null}
        winnerName={matchWinnerName}
        onNewMatch={resetEntireMatch}
      />

      {/* ── Match History Log Modal ── */}
      <Modal
        visible={logVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setLogVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Match Log</Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => setLogVisible(false)}>
                <Text style={styles.closeButtonText}>CLOSE</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <MatchHistory />
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  playerHalf: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: THEME.spacing.md,
    backgroundColor: COLORS.background,
  },
  player2Half: {
    transform: [{ rotate: '180deg' }],
  },
  player1Half: {
    // Standard orientation
  },
  contentWrapper: {
    justifyContent: 'center',
    gap: THEME.spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: THEME.spacing.sm,
  },
  playerName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  defeatText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.lpLoss,
    letterSpacing: 1,
  },
  calculatorWrapper: {
    width: '100%',
  },
  centerDivider: {
    width: '100%',
  },
  pipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: THEME.spacing.xs,
  },
  pip: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
  },
  pipFilled: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 4,
    elevation: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    height: '80%',
    backgroundColor: COLORS.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: THEME.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surfaceElevated,
  },
  modalTitle: {
    ...THEME.typography.titleMedium,
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    paddingVertical: THEME.spacing.xs,
    paddingHorizontal: THEME.spacing.sm,
    borderRadius: 6,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  closeButtonText: {
    ...THEME.typography.bodyMedium,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  modalBody: {
    flex: 1,
    padding: THEME.spacing.md,
  },
});
