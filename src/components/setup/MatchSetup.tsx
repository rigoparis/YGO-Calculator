import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDuelStore } from '../../store/useDuelStore';
import { MatchFormat } from '../../types';
import { COLORS } from '../../constants/colors';
import { THEME } from '../../constants/theme';

// ─── RNG helpers ──────────────────────────────────────────────────────────────
const DIE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

const rollD6 = () => Math.floor(Math.random() * 6) + 1;
const rollD20 = () => Math.floor(Math.random() * 20) + 1;
const flipCoin = (): 'Heads' | 'Tails' => (Math.random() < 0.5 ? 'Heads' : 'Tails');

const build2D6 = () => {
  const a = rollD6(), b = rollD6();
  return { label: `${DIE_FACES[a - 1]}${DIE_FACES[b - 1]}  ${a} + ${b} = ${a + b}`, total: a + b };
};

// ─── Types ────────────────────────────────────────────────────────────────────
type RNGMode = '2D6' | '1D20' | 'Coin';

interface DiceRNGResult {
  mode: '2D6' | '1D20';
  p1Label: string;
  p2Label: string;
  p1Total: number;
  p2Total: number;
}
interface CoinRNGResult {
  mode: 'Coin';
  shared: string;
}
type RNGResult = DiceRNGResult | CoinRNGResult | null;

// ─── Format options ───────────────────────────────────────────────────────────
const FORMAT_OPTIONS: { label: string; value: MatchFormat }[] = [
  { label: 'Best of 1', value: 1 },
  { label: 'Best of 3', value: 3 },
  { label: 'Best of 5', value: 5 },
];

