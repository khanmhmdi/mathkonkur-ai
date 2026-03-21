import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { User } from '../types/auth';
import axios from 'axios';

// Mock import.meta.env for Jest
Object.defineProperty(window, 'import', {
  value: {
    meta: {
      env: {
        VITE_API_URL: 'http://localhost:4000/api'
      }
    }
  },
  writable: true
});

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Test component that uses auth
function TestComponent() {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      <div data-testid="auth-status">
        {isAuthenticated ? `Welcome ${user?.name}` : 'Not authenticated'}
      </div>
      {isAuthenticated ? (
        <button data-testid="logout-btn" onClick={logout}>
          Logout
        </button>
      ) : (
        <button 
          data-testid="login-btn" 
          onClick={() => login({ email: 'test@test.com', password: '123456' })}
        >
          Login
        </button>
      )}
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();
    jest.clearAllMocks();
    
    // Setup default axios mock
    mockedAxios.create.mockReturnValue({
      post: jest.fn(),
      get: jest.fn(),
      interceptors: {
        request: { use: jest.fn(), eject: jest.fn() },
        response: { use: jest.fn(), eject: jest.fn() },
      },
    } as any);
  });

  describe('Initial state', () => {
    it('should show loading initially', () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should show not authenticated when no token exists', async () => {
      const mockAxiosInstance = {
        get: jest.fn().mockRejectedValue(new Error('No token')),
        post: jest.fn(),
        interceptors: {
          request: { use: jest.fn(), eject: jest.fn() },
          response: { use: jest.fn(), eject: jest.fn() },
        },
      };
      
      mockedAxios.create.mockReturnValue(mockAxiosInstance as any);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Not authenticated');
        expect(screen.getByTestId('login-btn')).toBeInTheDocument();
      });
    });
  });

  describe('Login flow', () => {
    it('should login successfully and set user state', async () => {
      const mockUser: User = {
        id: '1',
        email: 'test@test.com',
        name: 'Test User',
        level: 'ریاضی فیزیک',
        createdAt: '2023-01-01T00:00:00Z'
      };

      const mockAxiosInstance = {
        get: jest.fn().mockRejectedValue(new Error('No token')),
        post: jest.fn().mockResolvedValue({
          data: {
            user: mockUser,
            accessToken: 'test-token'
          }
        }),
        interceptors: {
          request: { use: jest.fn(), eject: jest.fn() },
          response: { use: jest.fn(), eject: jest.fn() },
        },
      };
      
      mockedAxios.create.mockReturnValue(mockAxiosInstance as any);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('login-btn')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('login-btn'));

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Welcome Test User');
        expect(screen.getByTestId('logout-btn')).toBeInTheDocument();
        expect(localStorage.getItem('accessToken')).toBe('test-token');
      });
    });

    it('should handle login failure', async () => {
      const mockAxiosInstance = {
        get: jest.fn().mockRejectedValue(new Error('No token')),
        post: jest.fn().mockRejectedValue({
          response: {
            data: {
              error: {
                message: 'Invalid credentials'
              }
            }
          }
        }),
        interceptors: {
          request: { use: jest.fn(), eject: jest.fn() },
          response: { use: jest.fn(), eject: jest.fn() },
        },
      };
      
      mockedAxios.create.mockReturnValue(mockAxiosInstance as any);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('login-btn')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('login-btn'));

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Not authenticated');
        expect(screen.getByTestId('login-btn')).toBeInTheDocument();
        expect(localStorage.getItem('accessToken')).toBeNull();
      });
    });
  });

  describe('Logout flow', () => {
    it('should logout successfully and clear state', async () => {
      const mockUser: User = {
        id: '1',
        email: 'test@test.com',
        name: 'Test User',
        level: 'ریاضی فیزیک',
        createdAt: '2023-01-01T00:00:00Z'
      };

      const mockAxiosInstance = {
        get: jest.fn().mockRejectedValue(new Error('No token')),
        post: jest.fn()
          .mockResolvedValueOnce({
            data: {
              user: mockUser,
              accessToken: 'test-token'
            }
          })
          .mockResolvedValueOnce({}), // logout call
        interceptors: {
          request: { use: jest.fn(), eject: jest.fn() },
          response: { use: jest.fn(), eject: jest.fn() },
        },
      };
      
      mockedAxios.create.mockReturnValue(mockAxiosInstance as any);

      // Mock window.location
      const mockLocation = { href: '' };
      Object.defineProperty(window, 'location', {
        value: mockLocation,
        writable: true
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('login-btn')).toBeInTheDocument();
      });

      // Login first
      fireEvent.click(screen.getByTestId('login-btn'));

      await waitFor(() => {
        expect(screen.getByTestId('logout-btn')).toBeInTheDocument();
      });

      // Then logout
      fireEvent.click(screen.getByTestId('logout-btn'));

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Not authenticated');
        expect(screen.getByTestId('login-btn')).toBeInTheDocument();
        expect(localStorage.getItem('accessToken')).toBeNull();
      });
    });
  });

  describe('Token persistence', () => {
    it('should restore auth state from localStorage token', async () => {
      // Set token in localStorage
      localStorage.setItem('accessToken', 'existing-token');

      const mockUser: User = {
        id: '1',
        email: 'test@test.com',
        name: 'Test User',
        level: 'ریاضی فیزیک',
        createdAt: '2023-01-01T00:00:00Z'
      };

      const mockAxiosInstance = {
        get: jest.fn().mockResolvedValue({
          data: {
            user: mockUser
          }
        }),
        post: jest.fn(),
        interceptors: {
          request: { use: jest.fn(), eject: jest.fn() },
          response: { use: jest.fn(), eject: jest.fn() },
        },
      };
      
      mockedAxios.create.mockReturnValue(mockAxiosInstance as any);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Welcome Test User');
        expect(screen.getByTestId('logout-btn')).toBeInTheDocument();
      });
    });
  });

  describe('Token refresh', () => {
    it('should handle 401 and refresh token', async () => {
      const mockUser: User = {
        id: '1',
        email: 'test@test.com',
        name: 'Test User',
        level: 'ریاضی فیزیک',
        createdAt: '2023-01-01T00:00:00Z'
      };

      let callCount = 0;
      const mockAxiosInstance = {
        get: jest.fn().mockImplementation(() => {
          callCount++;
          if (callCount === 1) {
            // First call fails with 401
            return Promise.reject({ response: { status: 401 } });
          }
          // Second call succeeds after token refresh
          return Promise.resolve({
            data: {
              user: mockUser
            }
          });
        }),
        post: jest.fn().mockResolvedValue({
          data: {
            accessToken: 'new-token'
          }
        }),
        interceptors: {
          request: { use: jest.fn(), eject: jest.fn() },
          response: { 
            use: jest.fn().mockImplementation((onFulfilled, onRejected) => {
              return (error: any) => {
                if (error.response?.status === 401) {
                  return Promise.resolve('refreshed');
                }
                return onRejected(error);
              };
            }),
            eject: jest.fn() 
          },
        },
      };
      
      mockedAxios.create.mockReturnValue(mockAxiosInstance as any);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Welcome Test User');
        expect(localStorage.getItem('accessToken')).toBe('new-token');
      });
    });
  });
});
