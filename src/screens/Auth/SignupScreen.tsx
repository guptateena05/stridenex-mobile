import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Input } from '@/components/Shared/Input';
import { Button } from '@/components/Shared/Button';
import { Checkbox } from '@/components/Shared/Checkbox';
import { AnimatedAuthLayout } from '@/components/layout/AnimatedAuthLayout';
import { api } from '@/api/api.services';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing, borderRadius } from '@/theme/spacing';
import { GraduationCap, Users, Building2, Briefcase } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type UserRole = "student" | "mentor" | "college" | "industry";

const roles = [
  { id: "student", label: "Student", Icon: GraduationCap, color: colors.accent.DEFAULT, description: "Start your career" },
  { id: "industry", label: "Industry", Icon: Briefcase, color: colors.primary.DEFAULT, description: "Build your talent pipeline" },
  { id: "college", label: "College", Icon: Building2, color: colors.info || '#3b82f6', description: "Enhance student outcomes" },
  { id: "mentor", label: "Mentor", Icon: Users, color: colors.success || '#10b981', description: "Guide and inspire others" },
];

export const SignupScreen = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const navigation = useNavigation<any>();

  const validatePasswordStrength = (pass: string) => {
    if (pass.length < 8) return "Password must be at least 8 characters long";
    if (!/[A-Z]/.test(pass)) return "Password must contain at least one uppercase letter";
    if (!/[a-z]/.test(pass)) return "Password must contain at least one lowercase letter";
    if (!/[0-9]/.test(pass)) return "Password must contain at least one number";
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass)) return "Password must contain at least one special character";
    return "";
  };

  const handleFieldChange = (field: string, value: any, setter: (val: any) => void) => {
    setter(value);
    setErrors(prev => {
      const updated = { ...prev };
      delete updated[field];
      return updated;
    });
  };

  const handleSignup = async () => {
    const newErrors: Record<string, string> = {};

    if (!firstName) newErrors.firstName = "First name is required";
    if (!lastName) newErrors.lastName = "Last name is required";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Invalid email format";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else {
      const passError = validatePasswordStrength(password);
      if (passError) {
        newErrors.password = passError;
      }
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!acceptTerms) {
      newErrors.acceptTerms = "You must accept the Terms of Service and Privacy Policy";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setLoading(true);

    const rolePayload = [
      { student: selectedRole === "student" ? 1 : 0 },
      { college: selectedRole === "college" ? 1 : 0 },
      { mentor: selectedRole === "mentor" ? 1 : 0 },
      { industry: selectedRole === "industry" ? 1 : 0 }
    ];

    try {
      const response = await api.post(
        'method/stridenex_app.api_stridenex_app.app.signup',
        {
          first_name: firstName,
          last_name: lastName,
          email,
          password,
          role: rolePayload,
        }
      );

      const data = response.data;
      if (data?.message === "User created successfully") {
        await AsyncStorage.removeItem('studentOnboardingStep');
        await AsyncStorage.removeItem('userMobileNo');
        await AsyncStorage.setItem("userEmail", email);
        await AsyncStorage.setItem("userFirstName", firstName);
        await AsyncStorage.setItem("userLastName", lastName);
        await AsyncStorage.setItem("userPassword", password);

        if (selectedRole === 'student') {
          navigation.navigate('StudentOnboarding');
        } else {
          try {
            const loginRes = await api.post(
              'method/stridenex_app.api_stridenex_app.app.login',
              { usr: email, pwd: password }
            );
            const loginData = loginRes.data;
            if (loginData?.message === "Logged In") {
              const { api_key, api_secret } = loginData.key_details || {};
              const webOnboardingUrl = `https://testwebstridenex.quantcloud.in/onboarding/${selectedRole}?source=mobile&apiKey=${encodeURIComponent(api_key || '')}&apiSecret=${encodeURIComponent(api_secret || '')}`;

              navigation.navigate('WebOnboarding', {
                url: webOnboardingUrl,
                email: email,
                sessionData: {
                  apiKey: api_key || '',
                  apiSecret: api_secret || '',
                  email: email,
                  isOnboarded: String(loginData.is_onboarded ?? '0'),
                  fullName: loginData.full_name || `${firstName} ${lastName}`.trim(),
                  role: selectedRole,
                }
              });
              return;
            }
          } catch (loginErr) {
            console.error("Auto-login failed after signup:", loginErr);
          }

          const webOnboardingUrl = `https://testwebstridenex.quantcloud.in/onboarding/${selectedRole}?source=mobile`;
          navigation.navigate('WebOnboarding', {
            url: webOnboardingUrl,
            email: email
          });
        }
      } else {
        const errMsg = data?.message?.error || data?.message || "Signup failed";
        if (errMsg.toLowerCase().includes("email") || errMsg.toLowerCase().includes("user already exists")) {
          setErrors({ email: errMsg });
        } else {
          setErrors({ general: errMsg });
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || err?.message || "An error occurred during signup";
      if (errMsg.toLowerCase().includes("email") || errMsg.toLowerCase().includes("user already exists")) {
        setErrors({ email: errMsg });
      } else {
        setErrors({ general: errMsg });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedAuthLayout
      title="Create Your Account"
      subtitle="Join StrideNex to start your career development journey"
    >
      <View style={styles.formContainer}>
        {errors.general ? <Text style={styles.errorText}>{errors.general}</Text> : null}

        <Input 
          label="First Name" 
          placeholder="Enter first name" 
          value={firstName} 
          onChangeText={(val) => handleFieldChange('firstName', val, setFirstName)} 
          error={errors.firstName}
        />
        <Input 
          label="Last Name" 
          placeholder="Enter last name" 
          value={lastName} 
          onChangeText={(val) => handleFieldChange('lastName', val, setLastName)} 
          error={errors.lastName}
        />

        <Input 
          label="Email" 
          placeholder="name@college.edu" 
          value={email} 
          onChangeText={(val) => handleFieldChange('email', val, setEmail)} 
          autoCapitalize="none" 
          keyboardType="email-address" 
          error={errors.email}
        />
        <Input 
          label="Password" 
          placeholder="Create a password" 
          value={password} 
          onChangeText={(val) => handleFieldChange('password', val, setPassword)} 
          isPassword 
          error={errors.password}
        />
        <Input 
          label="Confirm Password" 
          placeholder="Confirm your password" 
          value={confirmPassword} 
          onChangeText={(val) => handleFieldChange('confirmPassword', val, setConfirmPassword)} 
          isPassword 
          error={errors.confirmPassword}
        />

        <Text style={styles.roleLabel}>I want to join as</Text>
        <View style={styles.rolesGrid}>
          {roles.map(role => {
            const isSelected = selectedRole === role.id;
            return (
              <TouchableOpacity
                key={role.id}
                style={[styles.roleCard, isSelected && { borderColor: role.color, backgroundColor: 'rgba(0,0,0,0.02)' }]}
                onPress={() => setSelectedRole(role.id as UserRole)}
                activeOpacity={0.7}
              >
                <View style={[styles.iconContainer, { backgroundColor: isSelected ? role.color : role.color + '20' }]}>
                  <role.Icon size={16} color={isSelected ? '#fff' : role.color} />
                </View>
                <Text style={styles.roleTitle}>{role.label}</Text>
                <Text style={styles.roleDesc}>{role.description}</Text>
              </TouchableOpacity>
            )
          })}
        </View>

        <View style={[styles.termsRow, errors.acceptTerms ? { marginBottom: spacing.xs } : null]}>
          <Checkbox checked={acceptTerms} onCheckedChange={(val) => handleFieldChange('acceptTerms', val, setAcceptTerms)} />
          <Text style={styles.termsText}>
            I agree to the <Text style={styles.linkText} onPress={() => navigation.navigate('TermsOfUse')}>Terms of Use</Text> and <Text style={styles.linkText} onPress={() => navigation.navigate('PrivacyPolicy')}>Privacy Policy</Text>
          </Text>
        </View>
        {errors.acceptTerms ? <Text style={styles.checkboxErrorText}>{errors.acceptTerms}</Text> : null}

        <Button title="Create Account" onPress={handleSignup} loading={loading} variant="accent" style={styles.submitBtn} />

        <View style={styles.loginLinkRow}>
          <Text style={styles.termsText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkText}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </AnimatedAuthLayout>
  );
};

const styles = StyleSheet.create({
  formContainer: { width: '100%' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  halfInput: { flex: 1 },
  errorText: { color: colors.error, marginBottom: spacing.md, textAlign: 'center', fontFamily: typography.fontFamily.display },
  roleLabel: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, color: colors.text.primary, marginBottom: spacing.sm, textAlign: 'center' },
  rolesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: spacing.lg },
  roleCard: { width: '48%', borderWidth: 2, borderColor: colors.border, borderRadius: borderRadius.xl, padding: spacing.sm, alignItems: 'center', marginBottom: spacing.sm },
  iconContainer: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xs },
  roleTitle: { fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.semibold, color: colors.text.primary, marginBottom: 2 },
  roleDesc: { fontSize: 9, color: colors.text.secondary, textAlign: 'center' },
  termsRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.xl },
  termsText: { flex: 1, marginLeft: spacing.sm, fontSize: typography.fontSize.sm, color: colors.text.secondary, lineHeight: 20 },
  linkText: { color: colors.accent.DEFAULT, fontWeight: typography.fontWeight.medium },
  submitBtn: { marginBottom: spacing.lg },
  loginLinkRow: { flexDirection: 'row', justifyContent: 'center' },
  checkboxErrorText: {
    color: colors.error,
    fontSize: typography.fontSize.xs,
    marginBottom: spacing.md,
    fontFamily: typography.fontFamily.display,
  },
});
