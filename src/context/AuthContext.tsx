import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '@/api/api.services';

type Role = 'Student' | 'Mentor' | 'College' | 'Industry' | null;

interface AuthContextType {
  role: Role;
  isAuthenticated: boolean;
  login: (role: Role, token: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [role, setRole] = useState<Role>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const storedRole = await AsyncStorage.getItem('role');
        if (token && storedRole) {
          setIsAuthenticated(true);
          setRole(storedRole as Role);
        }
      } catch (e) {
        console.error("Failed to fetch auth state", e);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (newRole: Role, token: string) => {
    try {
      await AsyncStorage.setItem('token', token);
      if (newRole) {
        await AsyncStorage.setItem('role', newRole);
      }
      setRole(newRole);
      setIsAuthenticated(true);
    } catch (e) {
      console.error("Failed to save auth state", e);
    }
  };

  const logout = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token && token !== 'dummy-token') {
        try {
          await fetch(`${BASE_URL}method/stridenex_app.api_stridenex_app.app.logout`, {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': `token ${token}`
            }
          });
        } catch (apiError) {
          console.error("Logout API error:", apiError);
        }
      }
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('role');
      setRole(null);
      setIsAuthenticated(false);
    } catch (e) {
      console.error("Failed to clear auth state", e);
    }
  };

  return (
    <AuthContext.Provider value={{ role, isAuthenticated, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
