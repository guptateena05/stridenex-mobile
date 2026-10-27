import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Input } from '@/components/Shared/Input';
import { Button } from '@/components/Shared/Button';
import { Checkbox } from '@/components/Shared/Checkbox';
import { AnimatedAuthLayout } from '@/components/layout/AnimatedAuthLayout';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/api/api.services';
import { sendEmailOTP, verifyEmailOTP } from '@/api/onboarding.services';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';
import { useNavigation } from '@react-navigation/native';
import { X, Check, Lock, RotateCw, ArrowRight } from 'lucide-react-native';

export const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // ─── Forgot / Reset Password state ──────────────────────────────────────────
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [resetStep, setResetStep] = useState<'email' | 'otp' | 'password' | 'success'>('email');
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSuccessMessage, setOtpSuccessMessage] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordError, setForgotPasswordError] = useState('');
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

  // ─── Password Rules Validation (Identical to Signup) ────────────────────────
  const passwordCriteria = {
    length: newPassword.length >= 8,
    uppercase: /[A-Z]/.test(newPassword),
    lowercase: /[a-z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword),
    match: newPassword.length > 0 && newPassword === confirmPassword,
  };

  const isPasswordValid =
    passwordCriteria.length &&
    passwordCriteria.uppercase &&
    passwordCriteria.lowercase &&
    passwordCriteria.number &&
    passwordCriteria.special &&
    passwordCriteria.match;

  // ─── Forgot Password Handlers ────────────────────────────────────────────────
  const handleOpenForgotPassword = () => {
    setForgotPasswordEmail('');
    setResetStep('email');
    setOtp('');
    setOtpSuccessMessage('');
    setNewPassword('');
    setConfirmPassword('');
    setForgotPasswordError('');
    setShowForgotPasswordModal(true);
  };

  const handleSendOtp = async () => {
    if (!forgotPasswordEmail || !/^\S+@\S+\.\S+$/.test(forgotPasswordEmail.trim())) {
      setForgotPasswordError('Please enter a valid email address.');
      return;
    }

    setForgotPasswordLoading(true);
    setForgotPasswordError('');

    try {
      const response = await sendEmailOTP(forgotPasswordEmail.trim());
      if (
        response?.message?.status === 'success' ||
        response?.message?.message === 'OTP sent successfully' ||
        (response as any)?.message === 'OTP sent successfully' ||
        (response as any)?.status === 'success'
      ) {
        setResetStep('otp');
        setResendCooldown(60);
      } else if (response?.message) {
        setResetStep('otp');
        setResendCooldown(60);
      } else {
        setForgotPasswordError((response as any)?.message || 'Failed to send OTP. Please check the email.');
      }
    } catch (err: any) {
      console.error('Error sending OTP:', err);
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to send OTP. Please try again.';
      setForgotPasswordError(typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg));
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.trim().length < 4) {
      setForgotPasswordError('Please enter the verification code sent to your email.');
      return;
    }

    setForgotPasswordLoading(true);
    setForgotPasswordError('');

    try {
      const response = await verifyEmailOTP(forgotPasswordEmail.trim(), otp.trim());
      const msg = response?.message;
      const isSuccess =
        msg === 'Email verified successfully' ||
        response?.status === 200 ||
        response?.data?.success === true ||
        (typeof msg === 'string' && !msg.toLowerCase().includes('invalid'));

      if (isSuccess) {
        setForgotPasswordError('');
        const successMsg = typeof msg === 'string' ? msg : 'Email verified successfully';
        setOtpSuccessMessage(successMsg);
        setForgotPasswordLoading(false);
        setTimeout(() => {
          setResetStep('password');
          setOtpSuccessMessage('');
        }, 2000);
        return;
      } else {
        setForgotPasswordError(
          typeof msg === 'string' ? msg : 'Invalid OTP. Please check the code and try again.'
        );
      }
    } catch (err: any) {
      console.error('Error verifying OTP:', err);
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Invalid OTP. Please check the code and try again.';
      setForgotPasswordError(typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg));
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!isPasswordValid) {
      if (!passwordCriteria.match) {
        setForgotPasswordError('Passwords do not match.');
      } else {
        setForgotPasswordError('Please satisfy all password security requirements.');
      }
      return;
    }

    setForgotPasswordLoading(true);
    setForgotPasswordError('');

    try {
      await api.post('method/stridenex_app.api_stridenex_app.app.reset_user_password', {
        user: forgotPasswordEmail.trim(),
        new_password: newPassword,
      });

      // Synchronize in AsyncStorage
      await AsyncStorage.setItem('userEmail', forgotPasswordEmail.trim());
      await AsyncStorage.setItem('userPassword', newPassword);

      Keyboard.dismiss();
      setResetStep('success');
    } catch (err: any) {
      console.error('Error resetting password:', err);
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to reset password. Please try again.';
      setForgotPasswordError(typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg));
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleBackToLoginAfterSuccess = () => {
    Keyboard.dismiss();
    setShowForgotPasswordModal(false);
    setUsername(forgotPasswordEmail.trim());
    setPassword('');
    setSuccessBanner('Password reset successfully! Please sign in with your new password.');
    setResetStep('email');
  };

  // ─── Login handler ────────────────────────────────────────────────────────────
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

        const storedFirstName = await AsyncStorage.getItem('userFirstName');
        const storedLastName = await AsyncStorage.getItem('userLastName');
        const storedPassword = await AsyncStorage.getItem('userPassword');
        const nameParts = (data.full_name || '').trim().split(/\s+/);
        const resolvedFirst = (storedFirstName && storedFirstName !== 'Test') ? storedFirstName : (nameParts[0] || '');
        const resolvedLast = (storedLastName && storedLastName !== 'User') ? storedLastName : (nameParts.length > 1 ? nameParts.slice(1).join(' ') : '') || '';
        const resolvedPassword = storedPassword || password || '';

        // Avoid overwriting with "Test User" if registered name exists
        let effectiveFullName = data.full_name || '';
        if ((!effectiveFullName || effectiveFullName === 'Test User') && resolvedFirst) {
          effectiveFullName = `${resolvedFirst} ${resolvedLast}`.trim();
        }

        const userDetails = {
          full_name: effectiveFullName,
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
                fullName: effectiveFullName,
                firstName: resolvedFirst,
                lastName: resolvedLast,
                userPassword: resolvedPassword,
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
                fullName: effectiveFullName,
                firstName: resolvedFirst,
                lastName: resolvedLast,
                userPassword: resolvedPassword,
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
                fullName: effectiveFullName,
                firstName: resolvedFirst,
                lastName: resolvedLast,
                userPassword: resolvedPassword,
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
        {successBanner ? (
          <View style={styles.successBanner}>
            <View style={styles.successBannerIcon}>
              <Check size={16} color={colors.success} strokeWidth={2.5} />
            </View>
            <Text style={styles.successBannerText}>{successBanner}</Text>
          </View>
        ) : null}

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
            onPress={handleOpenForgotPassword}
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
        onRequestClose={() => {
          if (!forgotPasswordLoading) {
            Keyboard.dismiss();
            setShowForgotPasswordModal(false);
          }
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTitleRow}>
                <View style={styles.modalHeaderIconContainer}>
                  <Lock size={16} color={colors.accent.DEFAULT} />
                </View>
                <View>
                  <Text style={styles.modalTitle}>
                    {resetStep === 'password'
                      ? 'Set New Password'
                      : resetStep === 'success'
                      ? 'Password Reset Done'
                      : 'Reset Password'}
                  </Text>
                  <Text style={styles.modalSubtitle}>
                    {resetStep === 'email' && 'Step 1 of 3: Verification'}
                    {resetStep === 'otp' && 'Step 2 of 3: Enter OTP'}
                    {resetStep === 'password' && 'Step 3 of 3: Create Password'}
                    {resetStep === 'success' && 'Account updated'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => {
                  Keyboard.dismiss();
                  setShowForgotPasswordModal(false);
                }}
                disabled={forgotPasswordLoading}
                style={styles.closeButton}
              >
                <X size={20} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            {/* Progress line */}
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width:
                      resetStep === 'email'
                        ? '33%'
                        : resetStep === 'otp'
                        ? '66%'
                        : '100%',
                  },
                ]}
              />
            </View>

            <ScrollView
              contentContainerStyle={styles.modalBody}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* STEP 1: EMAIL INPUT */}
              {resetStep === 'email' && (
                <View style={styles.stepContainer}>
                  <Text style={styles.modalInstructionText}>
                    Enter your registered email address. We will send a secure verification code (OTP) to your inbox.
                  </Text>

                  <Input
                    label="Registered Email Address"
                    placeholder="name@college.edu"
                    value={forgotPasswordEmail}
                    onChangeText={setForgotPasswordEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />

                  {forgotPasswordError ? (
                    <Text style={styles.modalErrorText}>{forgotPasswordError}</Text>
                  ) : null}

                  <Button
                    title="Send OTP"
                    variant="accent"
                    loading={forgotPasswordLoading}
                    disabled={forgotPasswordLoading || !forgotPasswordEmail.trim()}
                    onPress={handleSendOtp}
                    style={styles.actionButton}
                  />
                </View>
              )}

              {/* STEP 2: OTP INPUT */}
              {resetStep === 'otp' && (
                <View style={styles.stepContainer}>
                  <View style={styles.otpNoticeCard}>
                    <View style={styles.otpNoticeHeader}>
                      <Text style={styles.otpNoticeTitle}>OTP Sent Successfully</Text>
                      <TouchableOpacity
                        onPress={() => {
                          setResetStep('email');
                          setForgotPasswordError('');
                        }}
                        disabled={forgotPasswordLoading}
                      >
                        <Text style={styles.changeEmailText}>Change Email</Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.otpNoticeEmail}>
                      Code sent to: <Text style={{ fontWeight: 'bold' }}>{forgotPasswordEmail}</Text>
                    </Text>
                  </View>

                  <Input
                    label="Enter Verification Code (OTP)"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChangeText={(val) => setOtp(val.replace(/[^0-9a-zA-Z]/g, ''))}
                    keyboardType="number-pad"
                    maxLength={6}
                    autoFocus
                  />

                  {otpSuccessMessage ? (
                    <View style={styles.otpSuccessBanner}>
                      <View style={styles.otpSuccessIcon}>
                        <Check size={14} color="#15803d" strokeWidth={2.5} />
                      </View>
                      <Text style={styles.otpSuccessText}>{otpSuccessMessage}</Text>
                    </View>
                  ) : null}

                  {forgotPasswordError ? (
                    <Text style={styles.modalErrorText}>{forgotPasswordError}</Text>
                  ) : null}

                  <View style={styles.resendRow}>
                    <Text style={styles.resendPrompt}>Didn't receive code?</Text>
                    <TouchableOpacity
                      onPress={handleSendOtp}
                      disabled={resendCooldown > 0 || forgotPasswordLoading || !!otpSuccessMessage}
                      style={styles.resendBtn}
                    >
                      <RotateCw
                        size={13}
                        color={resendCooldown > 0 || !!otpSuccessMessage ? colors.text.secondary : colors.accent.DEFAULT}
                      />
                      <Text
                        style={[
                          styles.resendText,
                          resendCooldown > 0 || !!otpSuccessMessage ? styles.resendDisabledText : null,
                        ]}
                      >
                        {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <Button
                    title={otpSuccessMessage ? 'Verified Successfully!' : 'Verify OTP'}
                    variant={otpSuccessMessage ? 'secondary' : 'accent'}
                    loading={forgotPasswordLoading}
                    disabled={forgotPasswordLoading || otp.trim().length < 4 || !!otpSuccessMessage}
                    onPress={handleVerifyOtp}
                    style={styles.actionButton}
                  />
                </View>
              )}

              {/* STEP 3: NEW PASSWORD & CONFIRM PASSWORD */}
              {resetStep === 'password' && (
                <View style={styles.stepContainer}>
                  <Text style={styles.modalInstructionText}>
                    Create a strong new password that you haven't used before.
                  </Text>

                  <Input
                    label="New Password"
                    placeholder="Create a strong password"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    isPassword
                  />

                  <Input
                    label="Confirm Password"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    isPassword
                  />

                  {/* Password requirements checklist matching signup */}
                  <View style={styles.requirementsCard}>
                    <Text style={styles.requirementsTitle}>PASSWORD REQUIREMENTS</Text>
                    
                    <View style={styles.requirementsGrid}>
                      <View style={styles.requirementItem}>
                        <View
                          style={[
                            styles.requirementBadge,
                            passwordCriteria.length ? styles.requirementBadgeActive : null,
                          ]}
                        >
                          {passwordCriteria.length ? (
                            <Check size={11} color="#ffffff" strokeWidth={3} />
                          ) : (
                            <View style={styles.requirementDot} />
                          )}
                        </View>
                        <Text
                          style={[
                            styles.requirementText,
                            passwordCriteria.length ? styles.requirementTextActive : null,
                          ]}
                        >
                          8+ characters
                        </Text>
                      </View>

                      <View style={styles.requirementItem}>
                        <View
                          style={[
                            styles.requirementBadge,
                            passwordCriteria.uppercase ? styles.requirementBadgeActive : null,
                          ]}
                        >
                          {passwordCriteria.uppercase ? (
                            <Check size={11} color="#ffffff" strokeWidth={3} />
                          ) : (
                            <View style={styles.requirementDot} />
                          )}
                        </View>
                        <Text
                          style={[
                            styles.requirementText,
                            passwordCriteria.uppercase ? styles.requirementTextActive : null,
                          ]}
                        >
                          1 uppercase (A-Z)
                        </Text>
                      </View>

                      <View style={styles.requirementItem}>
                        <View
                          style={[
                            styles.requirementBadge,
                            passwordCriteria.lowercase ? styles.requirementBadgeActive : null,
                          ]}
                        >
                          {passwordCriteria.lowercase ? (
                            <Check size={11} color="#ffffff" strokeWidth={3} />
                          ) : (
                            <View style={styles.requirementDot} />
                          )}
                        </View>
                        <Text
                          style={[
                            styles.requirementText,
                            passwordCriteria.lowercase ? styles.requirementTextActive : null,
                          ]}
                        >
                          1 lowercase (a-z)
                        </Text>
                      </View>

                      <View style={styles.requirementItem}>
                        <View
                          style={[
                            styles.requirementBadge,
                            passwordCriteria.number ? styles.requirementBadgeActive : null,
                          ]}
                        >
                          {passwordCriteria.number ? (
                            <Check size={11} color="#ffffff" strokeWidth={3} />
                          ) : (
                            <View style={styles.requirementDot} />
                          )}
                        </View>
                        <Text
                          style={[
                            styles.requirementText,
                            passwordCriteria.number ? styles.requirementTextActive : null,
                          ]}
                        >
                          1 number (0-9)
                        </Text>
                      </View>

                      <View style={styles.requirementItem}>
                        <View
                          style={[
                            styles.requirementBadge,
                            passwordCriteria.special ? styles.requirementBadgeActive : null,
                          ]}
                        >
                          {passwordCriteria.special ? (
                            <Check size={11} color="#ffffff" strokeWidth={3} />
                          ) : (
                            <View style={styles.requirementDot} />
                          )}
                        </View>
                        <Text
                          style={[
                            styles.requirementText,
                            passwordCriteria.special ? styles.requirementTextActive : null,
                          ]}
                        >
                          1 special character
                        </Text>
                      </View>

                      <View style={styles.requirementItem}>
                        <View
                          style={[
                            styles.requirementBadge,
                            passwordCriteria.match ? styles.requirementBadgeActive : null,
                          ]}
                        >
                          {passwordCriteria.match ? (
                            <Check size={11} color="#ffffff" strokeWidth={3} />
                          ) : (
                            <View style={styles.requirementDot} />
                          )}
                        </View>
                        <Text
                          style={[
                            styles.requirementText,
                            passwordCriteria.match ? styles.requirementTextActive : null,
                          ]}
                        >
                          Passwords match
                        </Text>
                      </View>
                    </View>
                  </View>

                  {forgotPasswordError ? (
                    <Text style={styles.modalErrorText}>{forgotPasswordError}</Text>
                  ) : null}

                  <Button
                    title="Reset Password & Sign In"
                    variant="accent"
                    loading={forgotPasswordLoading}
                    disabled={forgotPasswordLoading || !isPasswordValid}
                    onPress={handleResetPassword}
                    style={styles.actionButton}
                  />
                </View>
              )}

              {/* STEP 4: SUCCESS */}
              {resetStep === 'success' && (
                <View style={styles.successContainer}>
                  <View style={styles.successIconContainer}>
                    <Check size={32} color={colors.success} strokeWidth={2.5} />
                  </View>
                  <Text style={styles.successTitle}>Password Reset Successfully!</Text>
                  <Text style={styles.successText}>
                    Your password has been updated. You can now sign in with your new credentials.
                  </Text>

                  <Button
                    title="Back to Sign In"
                    variant="accent"
                    onPress={handleBackToLoginAfterSuccess}
                    style={styles.actionButton}
                  />
                </View>
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </AnimatedAuthLayout>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    width: '100%',
  },
  successBanner: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderColor: 'rgba(34, 197, 94, 0.3)',
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  successBannerIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successBannerText: {
    color: '#15803d',
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    flex: 1,
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
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    width: '100%',
    maxWidth: 420,
    maxHeight: '90%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  modalHeaderIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 107, 0, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  modalSubtitle: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 1,
  },
  closeButton: {
    padding: spacing.xs,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  progressBarContainer: {
    width: '100%',
    height: 3,
    backgroundColor: '#e2e8f0',
  },
  progressBarFill: {
    height: 3,
    backgroundColor: colors.accent.DEFAULT,
  },
  modalBody: {
    padding: spacing.lg,
  },
  stepContainer: {
    width: '100%',
  },
  modalInstructionText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  otpNoticeCard: {
    backgroundColor: 'rgba(255, 107, 0, 0.08)',
    borderColor: 'rgba(255, 107, 0, 0.25)',
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  otpNoticeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  otpNoticeTitle: {
    fontSize: typography.fontSize.xs,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  changeEmailText: {
    fontSize: typography.fontSize.xs,
    color: colors.accent.DEFAULT,
    fontWeight: '600',
  },
  otpNoticeEmail: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  resendPrompt: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
  resendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  resendText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '700',
    color: colors.accent.DEFAULT,
  },
  resendDisabledText: {
    color: colors.text.secondary,
    fontWeight: '500',
  },
  requirementsCard: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
    marginVertical: spacing.sm,
  },
  requirementsTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#64748b',
    marginBottom: spacing.sm,
  },
  requirementsGrid: {
    gap: 6,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  requirementBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#cbd5e1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  requirementBadgeActive: {
    backgroundColor: colors.success,
  },
  requirementDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ffffff',
  },
  requirementText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
  requirementTextActive: {
    color: colors.success,
    fontWeight: '600',
  },
  modalErrorText: {
    color: colors.error,
    fontSize: typography.fontSize.xs,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
    textAlign: 'center',
    fontWeight: '500',
  },
  actionButton: {
    marginTop: spacing.sm,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  successIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  successTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  successText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  otpSuccessBanner: {
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    borderColor: 'rgba(34, 197, 94, 0.35)',
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  otpSuccessIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(34, 197, 94, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpSuccessText: {
    color: '#15803d',
    fontSize: typography.fontSize.xs,
    fontWeight: '700',
    flex: 1,
  },
});
