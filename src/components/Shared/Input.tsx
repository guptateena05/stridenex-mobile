import React, { forwardRef, useState } from 'react';
import { TextInput, TextInputProps, StyleSheet, Text, View, ViewStyle, TouchableOpacity } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export interface InputProps extends TextInputProps {
  error?: string | boolean;
  label?: string;
  containerStyle?: ViewStyle;
  disabled?: boolean;
  isPassword?: boolean;
}

export const Input = forwardRef<TextInput, InputProps>(
  ({ error, label, containerStyle, disabled, style, isPassword, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <View style={[styles.container, containerStyle]}>
        {label && <Text style={styles.label}>{label}</Text>}
        <View style={styles.inputWrapper}>
          <TextInput
            ref={ref}
            editable={!disabled}
            style={[
              styles.input,
              error ? styles.inputError : null,
              disabled ? styles.inputDisabled : null,
              isPassword ? { paddingRight: spacing.xl * 1.5 } : null,
              style
            ]}
            secureTextEntry={isPassword && !showPassword}
            placeholderTextColor={colors.text.secondary}
            {...props}
          />
          {isPassword && (
            <TouchableOpacity 
              style={styles.eyeBtn}
              onPress={() => setShowPassword(!showPassword)}
              activeOpacity={0.7}
            >
              {showPassword ? (
                <EyeOff size={20} color={colors.text.secondary} />
              ) : (
                <Eye size={20} color={colors.text.secondary} />
              )}
            </TouchableOpacity>
          )}
        </View>
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
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: '#ffffff',
    paddingHorizontal: spacing.md,
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    fontFamily: typography.fontFamily.display,
  },
  eyeBtn: {
    position: 'absolute',
    right: spacing.md,
    padding: spacing.xs,
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
