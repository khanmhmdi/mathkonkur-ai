import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

// Test component that uses auth
function TestComponent() {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();
  
  if (isLoading) return <div data-testid="status">Loading...</div>;
  
  return (
    <div data-testid="auth-container">
      <div data-testid="status">
        {isAuthenticated ? `Welcome ${user?.name}` : 'Not authenticated'}
      </div>
      <div data-testid="user-info">
        User: {user?.name || 'None'}, Email: {user?.email || 'None'}
      </div>
      <div data-testid="token-info">
        Token: {user ? 'Present' : 'None'}
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

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value;
      window.localStorage.setItem(key, value);
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
      window.localStorage.removeItem(key);
    }),
    clear: jest.fn(() => {
      store = {};
      window.localStorage.clear();
    }),
  };
})();

// Replace localStorage
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true
});

// Mock fetch to track network calls
const mockFetch = jest.fn();
Object.defineProperty(window, 'fetch', {
  value: mockFetch,
  writable: true
});

describe('AuthContext Debug Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.clear();
  });

  it('should track complete auth flow', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Initial state
    expect(screen.getByTestId('status')).toHaveTextContent('Loading...');
    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('Not authenticated');
    });

    // Click login button
    const loginBtn = screen.getByTestId('login-btn');
    fireEvent.click(loginBtn);

    // Should show loading during login
    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('Loading...');
    }, { timeout: 5000 });

    // Check if login was called
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('accessToken', expect.any(String));
    
    // Mock successful login response
    const mockLoginResponse = {
      data: {
        user: { id: '1', name: 'Test User', email: 'test@test.com' },
        accessToken: 'test-token-123'
      }
    };

    // Simulate successful network response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockLoginResponse),
      headers: new Headers()
    } as Response);

    console.log('=== AUTH DEBUG INFO ===');
    console.log('1. Initial state:', screen.getByTestId('status').textContent);
    console.log('2. Login button clicked');
    console.log('3. localStorage.setItem called:', mockLocalStorage.setItem.mock.calls);
    console.log('4. Network fetch called:', mockFetch.mock.calls);
    console.log('5. Expected final state should show "Welcome Test User"');
    console.log('========================');
  });
});
