import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authService } from '../services/authService';
import type { User, LoginCredentials, SignupData, AuthContextType } from '../types/auth';
import { jwtDecode } from '../common/jwt-decode';
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const initAuth = async () => {
      const storedUser = authService.getStoredUser();

      if (storedUser) {
        try {
          // Verify token is still valid
          const response = await authService.refreshSession();
          const user = jwtDecode(response.accessToken) as User;
          setUser(user);
          authService.storeAuthData({...response, user: user});
          
        } catch (error) {
          console.error('Token verification failed:', error);
          authService.logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  // Listen for logout events from axios interceptor (e.g., on 401 errors)
  useEffect(() => {
    const handleAuthLogout = () => {
      setUser(null);
    };

    window.addEventListener('auth:logout', handleAuthLogout);
    return () => window.removeEventListener('auth:logout', handleAuthLogout);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authService.login(credentials);
      const user = jwtDecode(response.accessToken) as User;
      setUser(user);
      authService.storeAuthData({...response, user: user});
      
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const signup = async (data: SignupData) => {
    try {
      await authService.signup(data);
      // Auto-login after signup
      await login({ 
        emailOrUserName: data.email, 
        password: data.password 
      });
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    }
  };

  const loginWithGoogle = async (googleToken: string) => {
    try {
      const response = await authService.loginWithGoogle(googleToken);
      const user = jwtDecode(response.accessToken) as User;
      setUser(user);
      authService.storeAuthData({...response, user: user});
      
    } catch (error) {
      console.error('Google login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const refreshToken = async () => {
    try {
      const response = await authService.refreshSession();
      authService.storeAuthData(response);
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        loginWithGoogle,
        logout,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

