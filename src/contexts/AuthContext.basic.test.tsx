import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

// Test component that uses auth
function TestComponent() {
  const { user, isAuthenticated, isLoading, login } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      <div data-testid="auth-status">
        {isAuthenticated ? `Welcome ${user?.name}` : 'Not authenticated'}
      </div>
      {!isAuthenticated && (
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

// Mock axios to prevent network calls during test
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    post: jest.fn(),
    get: jest.fn(),
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() },
    },
  })),
}));

describe('AuthContext Basic Tests', () => {
  it('should render login button when not authenticated', async () => {
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

  it('should show loading initially', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
