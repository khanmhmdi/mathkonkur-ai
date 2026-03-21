import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { User, AuthState, LoginCredentials, RegisterData, AuthResponse } from '../types/auth';

// API Configuration
const API_URL = 'http://localhost:4000/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Critical for HttpOnly refresh cookies
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

  // Flag to prevent infinite refresh loops
  const isRefreshing = useRef(false);

  // Update state helper
  const updateState = (updates: Partial<AuthState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  // Set authenticated state
  const setAuthenticated = (user: User, accessToken: string) => {
    console.log('🔍 AuthContext: setAuthenticated called', { user, accessToken });
    localStorage.setItem('accessToken', accessToken);
    const newState = {
      user,
      accessToken,
      isAuthenticated: true,
      isLoading: false,
    };
    console.log('🔍 AuthContext: Updating state to', newState);
    setState(newState);
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
    console.log('🔍 AuthContext: Login attempt started', credentials);
    try {
      console.log('🔍 AuthContext: Making POST request to /auth/login');
      const response = await axiosInstance.post<AuthResponse>('/auth/login', credentials);
      console.log('🔍 AuthContext: Login response received', response.data);
      const { user, accessToken } = response.data;
      console.log('🔍 AuthContext: Setting authenticated state', { user, accessToken });
      setAuthenticated(user, accessToken);
    } catch (error: any) {
      console.log('🔍 AuthContext: Login error caught', error);
      clearAuth();
      throw error;
    }
  };

  // Register method
  const register = async (data: RegisterData): Promise<void> => {
    try {
      const response = await axiosInstance.post<AuthResponse>('/auth/register', data);
      const { user, accessToken } = response.data;
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
      const response = await axiosInstance.post<{ accessToken: string }>('/auth/refresh');
      const { accessToken } = response.data;
      
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
        const response = await axiosInstance.get<{ user: User }>('/user/me');
        const { user } = response.data;
        
        setState(prev => ({
          ...prev,
          user,
          isAuthenticated: true,
          isLoading: false,
        }));
      } catch (error) {
        // Don't call clearAuth() here as it creates a loop
        // Just update state to show not authenticated
        setState({
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

  // Setup axios interceptors
  useEffect(() => {
    // Request interceptor: attach access token
    const requestInterceptor = axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor: handle 401 and refresh token
    const responseInterceptor = axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry && !isRefreshing.current) {
          originalRequest._retry = true;
          isRefreshing.current = true;

          try {
            const newToken = await refreshToken();
            if (newToken && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            isRefreshing.current = false;
            return axiosInstance(originalRequest);
          } catch (refreshError) {
            isRefreshing.current = false;
            // Refresh failed, user needs to login again
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