// ─── Component ────────────────────────────────────────────────────────────────
const MatchSetup: React.FC = () => {
  const setMatchConfig = useDuelStore((s) => s.setMatchConfig);

  const storeP1Name = useDuelStore((s) => s.player1Name);
  const storeP2Name = useDuelStore((s) => s.player2Name);

  const [p1Name, setP1Name] = useState(storeP1Name);
  const [p2Name, setP2Name] = useState(storeP2Name);
  const [format, setFormat] = useState<MatchFormat>(3);
  const [rollMode, setRollMode] = useState<'highest' | 'lowest'>('highest');
  const [rngResult, setRngResult] = useState<RNGResult>(null);

  const handleRNG = (mode: RNGMode) => {
    if (mode === '2D6') {
      const p1 = build2D6();
      const p2 = build2D6();
      setRngResult({ mode: '2D6', p1Label: p1.label, p2Label: p2.label, p1Total: p1.total, p2Total: p2.total });
    } else if (mode === '1D20') {
      const p1 = rollD20(), p2 = rollD20();
      setRngResult({ mode: '1D20', p1Label: `D20: ${p1}`, p2Label: `D20: ${p2}`, p1Total: p1, p2Total: p2 });
    } else {
      setRngResult({ mode: 'Coin', shared: flipCoin() });
    }
  };

  const handleStart = () => {
    setMatchConfig(
      p1Name.trim() || 'Player 1',
      p2Name.trim() || 'Player 2',
      format,
    );
  };

  // ── Derived result display ─────────────────────────────────────────────────
  const isTie = rngResult?.mode !== 'Coin' && rngResult !== null && rngResult.p1Total === rngResult.p2Total;
  const p1Wins = rngResult?.mode !== 'Coin' && rngResult !== null && !isTie && (
    rollMode === 'highest' ? rngResult.p1Total > rngResult.p2Total : rngResult.p1Total < rngResult.p2Total
  );
  const p2Wins = rngResult?.mode !== 'Coin' && rngResult !== null && !isTie && (
    rollMode === 'highest' ? rngResult.p2Total > rngResult.p1Total : rngResult.p2Total < rngResult.p1Total
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          {/* ── Header ────────────────────────────────────────────────────── */}
          <View style={styles.header}>
            <Text style={styles.headerEyebrow}>YU-GI-OH! CALCULATOR</Text>
            <Text style={styles.headerTitle}>Match Setup</Text>
            <View style={styles.headerDivider} />
          </View>

          {/* ── Player Names ──────────────────────────────────────────────── */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>PLAYER NAMES</Text>

            <View style={styles.inputRow}>
              <Text style={styles.inputPip}>P1</Text>
              <TextInput
                style={styles.textInput}
                value={p1Name}
                onChangeText={setP1Name}
                placeholder="Player 1"
                placeholderTextColor={COLORS.textMuted}
                maxLength={18}
                returnKeyType="next"
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputRow}>
              <Text style={styles.inputPip}>P2</Text>
              <TextInput
                style={styles.textInput}
                value={p2Name}
                onChangeText={setP2Name}
                placeholder="Player 2"
                placeholderTextColor={COLORS.textMuted}
                maxLength={18}
                returnKeyType="done"
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* ── Match Format ──────────────────────────────────────────────── */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>MATCH FORMAT</Text>
            <View style={styles.segmentRow}>
              {FORMAT_OPTIONS.map((opt) => {
                const active = format === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.segment, active && styles.segmentActive]}
                    onPress={() => setFormat(opt.value)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: active }}
                  >
                    <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* ── Starting Player RNG ───────────────────────────────────────── */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>DECIDE WHO GOES FIRST</Text>

            {/* Roll Mode Selector */}
            <View style={styles.rollModeContainer}>
              {(['highest', 'lowest'] as const).map((mode) => {
                const active = rollMode === mode;
                return (
                  <TouchableOpacity
                    key={mode}
                    style={[styles.rollModeSegment, active && styles.rollModeSegmentActive]}
                    onPress={() => setRollMode(mode)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: active }}
                  >
                    <Text style={[styles.rollModeSegmentText, active && styles.rollModeSegmentTextActive]}>
                      {mode === 'highest' ? '📈 Highest Wins' : '📉 Lowest Wins'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.rngButtonRow}>
              {(['2D6', '1D20', 'Coin'] as RNGMode[]).map((mode) => (
                <TouchableOpacity
                  key={mode}
                  style={styles.rngBtn}
                  onPress={() => handleRNG(mode)}
                >
                  <Text style={styles.rngBtnEmoji}>
                    {mode === '2D6' ? '🎲' : mode === '1D20' ? '🎯' : '🪙'}
                  </Text>
                  <Text style={styles.rngBtnLabel}>
                    {mode === '2D6' ? 'Roll 2D6' : mode === '1D20' ? 'Roll 1D20' : 'Flip Coin'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Result card */}
            {rngResult !== null && (
              <View style={styles.rngResultCard}>
                {rngResult.mode === 'Coin' ? (
                  <>
                    <Text style={styles.rngResultTitle}>Coin Flip</Text>
                    <Text style={styles.rngResultShared}>{rngResult.shared}</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.rngResultTitle}>
                      {rngResult.mode === '2D6' ? '2D6 Roll' : 'D20 Roll'}
                    </Text>

                    {/* Head-to-head row */}
                    <View style={styles.rngDuelRow}>
                      {/* Player 1 */}
                      <View style={styles.rngPlayerCol}>
                        <Text style={styles.rngPlayerTag}>
                          {p1Name.trim() || 'Player 1'}
                        </Text>
                        <Text
                          style={[
                            styles.rngScore,
                            p1Wins && styles.rngScoreWinner,
                            p2Wins && styles.rngScoreLoser,
                          ]}
                        >
                          {rngResult.p1Label}
                        </Text>
                        {p1Wins && <Text style={styles.rngWinBadge}>⚡ Goes First</Text>}
                      </View>

                      <Text style={styles.rngVs}>VS</Text>

                      {/* Player 2 */}
                      <View style={styles.rngPlayerCol}>
                        <Text style={styles.rngPlayerTag}>
                          {p2Name.trim() || 'Player 2'}
                        </Text>
                        <Text
                          style={[
                            styles.rngScore,
                            p2Wins && styles.rngScoreWinner,
                            p1Wins && styles.rngScoreLoser,
                          ]}
                        >
                          {rngResult.p2Label}
                        </Text>
                        {p2Wins && <Text style={styles.rngWinBadge}>⚡ Goes First</Text>}
                      </View>
                    </View>

                    {isTie && (
                      <Text style={styles.rngTieLabel}>🤝 It's a Tie — Roll Again!</Text>
                    )}
                  </>
                )}
              </View>
            )}
          </View>

          {/* Spacer so the START button doesn't sit flush at the bottom */}
          <View style={styles.spacer} />

        </ScrollView>

        {/* ── START MATCH button — pinned outside ScrollView so it stays visible ── */}
        <View style={styles.startWrapper}>
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStart}
            accessibilityRole="button"
            accessibilityLabel="Start match"
          >
            <Text style={styles.startButtonText}>⚔️  START MATCH</Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.lg,
    paddingBottom: THEME.spacing.xl,
  },

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    alignItems: 'center',
    marginBottom: THEME.spacing.xl,
  },
  headerEyebrow: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.textMuted,
    letterSpacing: 3,
    marginBottom: THEME.spacing.xs,
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.primary,
    letterSpacing: 1,
    textShadowColor: COLORS.primaryDark,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  headerDivider: {
    marginTop: THEME.spacing.sm,
    height: 2,
    width: 60,
    backgroundColor: COLORS.primary,
    borderRadius: 1,
    opacity: 0.6,
  },

  // ── Section ───────────────────────────────────────────────────────────────
  section: {
    marginBottom: THEME.spacing.xl,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.textMuted,
    letterSpacing: 2,
    marginBottom: THEME.spacing.sm,
  },

  // ── Inputs ────────────────────────────────────────────────────────────────
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.sm,
    marginBottom: THEME.spacing.sm,
  },
  inputPip: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.primary,
    width: 22,
    textAlign: 'center',
  },
  textInput: {
    flex: 1,
    height: 48,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: THEME.spacing.md,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },

  // ── Format selector ───────────────────────────────────────────────────────
  segmentRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  segment: {
    flex: 1,
    paddingVertical: THEME.spacing.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentActive: {
    backgroundColor: COLORS.primary,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.textMuted,
  },
  segmentTextActive: {
    color: COLORS.background,
  },

  // ── RNG section ───────────────────────────────────────────────────────────
  rollModeContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    marginBottom: THEME.spacing.sm,
  },
  rollModeSegment: {
    flex: 1,
    paddingVertical: THEME.spacing.xs + 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rollModeSegmentActive: {
    backgroundColor: COLORS.primary,
  },
  rollModeSegmentText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  rollModeSegmentTextActive: {
    color: COLORS.background,
    fontWeight: 'bold',
  },
  rngButtonRow: {
    flexDirection: 'row',
    gap: THEME.spacing.sm,
    marginBottom: THEME.spacing.md,
  },
  rngBtn: {
    flex: 1,
    paddingVertical: THEME.spacing.sm + 2,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    gap: THEME.spacing.xs,
  },
  rngBtnEmoji: {
    fontSize: 22,
  },
  rngBtnLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },

  // ── RNG result card ───────────────────────────────────────────────────────
  rngResultCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: THEME.spacing.md,
    alignItems: 'center',
    ...THEME.shadow,
  },
  rngResultTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.textMuted,
    letterSpacing: 2,
    marginBottom: THEME.spacing.md,
  },
  rngResultShared: {
    fontSize: 40,
    fontWeight: 'bold',
    color: COLORS.primary,
    textShadowColor: COLORS.primaryDark,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },

  // Head-to-head layout
  rngDuelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: THEME.spacing.sm,
  },
  rngPlayerCol: {
    flex: 1,
    alignItems: 'center',
    gap: THEME.spacing.xs,
  },
  rngPlayerTag: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.textMuted,
    letterSpacing: 1,
  },
  rngScore: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
  },
  rngScoreWinner: {
    color: COLORS.lpGain,
    fontSize: 20,
    textShadowColor: '#1a5c1a',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  rngScoreLoser: {
    color: COLORS.textMuted,
    opacity: 0.55,
    fontSize: 16,
  },
  rngWinBadge: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.lpGain,
    letterSpacing: 0.5,
  },
  rngVs: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.border,
    letterSpacing: 2,
  },
  rngTieLabel: {
    marginTop: THEME.spacing.sm,
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.warning,
    letterSpacing: 1,
  },

  // ── Spacer ────────────────────────────────────────────────────────────────
  spacer: {
    height: THEME.spacing.xl,
  },

  // ── Start button ──────────────────────────────────────────────────────────
  startWrapper: {
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  startButton: {
    height: 50,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    ...THEME.shadow,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 10,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.background,
    letterSpacing: 2,
  },
});

export default MatchSetup;
