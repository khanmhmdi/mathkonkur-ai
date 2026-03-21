export interface User {
  id: string;
  email: string;
  name: string;
  level: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  level: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}
