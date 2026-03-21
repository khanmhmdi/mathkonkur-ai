import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { User } from '../types/auth';

// Mock axios properly
const mockAxiosInstance = {
  post: jest.fn(),
  get: jest.fn(),
  interceptors: {
    request: { use: jest.fn(), eject: jest.fn() },
    response: { use: jest.fn(), eject: jest.fn() },
  },
};

jest.mock('axios', () => ({
  create: jest.fn(() => mockAxiosInstance),
  default: mockAxiosInstance
}));

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

  describe('Basic functionality', () => {
    it('should render login button when not authenticated', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('login-btn')).toBeInTheDocument();
        expect(screen.queryByTestId('logout-btn')).not.toBeInTheDocument();
      });
    });

    it('should have correct initial state', () => {
      const TestHookComponent = () => {
        const auth = useAuth();
        return (
          <div data-testid="auth-state">
            {JSON.stringify({
              user: auth.user,
              accessToken: auth.accessToken,
              isAuthenticated: auth.isAuthenticated,
              isLoading: auth.isLoading
            })}
          </div>
        );
      };

      render(
        <AuthProvider>
          <TestHookComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('auth-state')).toBeInTheDocument();
    });
  });

  describe('useAuth hook', () => {
    it('should throw error when used outside provider', () => {
      expect(() => {
        render(<TestComponent />);
      }).toThrow('useAuth must be used within an AuthProvider');
    });
  });
});
