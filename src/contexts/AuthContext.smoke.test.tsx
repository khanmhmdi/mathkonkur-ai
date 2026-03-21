import { render, screen } from '@testing-library/react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

// Test component that uses auth
function TestComponent() {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  return (
    <div>
      <div data-testid="loading-state">{isLoading ? 'loading' : 'not loading'}</div>
      <div data-testid="auth-state">{isAuthenticated ? 'authenticated' : 'not authenticated'}</div>
      <div data-testid="user-state">{user ? user.name : 'no user'}</div>
    </div>
  );
}

describe('AuthContext Smoke Test', () => {
  it('should initialize with correct default state', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    expect(screen.getByTestId('loading-state')).toHaveTextContent('loading');
    expect(screen.getByTestId('auth-state')).toHaveTextContent('not authenticated');
    expect(screen.getByTestId('user-state')).toHaveTextContent('no user');
  });
});
