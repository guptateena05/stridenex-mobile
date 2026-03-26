import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Input } from '@/components/Shared/Input';
import { Button } from '@/components/Shared/Button';
import { Checkbox } from '@/components/Shared/Checkbox';
import { AnimatedAuthLayout } from '@/components/layout/AnimatedAuthLayout';
import { BASE_URL } from '@/api/api.services';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing, borderRadius } from '@/theme/spacing';
import { GraduationCap, Users, Building2, Briefcase } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
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
  const [error, setError] = useState('');
  
  const navigation = useNavigation<any>();

  const validatePasswordStrength = (pass: string) => {
    if (pass.length < 8) return "Password must be at least 8 characters long";
    if (!/[A-Z]/.test(pass)) return "Password must contain at least one uppercase letter";
    if (!/[a-z]/.test(pass)) return "Password must contain at least one lowercase letter";
    if (!/[0-9]/.test(pass)) return "Password must contain at least one number";
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass)) return "Password must contain at least one special character";
    return "";
  };

  const handleSignup = async () => {
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }
    const passError = validatePasswordStrength(password);
    if (passError) { setError(passError); return; }
    if (password !== confirmPassword) { setError("Passwords do not match"); return; }
    if (!acceptTerms) { setError("You must accept the Terms of Service"); return; }

    setLoading(true);
    setError("");

    const rolePayload = [
      { student: selectedRole === "student" ? 1 : 0 },
      { college: selectedRole === "college" ? 1 : 0 },
      { mentor: selectedRole === "mentor" ? 1 : 0 },
      { industry: selectedRole === "industry" ? 1 : 0 }
    ];

    try {
      const response = await axios.post(
        `${BASE_URL}method/stridenex_app.api_stridenex_app.app.signup`,
        {
          first_name: firstName,
          last_name: lastName,
          email,
          password,
          role: rolePayload,
        },
        { headers: { "Content-Type": "application/json", Accept: "application/json" } }
      );
      
      const data = response.data;
      if (data?.message === "User created successfully") {
        await AsyncStorage.setItem("userEmail", email);
        await AsyncStorage.setItem("userFirstName", firstName);
        await AsyncStorage.setItem("userLastName", lastName);

        const onboardingMap: Record<UserRole, string> = {
          student: 'StudentOnboarding',
          college: 'CollegeOnboarding',
          industry: 'IndustryOnboarding',
          mentor: 'MentorOnboarding',
        };
        navigation.navigate(onboardingMap[selectedRole]);
      } else {
        setError(data?.message?.error || data?.message || "Signup failed");
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "An error occurred during signup");
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
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        
        <Input label="First Name" placeholder="Enter first name" value={firstName} onChangeText={setFirstName} />
        <Input label="Last Name" placeholder="Enter last name" value={lastName} onChangeText={setLastName} />

        <Input label="Email" placeholder="name@college.edu" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <Input label="Password" placeholder="Create a password" value={password} onChangeText={setPassword} secureTextEntry />
        <Input label="Confirm Password" placeholder="Confirm your password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />

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

        <View style={styles.termsRow}>
          <Checkbox checked={acceptTerms} onCheckedChange={setAcceptTerms} />
          <Text style={styles.termsText}>
            I agree to the <Text style={styles.linkText} onPress={() => navigation.navigate('TermsOfUse')}>Terms of Use</Text> and <Text style={styles.linkText} onPress={() => navigation.navigate('PrivacyPolicy')}>Privacy Policy</Text>
          </Text>
        </View>

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
  loginLinkRow: { flexDirection: 'row', justifyContent: 'center' }
});
