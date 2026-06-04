import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { COLORS } from '../../constants/colors';
import { THEME } from '../../constants/theme';

interface MatchVictoryOverlayProps {
  visible: boolean;
  winnerName: string;
  onNewMatch: () => void;
}

/**
 * MatchVictoryOverlay
 *
 * Full-screen dual-facing victory announcement. The winner text is shown
 * twice — once rotated 180° for the player across the table, and once at
 * 0° for the player holding the phone. A single "Start New Match" button
 * resets the entire store and returns to the setup screen.
 */
const MatchVictoryOverlay: React.FC<MatchVictoryOverlayProps> = ({
  visible,
  winnerName,
  onNewMatch,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {}}
    >
      <View style={styles.overlay}>

        {/* ── Player 2 side — rotated so they can read it right-side up ──── */}
        <View style={styles.halfPane}>
          <View style={styles.rotated}>
            <Text style={styles.eyebrow}>MATCH WINNER</Text>
            <Text style={styles.winnerName}>{winnerName}</Text>
            <Text style={styles.trophy}>🏆</Text>
          </View>
        </View>

        {/* ── Center action row ─────────────────────────────────────────── */}
        <View style={styles.centerRow}>
          <TouchableOpacity
            style={styles.newMatchBtn}
            onPress={onNewMatch}
            accessibilityRole="button"
            accessibilityLabel="Start new match"
          >
            <Text style={styles.newMatchBtnText}>⚔️  Start New Match</Text>
          </TouchableOpacity>
        </View>

        {/* ── Player 1 side — standard orientation ─────────────────────── */}
        <View style={styles.halfPane}>
          <Text style={styles.eyebrow}>MATCH WINNER</Text>
          <Text style={styles.winnerName}>{winnerName}</Text>
          <Text style={styles.trophy}>🏆</Text>
        </View>

      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.93)',
    flexDirection: 'column',
    zIndex: 9999,
    elevation: 9999,
  },

  halfPane: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: THEME.spacing.xl,
    gap: THEME.spacing.xs,
  },

  rotated: {
    transform: [{ rotate: '180deg' }],
    alignItems: 'center',
    gap: THEME.spacing.xs,
  },

  eyebrow: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.textMuted,
    letterSpacing: 4,
  },

  winnerName: {
    fontSize: 46,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    letterSpacing: 2,
    textShadowColor: COLORS.primaryDark,
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 14,
  },

  trophy: {
    fontSize: 42,
    marginTop: THEME.spacing.xs,
  },

  // ── Center action strip ─────────────────────────────────────────────────
  centerRow: {
    paddingHorizontal: THEME.spacing.xl,
    paddingVertical: THEME.spacing.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.primary,
    alignItems: 'center',
    backgroundColor: 'rgba(212,175,55,0.06)',
  },

  newMatchBtn: {
    paddingVertical: THEME.spacing.sm + 4,
    paddingHorizontal: THEME.spacing.xl + 8,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    ...THEME.shadow,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.55,
    shadowRadius: 14,
    elevation: 12,
  },

  newMatchBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.background,
    letterSpacing: 1.5,
  },
});

export default MatchVictoryOverlay;
