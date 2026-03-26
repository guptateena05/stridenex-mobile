import React, { forwardRef } from 'react';
import { TextInput, TextInputProps, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export interface InputProps extends TextInputProps {
  error?: string | boolean;
  label?: string;
  containerStyle?: ViewStyle;
  disabled?: boolean;
}

export const Input = forwardRef<TextInput, InputProps>(
  ({ error, label, containerStyle, disabled, style, ...props }, ref) => {
    return (
      <View style={[styles.container, containerStyle]}>
        {label && <Text style={styles.label}>{label}</Text>}
        <TextInput
          ref={ref}
          editable={!disabled}
          style={[
            styles.input,
            error ? styles.inputError : null,
            disabled ? styles.inputDisabled : null,
            style
          ]}
          placeholderTextColor={colors.text.secondary}
          {...props}
        />
        {typeof error === 'string' && error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : null}
      </View>
    );
  }
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
    width: '100%',
  },
  label: {
    fontFamily: typography.fontFamily.display,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: '#ffffff',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    fontFamily: typography.fontFamily.display,
  },
  inputError: {
    borderColor: colors.error,
  },
  inputDisabled: {
    backgroundColor: colors.background.light || '#f1f5f9',
    color: colors.text.secondary,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.fontSize.xs,
    marginTop: spacing.xs,
    fontFamily: typography.fontFamily.display,
  },
});
