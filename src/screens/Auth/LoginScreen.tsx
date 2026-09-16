import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Input } from '@/components/Shared/Input';
import { Button } from '@/components/Shared/Button';
import { Checkbox } from '@/components/Shared/Checkbox';
import { AnimatedAuthLayout } from '@/components/layout/AnimatedAuthLayout';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/api/api.services';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';
import { useNavigation } from '@react-navigation/native';
import { X, Check } from 'lucide-react-native';

export const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordError, setForgotPasswordError] = useState('');
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const { login } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (resendCooldown > 0) {
      timer = setTimeout(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [resendCooldown]);

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail || !/^\S+@\S+\.\S+$/.test(forgotPasswordEmail)) {
      setForgotPasswordError('Please enter a valid email address.');
      return;
    }

    setForgotPasswordLoading(true);
    setForgotPasswordError('');
    setForgotPasswordSuccess(false);

    try {
      const response = await api.post('method/stridenex_app.api_stridenex_app.app.forgot_password', {
        email: forgotPasswordEmail
      });

      const data = response.data;
      if (data?.message === "Password reset instructions have been sent to your email" || data?.message) {
        setForgotPasswordSuccess(true);
        setResendCooldown(300);
      } else {
        setForgotPasswordError(data?.message || 'Failed to send password reset email.');
      }
    } catch (err: any) {
      setForgotPasswordError(err?.response?.data?.message || err?.message || 'An error occurred.');
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post(
        'method/stridenex_app.api_stridenex_app.app.login',
        { usr: username, pwd: password }
      );
      console.log('Login response:', response.data);
      const data = response.data;

      if (data.message === "Logged In") {
        const { api_key, api_secret } = data.key_details || {};
        const token = api_key && api_secret ? `${api_key}:${api_secret}` : 'dummy-token';

        let userRole = 'Student';
        if (data.roles && Array.isArray(data.roles)) {
          const lowerRoles = data.roles.map((r: string) => r.toLowerCase());
          if (lowerRoles.some((r: string) => r.includes('college'))) userRole = 'College';
          else if (lowerRoles.some((r: string) => r.includes('industry'))) userRole = 'Industry';
          else if (lowerRoles.some((r: string) => r.includes('mentor'))) userRole = 'Mentor';
        }

        const userEmail = data.user || username;
        await AsyncStorage.setItem("userEmail", userEmail);

        const userDetails = {
          full_name: data.full_name || '',
          username: username
        };

        if (userRole === 'Industry') {
          const isOnboardedVal = parseInt(data.is_onboarded ?? '0', 10);
          if (isOnboardedVal < 3) {
            const userEmail = data.user || username;
            await AsyncStorage.setItem('userEmail', userEmail);
            const webOnboardingUrl = `https://testwebstridenex.quantcloud.in/onboarding/industry?source=mobile&apiKey=${encodeURIComponent(api_key || '')}&apiSecret=${encodeURIComponent(api_secret || '')}`;
            (navigation as any).navigate('WebOnboarding', {
              url: webOnboardingUrl,
              sessionData: {
                apiKey: api_key || '',
                apiSecret: api_secret || '',
                email: userEmail,
                isOnboarded: String(isOnboardedVal),
                fullName: data.full_name || '',
                role: 'industry',
              }
            });
            return;
          }
        }

        if (userRole === 'Mentor') {
          const isOnboardedVal = parseInt(data.is_onboarded ?? '0', 10);
          if (isOnboardedVal < 3) {
            const userEmail = data.user || username;
            await AsyncStorage.setItem('userEmail', userEmail);
            const webOnboardingUrl = `https://testwebstridenex.quantcloud.in/onboarding/mentor?source=mobile&apiKey=${encodeURIComponent(api_key || '')}&apiSecret=${encodeURIComponent(api_secret || '')}`;
            (navigation as any).navigate('WebOnboarding', {
              url: webOnboardingUrl,
              sessionData: {
                apiKey: api_key || '',
                apiSecret: api_secret || '',
                email: userEmail,
                isOnboarded: String(isOnboardedVal),
                fullName: data.full_name || '',
                role: 'mentor',
              }
            });
            return;
          }
        }

        if (userRole === 'College') {
          const isOnboardedVal = parseInt(data.is_onboarded ?? '0', 10);
          if (isOnboardedVal < 4) {
            const userEmail = data.user || username;
            await AsyncStorage.setItem('userEmail', userEmail);
            const webOnboardingUrl = `https://testwebstridenex.quantcloud.in/onboarding/college?source=mobile&apiKey=${encodeURIComponent(api_key || '')}&apiSecret=${encodeURIComponent(api_secret || '')}`;
            (navigation as any).navigate('WebOnboarding', {
              url: webOnboardingUrl,
              sessionData: {
                apiKey: api_key || '',
                apiSecret: api_secret || '',
                email: userEmail,
                isOnboarded: String(isOnboardedVal),
                fullName: data.full_name || '',
                role: 'college',
              }
            });
            return;
          }
        }

        if (userRole === 'Student') {
          const isOnboardedVal = parseInt(data.is_onboarded ?? '0', 10);
          if (isOnboardedVal < 2) {
            const userEmail = data.user || username;
            await AsyncStorage.setItem('userEmail', userEmail);
            await AsyncStorage.setItem('studentOnboardingStep', String(isOnboardedVal));
            if (data.full_name) {
              const nameParts = data.full_name.trim().split(/\s+/);
              const firstName = nameParts[0] || '';
              const lastName = nameParts.slice(1).join(' ') || '';
              await AsyncStorage.setItem('userFirstName', firstName);
              await AsyncStorage.setItem('userLastName', lastName);
            }
            (navigation as any).navigate('StudentOnboarding');
            return;
          }
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await login(userRole as any, token, userDetails);
      } else {
        setError(data.message || 'Login failed');
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err?.response?.data?.message || err?.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedAuthLayout
      title="Welcome Back"
      subtitle="Sign in to continue your skill development journey"
    >
      <View style={styles.formContainer}>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Input
          label="Email or Username"
          placeholder="student@college.edu"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        <Input
          label="Password"
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          isPassword
        />

        <View style={styles.optionsRow}>
          <Checkbox
            checked={rememberMe}
            onCheckedChange={setRememberMe}
            label="Remember me"
          />
          <Button
            title="Forgot password?"
            variant="link"
            onPress={() => {
              if (username) {
                setForgotPasswordEmail(username);
              }
              setShowForgotPasswordModal(true);
            }}
            style={styles.forgotBtn}
          />
        </View>

        <Button
          title="Sign In"
          onPress={handleLogin}
          loading={loading}
          variant="accent"
          style={styles.signInButton}
        />

        <View style={styles.signupLinkRow}>
          <Text style={styles.promptText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Signup' as never)}>
            <Text style={styles.linkText}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={showForgotPasswordModal}
        transparent
        animationType="fade"
        onRequestClose={() => !forgotPasswordLoading && setShowForgotPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Reset Password</Text>
              <TouchableOpacity
                onPress={() => setShowForgotPasswordModal(false)}
                disabled={forgotPasswordLoading}
                style={styles.closeButton}
              >
                <X size={24} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              {forgotPasswordSuccess ? (
                <View style={styles.successContainer}>
                  <View style={styles.successIconContainer}>
                    <Check size={28} color={colors.success} />
                  </View>
                  <Text style={styles.successTitle}>Email Sent!</Text>
                  <Text style={styles.successText}>
                    We've sent a password reset link to <Text style={{ fontWeight: 'bold' }}>{forgotPasswordEmail}</Text>. Please check your inbox.
                  </Text>
                  {forgotPasswordError ? (
                    <Text style={styles.modalErrorText}>{forgotPasswordError}</Text>
                  ) : null}
                  
                  <View style={styles.modalActionsRow}>
                    <Button
                      title="Close"
                      variant="secondary"
                      size="sm"
                      onPress={() => setShowForgotPasswordModal(false)}
                      style={styles.flexButton}
                    />
                    <Button
                      title={resendCooldown > 0 ? `Resend in ${Math.floor(resendCooldown / 60)}:${(resendCooldown % 60).toString().padStart(2, '0')}` : "Resend Email"}
                      variant="accent"
                      size="sm"
                      disabled={resendCooldown > 0 || forgotPasswordLoading}
                      loading={forgotPasswordLoading}
                      onPress={handleForgotPassword}
                      style={styles.flexButton}
                    />
                  </View>
                </View>
              ) : (
                <View style={styles.forgotFormContainer}>
                  <Text style={styles.modalInstructionText}>
                    Enter your email address and we'll send you a link to reset your password.
                  </Text>
                  <Input
                    label="Email Address"
                    placeholder="you@example.com"
                    value={forgotPasswordEmail}
                    onChangeText={setForgotPasswordEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                  {forgotPasswordError ? (
                    <Text style={styles.modalErrorText}>{forgotPasswordError}</Text>
                  ) : null}
                  
                  <Button
                    title="Send Reset Link"
                    variant="accent"
                    size="sm"
                    loading={forgotPasswordLoading}
                    disabled={forgotPasswordLoading}
                    onPress={handleForgotPassword}
                    style={{ marginTop: spacing.sm }}
                  />
                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </AnimatedAuthLayout>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    width: '100%',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    flexWrap: 'wrap',
  },
  forgotBtn: {
    padding: 0,
    marginTop: -spacing.xs,
  },
  errorText: {
    color: colors.error,
    marginBottom: spacing.md,
    textAlign: 'center',
    fontFamily: typography.fontFamily.display,
  },
  signInButton: {
    marginTop: spacing.md,
  },
  signupLinkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  promptText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  linkText: {
    fontSize: typography.fontSize.sm,
    color: colors.accent.DEFAULT,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.background.light,
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  closeButton: {
    padding: spacing.xs,
  },
  modalBody: {
    padding: spacing.lg,
  },
  successContainer: {
    alignItems: 'center',
  },
  successIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  successTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  successText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  modalErrorText: {
    color: colors.error,
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  modalActionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
    marginTop: spacing.md,
  },
  flexButton: {
    flex: 1,
  },
  forgotFormContainer: {
    width: '100%',
  },
  modalInstructionText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  }
});
