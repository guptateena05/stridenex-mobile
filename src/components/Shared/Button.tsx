import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing, borderRadius } from '@/theme/spacing';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'outline' | 'ghost' | 'link' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  fullWidth = true,
}) => {
  const getVariantStyles = (): { button: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case 'primary':
        return {
          button: { backgroundColor: colors.primary.DEFAULT },
          text: { color: colors.text.inverse },
        };
      case 'secondary':
        return {
          button: { backgroundColor: colors.background.light, borderWidth: 1, borderColor: colors.border },
          text: { color: colors.text.primary },
        };
      case 'accent':
        return {
          button: { backgroundColor: colors.accent.DEFAULT },
          text: { color: colors.text.inverse },
        };
      case 'success':
        return {
          button: { backgroundColor: colors.success },
          text: { color: colors.text.inverse },
        };
      case 'outline':
        return {
          button: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.primary.DEFAULT },
          text: { color: colors.primary.DEFAULT },
        };
      case 'ghost':
        return {
          button: { backgroundColor: 'transparent' },
          text: { color: colors.text.primary },
        };
      case 'link':
        return {
          button: { backgroundColor: 'transparent', padding: 0 },
          text: { color: colors.primary.DEFAULT, textDecorationLine: 'underline' },
        };
      case 'destructive':
        return {
          button: { backgroundColor: colors.error },
          text: { color: colors.text.inverse },
        };
      default:
        return {
          button: { backgroundColor: colors.primary.DEFAULT },
          text: { color: colors.text.inverse },
        };
    }
  };

  const getSizeStyles = (): { button: ViewStyle; text: TextStyle } => {
    switch (size) {
      case 'sm':
        return { button: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md }, text: { fontSize: typography.fontSize.sm } };
      case 'lg':
        return { button: { paddingVertical: spacing.lg, paddingHorizontal: spacing.xl }, text: { fontSize: typography.fontSize.lg } };
      case 'xl':
        return { button: { paddingVertical: spacing.xl, paddingHorizontal: spacing['2xl'] }, text: { fontSize: typography.fontSize.xl } };
      case 'md':
      default:
        return { button: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg }, text: { fontSize: typography.fontSize.base } };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        styles.base,
        variantStyles.button,
        sizeStyles.button,
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variantStyles.text.color} />
      ) : (
        <Text style={[styles.textBase, variantStyles.text, sizeStyles.text, textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.6,
  },
  textBase: {
    fontFamily: typography.fontFamily.display,
    fontWeight: typography.fontWeight.medium,
  },
});
