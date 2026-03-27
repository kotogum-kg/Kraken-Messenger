/**
 * PIN Input Component
 */
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Animated } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

interface PINInputProps {
  length?: number;
  onComplete: (pin: string) => void;
  error?: boolean;
  autoFocus?: boolean;
}

export const PINInput: React.FC<PINInputProps> = ({ 
  length = 4, 
  onComplete, 
  error = false,
  autoFocus = true 
}) => {
  const [pin, setPin] = useState('');
  const inputRef = useRef<TextInput>(null);
  const shakeAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (error) {
      // Shake animation on error
      Animated.sequence([
        Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
      
      // Clear PIN on error
      setPin('');
    }
  }, [error, shakeAnimation]);

  const handleChange = (text: string) => {
    // Only allow numbers
    const numericText = text.replace(/[^0-9]/g, '');
    
    if (numericText.length <= length) {
      setPin(numericText);
      
      if (numericText.length === length) {
        onComplete(numericText);
      }
    }
  };

  const renderDots = () => {
    const dots = [];
    for (let i = 0; i < length; i++) {
      const isFilled = i < pin.length;
      dots.push(
        <View
          key={i}
          style={[
            styles.dot,
            isFilled && styles.dotFilled,
            error && styles.dotError,
          ]}
        >
          {isFilled && <View style={styles.dotInner} />}
        </View>
      );
    }
    return dots;
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.dotsContainer, { transform: [{ translateX: shakeAnimation }] }]}>
        {renderDots()}
      </Animated.View>
      
      <TextInput
        ref={inputRef}
        style={styles.hiddenInput}
        value={pin}
        onChangeText={handleChange}
        keyboardType="number-pad"
        maxLength={length}
        autoFocus={autoFocus}
        secureTextEntry
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  dot: {
    width: 50,
    height: 50,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotFilled: {
    borderColor: COLORS.neonBlue,
    backgroundColor: COLORS.neonBlue + '20',
  },
  dotError: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.error + '20',
  },
  dotInner: {
    width: 16,
    height: 16,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.neonBlue,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
});
