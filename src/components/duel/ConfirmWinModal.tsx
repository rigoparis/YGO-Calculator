import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { COLORS } from '../../constants/colors';
import { THEME } from '../../constants/theme';

interface ConfirmWinModalProps {
  visible: boolean;
  loserName: string;
  winnerName: string;
  onConfirm: () => void;
  onUndo: () => void;
}

/**
 * ConfirmWinModal
 *
 * Shown the instant a player's LP reaches 0. Asks the duelists to confirm
 * whether it was a genuine win or an input mistake.
 */
const ConfirmWinModal: React.FC<ConfirmWinModalProps> = ({
  visible,
  loserName,
  winnerName,
  onConfirm,
  onUndo,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      // Prevent accidental back-button dismissal; force an explicit choice
      onRequestClose={() => {}}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Icon */}
          <Text style={styles.icon}>☠️</Text>

          {/* Body copy */}
          <Text style={styles.headline}>LP Reached Zero!</Text>
          <Text style={styles.body}>
            <Text style={styles.loserName}>{loserName}</Text>
            {`'s LP hit 0.\nDid `}
            <Text style={styles.winnerName}>{winnerName}</Text>
            {' win this game?'}
          </Text>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Actions */}
          <TouchableOpacity
            style={styles.confirmBtn}
            onPress={onConfirm}
            accessibilityRole="button"
            accessibilityLabel={`Confirm ${winnerName} won`}
          >
            <Text style={styles.confirmBtnText}>
              {`⚡  Yes — ${winnerName} Won`}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.undoBtn}
            onPress={onUndo}
            accessibilityRole="button"
            accessibilityLabel="Undo last LP change"
          >
            <Text style={styles.undoBtnText}>↩  No — Undo Mistake</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: THEME.spacing.xl,
  },
  card: {
    width: '100%',
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: THEME.spacing.xl,
    paddingVertical: THEME.spacing.xl,
    alignItems: 'center',
    ...THEME.shadow,
  },
  icon: {
    fontSize: 44,
    marginBottom: THEME.spacing.sm,
  },
  headline: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.lpLoss,
    letterSpacing: 1,
    marginBottom: THEME.spacing.sm,
  },
  body: {
    fontSize: 16,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: THEME.spacing.md,
  },
  loserName: {
    fontWeight: 'bold',
    color: COLORS.lpLoss,
  },
  winnerName: {
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  divider: {
    height: 1,
    width: '100%',
    backgroundColor: COLORS.border,
    marginBottom: THEME.spacing.md,
  },
  confirmBtn: {
    width: '100%',
    height: 52,
    backgroundColor: COLORS.lpGain,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: THEME.spacing.sm,
    ...THEME.shadow,
    shadowColor: COLORS.lpGain,
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  confirmBtnText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
  undoBtn: {
    width: '100%',
    height: 48,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  undoBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
});

export default ConfirmWinModal;
