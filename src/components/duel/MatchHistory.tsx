import React from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useDuelStore } from '../../store/useDuelStore';
import { formatTime } from '../../utils/timeFormatter';
import { COLORS } from '../../constants/colors';
import { THEME } from '../../constants/theme';
import { LPLogEntry } from '../../types';

/**
 * MatchHistory Component: Lists all previous and current LP adjustments grouped by duel.
 */
export const MatchHistory: React.FC = () => {
  const log = useDuelStore((state) => state.log);
  const pastDuels = useDuelStore((state) => state.pastDuels) || [];
  const undoLastChange = useDuelStore((state) => state.undoLastChange);

  const renderLogEntry = (item: LPLogEntry) => {
    const isLoss = item.type === 'loss';
    const sign = isLoss ? '-' : '+';
    const amountColor = isLoss ? COLORS.lpLoss : COLORS.lpGain;

    return (
      <View key={item.id} style={styles.logItem}>
        <View style={styles.logLeft}>
          <Text style={styles.playerName}>{item.playerName}</Text>
          <Text style={styles.timestamp}>
            Time: {formatTime(item.elapsedSeconds)}
          </Text>
        </View>
        <View style={styles.logRight}>
          <Text style={[styles.amount, { color: amountColor }]}>
            {sign}{item.changeAmount}
          </Text>
          <Text style={styles.transition}>
            {item.previousLp} → {item.newLp}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Render past duels if any */}
      {pastDuels.map((duel) => (
        <View key={`past-duel-${duel.gameNumber}`} style={styles.duelSection}>
          <View style={styles.duelHeader}>
            <Text style={styles.duelTitle}>⚔️ DUEL {duel.gameNumber}</Text>
            <Text style={styles.winnerBadge}>Winner: {duel.winnerName}</Text>
          </View>
          <View style={styles.duelBody}>
            {duel.log.length === 0 ? (
              <Text style={styles.emptyText}>No LP changes recorded.</Text>
            ) : (
              duel.log.map(renderLogEntry)
            )}
          </View>
        </View>
      ))}

      {/* Render current duel */}
      {(log.length > 0 || pastDuels.length === 0) && (
        <View style={styles.duelSection}>
          <View style={[styles.duelHeader, styles.currentDuelHeader]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={styles.currentDuelTitle}>⚔️ DUEL {pastDuels.length + 1}</Text>
              <Text style={styles.currentBadge}>Current</Text>
            </View>
            {log.length > 0 && (
              <TouchableOpacity style={styles.undoBtn} onPress={undoLastChange}>
                <Text style={styles.undoText}>UNDO</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.duelBody}>
            {log.length === 0 ? (
              <Text style={styles.emptyText}>No LP changes recorded yet.</Text>
            ) : (
              [...log].reverse().map(renderLogEntry)
            )}
          </View>
        </View>
      )}

      {pastDuels.length === 0 && log.length === 0 && (
        <View style={styles.emptyMatch}>
          <Text style={styles.emptyMatchText}>No changes recorded yet in this match.</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: THEME.spacing.lg,
  },
  duelSection: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: THEME.spacing.md,
    overflow: 'hidden',
  },
  duelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: THEME.spacing.sm + 2,
    paddingHorizontal: THEME.spacing.md,
    backgroundColor: COLORS.surfaceElevated,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  currentDuelHeader: {
    borderBottomColor: COLORS.primary,
  },
  duelTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    letterSpacing: 1,
  },
  currentDuelTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
    letterSpacing: 1,
  },
  winnerBadge: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.lpGain,
    backgroundColor: 'rgba(76,175,80,0.1)',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  currentBadge: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.primary,
    backgroundColor: 'rgba(212,175,55,0.1)',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  duelBody: {
    paddingHorizontal: THEME.spacing.sm,
  },
  logItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: THEME.spacing.sm,
    paddingHorizontal: THEME.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  logLeft: {
    justifyContent: 'center',
  },
  playerName: {
    ...THEME.typography.bodyLarge,
    fontWeight: '600',
    color: COLORS.text,
  },
  timestamp: {
    ...THEME.typography.bodyMedium,
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  logRight: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  transition: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  emptyText: {
    ...THEME.typography.bodyMedium,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingVertical: THEME.spacing.md,
    fontStyle: 'italic',
  },
  emptyMatch: {
    paddingVertical: THEME.spacing.xl * 2,
    alignItems: 'center',
  },
  emptyMatchText: {
    ...THEME.typography.bodyLarge,
    color: COLORS.textMuted,
  },
  undoBtn: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: COLORS.lpLoss,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  undoText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
    letterSpacing: 0.5,
  },
});

export default MatchHistory;
