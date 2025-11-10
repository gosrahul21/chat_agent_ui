import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService';
import type { User, LoginCredentials, SignupData, AuthContextType } from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const initAuth = async () => {
      const storedUser = authService.getStoredUser();
      const accessToken = localStorage.getItem('accessToken');

      if (storedUser && accessToken) {
        try {
          // Verify token is still valid
          const verifiedUser = await authService.verifyToken();
          setUser(verifiedUser);
        } catch (error) {
          console.error('Token verification failed:', error);
          authService.logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authService.login(credentials);
      authService.storeAuthData(response);
      
      // Get user info after login
      const userInfo = await authService.verifyToken();
      setUser(userInfo);
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
      authService.storeAuthData(response);
      
      if (response.user) {
        setUser(response.user);
      }
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

