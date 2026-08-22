import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, BASE_URL, getProfilePicture } from '@/api/api.services';

type Role = 'Student' | 'Mentor' | 'College' | 'Industry' | null;

interface AuthContextType {
  role: Role;
  userFullName: string | null;
  userName: string | null;
  isAuthenticated: boolean;
  login: (role: Role, token: string, userDetails?: { full_name?: string; username?: string; user_image?: string }) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  userImage: string | null;
  updateUserImage: (url: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [role, setRole] = useState<Role>(null);
  const [userFullName, setUserFullName] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userImage, setUserImage] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const storedRole = await AsyncStorage.getItem('role');
        const storedFullName = await AsyncStorage.getItem('userFullName');
        const storedUserName = await AsyncStorage.getItem('userName');
        const storedUserImage = await AsyncStorage.getItem('userImage');
        if (token && storedRole) {
          setIsAuthenticated(true);
          setRole(storedRole as Role);
          setUserFullName(storedFullName);
          setUserName(storedUserName);
          setUserImage(storedUserImage);

          // Fetch latest profile picture in background
          getProfilePicture().then(async (latestUrl) => {
            if (latestUrl && latestUrl !== storedUserImage) {
              await AsyncStorage.setItem('userImage', latestUrl);
              setUserImage(latestUrl);
            }
          }).catch(err => console.error("Error fetching latest profile picture", err));
        }
      } catch (e) {
        console.error("Failed to fetch auth state", e);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (newRole: Role, token: string, userDetails?: { full_name?: string; username?: string; user_image?: string }) => {
    try {
      await AsyncStorage.setItem('token', token);
      if (newRole) {
        await AsyncStorage.setItem('role', newRole);
      }
      if (userDetails?.full_name) {
        await AsyncStorage.setItem('userFullName', userDetails.full_name);
        setUserFullName(userDetails.full_name);
      }
      if (userDetails?.username) {
        await AsyncStorage.setItem('userName', userDetails.username);
        setUserName(userDetails.username);
      }
      if (userDetails?.user_image) {
        await AsyncStorage.setItem('userImage', userDetails.user_image);
        setUserImage(userDetails.user_image);
      } else {
        // Fetch it if not provided
        getProfilePicture().then(async (latestUrl) => {
          if (latestUrl) {
            await AsyncStorage.setItem('userImage', latestUrl);
            setUserImage(latestUrl);
          }
        }).catch(err => console.error("Error fetching latest profile picture on login", err));
      }
      setRole(newRole);
      setIsAuthenticated(true);
    } catch (e) {
      console.error("Failed to save auth state", e);
    }
  };

  const updateUserImage = async (url: string) => {
    try {
      await AsyncStorage.setItem('userImage', url);
      setUserImage(url);
    } catch (e) {
      console.error("Failed to save user image", e);
    }
  };

  const logout = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token && token !== 'dummy-token') {
        try {
          await api.post('method/stridenex_app.api_stridenex_app.app.logout', {}, {
            headers: {
              'Authorization': `token ${token}`
            }
          });
        } catch (apiError) {
          console.error("Logout API error:", apiError);
        }
      }
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('role');
      await AsyncStorage.removeItem('userFullName');
      await AsyncStorage.removeItem('userName');
      await AsyncStorage.removeItem('userImage');
      setRole(null);
      setUserFullName(null);
      setUserName(null);
      setUserImage(null);
      setIsAuthenticated(false);
    } catch (e) {
      console.error("Failed to clear auth state", e);
    }
  };

  return (
    <AuthContext.Provider value={{ role, userFullName, userName, userImage, isAuthenticated, login, logout, updateUserImage, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
