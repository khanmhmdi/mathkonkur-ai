import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios, { AxiosError } from 'axios';
import { User, AuthState, LoginCredentials, RegisterData, AuthResponse, RefreshResponse, UserProfileResponse } from '../types/auth';

// API Configuration
const API_URL = 'http://localhost:4000/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Types for context
interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<string | null>;
}

// Create context
const AuthContext = createContext<AuthContextType | null>(null);

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: localStorage.getItem('accessToken'),
    isAuthenticated: false,
    isLoading: true,
  });

  // Update state helper
  const updateState = (updates: Partial<AuthState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  // Set authenticated state
  const setAuthenticated = (user: User, accessToken: string) => {
    localStorage.setItem('accessToken', accessToken);
    setState({
      user,
      accessToken,
      isAuthenticated: true,
      isLoading: false,
    });
  };

  // Clear auth state
  const clearAuth = () => {
    localStorage.removeItem('accessToken');
    setState({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  // Login method
  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      const response = await axiosInstance.post<AuthResponse>('/auth/login', credentials);
      const { user, accessToken } = response.data.data;
      setAuthenticated(user, accessToken);
    } catch (error: any) {
      clearAuth();
      throw error;
    }
  };

  // Register method
  const register = async (data: RegisterData): Promise<void> => {
    try {
      const response = await axiosInstance.post<AuthResponse>('/auth/register', data);
      const { user, accessToken } = response.data.data;
      setAuthenticated(user, accessToken);
    } catch (error: any) {
      clearAuth();
      throw error;
    }
  };

  // Logout method
  const logout = async (): Promise<void> => {
    try {
      await axiosInstance.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuth();
      window.location.href = '/';
    }
  };

  // Refresh token method
  const refreshToken = async (): Promise<string | null> => {
    try {
      const response = await axiosInstance.post<RefreshResponse>('/auth/refresh');
      const { accessToken } = response.data.data;
      
      localStorage.setItem('accessToken', accessToken);
      updateState({ accessToken });
      
      return accessToken;
    } catch (error) {
      clearAuth();
      return null;
    }
  };

  // Validate existing token on mount
  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        updateState({ isLoading: false });
        return;
      }

      try {
        // Create a separate instance for validation to avoid interceptor loops
        const validateAxios = axios.create({
          baseURL: API_URL,
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          timeout: 10000,
        });

        const response = await validateAxios.get<UserProfileResponse>('/user/me');
        const { user } = response.data.data;
        
        setState(prev => ({
          ...prev,
          user,
          isAuthenticated: true,
          isLoading: false,
        }));
      } catch (error) {
        // Token invalid, clear state
        updateState({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
        localStorage.removeItem('accessToken');
      }
    };

    validateToken();
  }, []);

  // Setup axios interceptors for API calls after initial validation
  useEffect(() => {
    // Request interceptor: attach access token
    const requestInterceptor = axiosInstance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          (config.headers as any).Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor: handle 401 and refresh token
    const responseInterceptor = axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newToken = await refreshToken();
            if ((originalRequest.headers as any)) {
              (originalRequest.headers as any).Authorization = `Bearer ${newToken}`;
            }
            // Create new axios instance for retry to avoid interceptor loops
            const retryAxios = axios.create({
              baseURL: API_URL,
              withCredentials: true,
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${newToken}`
              },
              timeout: 30000,
            });
            return retryAxios(originalRequest);
          } catch (refreshError) {
            clearAuth();
            return Promise.reject(error);
          }
        }

        return Promise.reject(error);
      }
    );

    // Cleanup
    return () => {
      axiosInstance.interceptors.request.eject(requestInterceptor);
      axiosInstance.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  const contextValue: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Export axios instance for other services
export { axiosInstance as api };
