import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Input } from '@/components/Shared/Input';
import { Button } from '@/components/Shared/Button';
import { Checkbox } from '@/components/Shared/Checkbox';
import { AnimatedAuthLayout } from '@/components/layout/AnimatedAuthLayout';
import { useAuth } from '@/context/AuthContext';
import { BASE_URL } from '@/api/api.services';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

export const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigation = useNavigation();

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        `${BASE_URL}method/stridenex_app.api_stridenex_app.app.login`,
        { usr: username, pwd: password },
        { headers: { 'Content-Type': 'application/json' } }
      );

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

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await login(userRole as any, token);
      } else {
        setError(data.message || 'Login failed');
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
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
          secureTextEntry
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
            onPress={() => {}}
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
  }
});
