import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { THEME } from '../../constants/theme';

// ── Die face glyphs ───────────────────────────────────────────────────────────
const DIE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

// ── RNG primitives ────────────────────────────────────────────────────────────
function rollD6(): number {
  return Math.floor(Math.random() * 6) + 1;
}

function rollD20(): number {
  return Math.floor(Math.random() * 20) + 1;
}

function flipCoin(): 'Heads' | 'Tails' {
  return Math.random() < 0.5 ? 'Heads' : 'Tails';
}

// ── Result builders ───────────────────────────────────────────────────────────
function build2D6Label(a: number, b: number): string {
  return `${DIE_FACES[a - 1]} ${a} + ${DIE_FACES[b - 1]} ${b} = ${a + b}`;
}

function build2D6Total(a: number, b: number): number {
  return a + b;
}

// ── Types ─────────────────────────────────────────────────────────────────────
type RNGMode = '2D6' | '1D20' | 'Coin';

interface DiceResult {
  mode: '2D6' | '1D20';
  p1Label: string;
  p2Label: string;
  p1Total: number;
  p2Total: number;
}

interface CoinResult {
  mode: 'Coin';
  shared: string;
}

type RNGResult = DiceResult | CoinResult | null;

// ── Constants ─────────────────────────────────────────────────────────────────
const AUTO_DISMISS_MS = 3500;

