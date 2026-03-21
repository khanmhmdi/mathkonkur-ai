import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

// Test component that uses auth
function TestComponent() {
  const { user, isAuthenticated, isLoading, login } = useAuth();
  
  return (
    <div>
      <div data-testid="loading">{isLoading ? 'loading' : 'not loading'}</div>
      <div data-testid="authenticated">{isAuthenticated ? 'yes' : 'no'}</div>
      <button 
        data-testid="login-btn" 
        onClick={() => login({ email: 'test@test.com', password: '123456' })}
      >
        Login
      </button>
    </div>
  );
}

describe('AuthContext Simple Test', () => {
  it('should render with correct initial state', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('loading');
    expect(screen.getByTestId('authenticated')).toHaveTextContent('no');
    expect(screen.getByTestId('login-btn')).toBeInTheDocument();
  });

  it('should handle login click', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginBtn = screen.getByTestId('login-btn');
    fireEvent.click(loginBtn);

    // Should show authenticated state after login
    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('yes');
    }, { timeout: 5000 });
  });
});
