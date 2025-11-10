export interface User {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  userName?: string;
  picture?: string;
  roles?: string[];
}

export interface LoginCredentials {
  emailOrUserName: string;
  password: string;
}

export interface SignupData {
  email: string;
  userName: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse extends AuthTokens {
  user?: User;
}

export interface GoogleTokenRequest {
  token: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  loginWithGoogle: (googleToken: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