// ── Component ─────────────────────────────────────────────────────────────────
export const RNGSuite: React.FC = () => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [result, setResult] = useState<RNGResult>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-dismiss result overlay after 3.5 s; clean up on unmount
  useEffect(() => {
    if (result !== null) {
      timeoutRef.current = setTimeout(() => setResult(null), AUTO_DISMISS_MS);
    }
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [result]);

  const clearTimer = () => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const handleSelect = (mode: RNGMode) => {
    setMenuVisible(false);
    clearTimer();

    if (mode === '2D6') {
      // Player 1 roll
      const p1a = rollD6(), p1b = rollD6();
      // Player 2 roll
      const p2a = rollD6(), p2b = rollD6();
      setResult({
        mode: '2D6',
        p1Label: build2D6Label(p1a, p1b),
        p2Label: build2D6Label(p2a, p2b),
        p1Total: build2D6Total(p1a, p1b),
        p2Total: build2D6Total(p2a, p2b),
      });
    } else if (mode === '1D20') {
      const p1 = rollD20();
      const p2 = rollD20();
      setResult({
        mode: '1D20',
        p1Label: `D20: ${p1}`,
        p2Label: `D20: ${p2}`,
        p1Total: p1,
        p2Total: p2,
      });
    } else {
      setResult({ mode: 'Coin', shared: flipCoin() });
    }
  };

  // ── Derived display helpers ────────────────────────────────────────────────
  const isTie =
    result !== null &&
    result.mode !== 'Coin' &&
    result.p1Total === result.p2Total;

  const p1Wins =
    result !== null &&
    result.mode !== 'Coin' &&
    result.p1Total > result.p2Total;

  const p2Wins =
    result !== null &&
    result.mode !== 'Coin' &&
    result.p2Total > result.p1Total;

  const getP1TextStyle = () => {
    if (result === null || result.mode === 'Coin') return styles.resultText;
    if (isTie) return styles.resultText;
    return p1Wins ? styles.resultTextWinner : styles.resultTextLoser;
  };

  const getP2TextStyle = () => {
    if (result === null || result.mode === 'Coin') return styles.resultText;
    if (isTie) return styles.resultText;
    return p2Wins ? styles.resultTextWinner : styles.resultTextLoser;
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Single compact trigger button ────────────────────────────────── */}
      <TouchableOpacity
        style={styles.rngButton}
        onPress={() => setMenuVisible(true)}
        accessibilityLabel="Open RNG menu"
      >
        <Text style={styles.rngButtonText}>🎲 RNG</Text>
      </TouchableOpacity>

      {/* ── Pick-mode menu modal ─────────────────────────────────────────── */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
        statusBarTranslucent
      >
        <TouchableOpacity
          style={styles.menuBackdrop}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuCard}>
            <Text style={styles.menuTitle}>Choose RNG Mode</Text>

            <TouchableOpacity
              style={styles.menuOption}
              onPress={() => handleSelect('2D6')}
            >
              <Text style={styles.menuOptionEmoji}>🎲</Text>
              <View>
                <Text style={styles.menuOptionLabel}>Roll 2D6</Text>
                <Text style={styles.menuOptionSub}>Each player rolls two dice</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuOption}
              onPress={() => handleSelect('1D20')}
            >
              <Text style={styles.menuOptionEmoji}>🎯</Text>
              <View>
                <Text style={styles.menuOptionLabel}>Roll 1D20</Text>
                <Text style={styles.menuOptionSub}>Each player rolls a D20</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuOption, styles.menuOptionLast]}
              onPress={() => handleSelect('Coin')}
            >
              <Text style={styles.menuOptionEmoji}>🪙</Text>
              <View>
                <Text style={styles.menuOptionLabel}>Flip Coin</Text>
                <Text style={styles.menuOptionSub}>Shared outcome for both players</Text>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ── Full-screen dual-facing result overlay ───────────────────────── */}
      <Modal
        visible={result !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setResult(null)}
        statusBarTranslucent
      >
        <View style={styles.overlay}>

          {/* ── Player 2 pane (top, rotated 180°) ── */}
          <View style={styles.halfPane}>
            <View style={styles.rotated}>
              {result?.mode === 'Coin' ? (
                <Text style={styles.resultText}>{result.shared}</Text>
              ) : result !== null ? (
                <>
                  <Text style={getP2TextStyle()}>{result.p2Label}</Text>
                  {isTie && <Text style={styles.tieLabel}>Tie!</Text>}
                </>
              ) : null}
            </View>
          </View>

          {/* ── Gold center divider ── */}
          <View style={styles.divider} />

          {/* ── Player 1 pane (bottom, standard orientation) ── */}
          <View style={styles.halfPane}>
            {result?.mode === 'Coin' ? (
              <Text style={styles.resultText}>{result.shared}</Text>
            ) : result !== null ? (
              <>
                <Text style={getP1TextStyle()}>{result.p1Label}</Text>
                {isTie && <Text style={styles.tieLabel}>Tie!</Text>}
              </>
            ) : null}
          </View>

        </View>
      </Modal>
    </>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // ── Trigger button ──────────────────────────────────────────────────────────
  rngButton: {
    paddingVertical: THEME.spacing.xs + 2,
    paddingHorizontal: THEME.spacing.sm + 4,
    borderRadius: 6,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rngButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.primary,
    letterSpacing: 0.3,
  },

  // ── Menu modal ──────────────────────────────────────────────────────────────
  menuBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuCard: {
    width: 280,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    ...THEME.shadow,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textMuted,
    letterSpacing: 1,
    textAlign: 'center',
    paddingVertical: THEME.spacing.sm + 2,
    paddingHorizontal: THEME.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.md,
    paddingVertical: THEME.spacing.md,
    paddingHorizontal: THEME.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuOptionLast: {
    borderBottomWidth: 0,
  },
  menuOptionEmoji: {
    fontSize: 28,
  },
  menuOptionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  menuOptionSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  // ── Result overlay ──────────────────────────────────────────────────────────
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.90)',
    flexDirection: 'column',
    zIndex: 9999,
    elevation: 9999,
  },
  halfPane: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: THEME.spacing.xl,
    gap: THEME.spacing.sm,
  },
  rotated: {
    transform: [{ rotate: '180deg' }],
    alignItems: 'center',
  },
  divider: {
    height: 2,
    backgroundColor: COLORS.primary,
    opacity: 0.5,
    marginHorizontal: THEME.spacing.xl,
  },

  // ── Result text variants ────────────────────────────────────────────────────
  resultText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    letterSpacing: 2,
    textShadowColor: COLORS.primaryDark,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  resultTextWinner: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.lpGain,       // Green — winner
    textAlign: 'center',
    letterSpacing: 2,
    textShadowColor: '#1a5c1a',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 14,
  },
  resultTextLoser: {
    fontSize: 44,
    fontWeight: '600',
    color: COLORS.textMuted,    // Dimmed — loser
    textAlign: 'center',
    letterSpacing: 2,
    opacity: 0.6,
  },
  tieLabel: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.warning,
    letterSpacing: 3,
    marginTop: THEME.spacing.xs,
    textShadowColor: '#7a4800',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
});

export default RNGSuite;
