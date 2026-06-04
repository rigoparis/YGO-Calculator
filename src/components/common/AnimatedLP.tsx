import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import AnimatedNumbers from 'react-native-animated-numbers';
import { COLORS } from '../../constants/colors';
import { THEME } from '../../constants/theme';

interface AnimatedLPProps {
  value: number;
  color?: string;
}

/**
 * AnimatedLP Component: Renders Life Points with a smooth rolling counter animation.
 */
export const AnimatedLP: React.FC<AnimatedLPProps> = ({
  value,
  color = COLORS.text,
}) => {
  return (
    <View style={styles.container}>
      <AnimatedNumbers
        animateToNumber={value}
        fontStyle={[THEME.typography.lpDisplay, { color }]}
        animationDuration={500}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: THEME.spacing.sm,
  },
});

export default AnimatedLP;
