import React from 'react';
import { TouchableOpacity, StyleSheet, Text, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';

interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
}

export const Checkbox = ({ checked, onCheckedChange, disabled, label }: CheckboxProps) => {
  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={() => onCheckedChange(!checked)}
      style={[styles.wrapper, disabled && styles.disabled]}
      activeOpacity={0.7}
    >
      <View style={[styles.container, checked && styles.checkedContainer]}>
        {checked && <Check size={14} color="#ffffff" strokeWidth={3} />}
      </View>
      {label && <Text style={styles.label}>{label}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  container: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  checkedContainer: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    marginLeft: spacing.sm,
    color: colors.text.secondary,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.display,
  }
});
