import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useDuelStore } from '../../store/useDuelStore';
import { COLORS } from '../../constants/colors';
import { THEME } from '../../constants/theme';

interface CalculatorGridProps {
  activePlayerId: 'player1' | 'player2';
}

/**
 * CalculatorGrid Component: Keypad to input and apply LP changes.
 * Optimized for split-screen layouts with compact vertical footprints.
 */
export const CalculatorGrid: React.FC<CalculatorGridProps> = ({ activePlayerId }) => {
  const [inputValue, setInputValue] = useState<string>('0');
  const updateLp = useDuelStore((state) => state.updateLp);
  const remainingSeconds = useDuelStore((state) => state.matchTimer.remainingSeconds);

  const handleNumPress = (val: string) => {
    if (inputValue === '0' && val !== '00') {
      setInputValue(val);
    } else if (inputValue !== '0') {
      if (inputValue.length + val.length <= 5) {
        setInputValue((prev) => prev + val);
      }
    }
  };

  const handleClear = () => {
    setInputValue('0');
  };

  const handleLpChange = (type: 'gain' | 'loss') => {
    const amount = parseInt(inputValue, 10);
    if (amount > 0) {
      updateLp(activePlayerId, amount, type, remainingSeconds);
      setInputValue('0');
    }
  };

  const buttonValues = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '00', 'C'];

  return (
    <View style={styles.container}>
      {/* Sleek Input Preview Bar */}
      <View style={styles.displayContainer}>
        <Text style={styles.displayPrefix}>
          {inputValue === '0' ? '' : 'CHANGE: '}
        </Text>
        <Text style={styles.displayVal}>{inputValue}</Text>
      </View>
      
      {/* 3x4 Keypad Grid */}
      <View style={styles.grid}>
        {buttonValues.map((val) => (
          <TouchableOpacity
            key={val}
            style={styles.key}
            onPress={() => (val === 'C' ? handleClear() : handleNumPress(val))}
          >
            <Text style={styles.keyText}>{val}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tally Actions */}
      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.actionBtn, styles.lossBtn]} 
          onPress={() => handleLpChange('loss')}
        >
          <Text style={styles.actionBtnText}>LOSE (-)</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionBtn, styles.gainBtn]} 
          onPress={() => handleLpChange('gain')}
        >
          <Text style={styles.actionBtnText}>GAIN (+)</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    padding: THEME.spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  displayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: THEME.spacing.xs,
    backgroundColor: COLORS.background,
    paddingVertical: THEME.spacing.xs,
    borderRadius: 4,
    height: 36,
  },
  displayPrefix: {
    ...THEME.typography.bodyMedium,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  displayVal: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: THEME.spacing.xs,
  },
  key: {
    width: '31%',
    height: 38,
    backgroundColor: COLORS.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  keyText: {
    ...THEME.typography.bodyLarge,
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    marginTop: THEME.spacing.sm,
    justifyContent: 'space-between',
    gap: THEME.spacing.sm,
  },
  actionBtn: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
  },
  gainBtn: {
    backgroundColor: COLORS.lpGain,
  },
  lossBtn: {
    backgroundColor: COLORS.lpLoss,
  },
  actionBtnText: {
    ...THEME.typography.bodyMedium,
    color: '#FFF',
    fontWeight: 'bold',
  },
});

export default CalculatorGrid;
