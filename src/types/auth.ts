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
  success: true;
  data: {
    user: User;
    accessToken: string;
  };
}

export interface RefreshResponse {
  success: true;
  data: {
    accessToken: string;
  };
}

export interface UserProfileResponse {
  success: true;
  data: {
    user: User;
  };
}
