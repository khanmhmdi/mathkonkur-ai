import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export function AuthTestComponent() {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>Authentication Test Component</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <strong>State:</strong>
        <ul>
          <li>Is Authenticated: {isAuthenticated ? '✅ Yes' : '❌ No'}</li>
          <li>User: {user ? `${user.name} (${user.email})` : 'None'}</li>
          <li>Loading: {isLoading ? 'Yes' : 'No'}</li>
        </ul>
      </div>

      {isAuthenticated ? (
        <div>
          <p>Welcome {user?.name}!</p>
          <button 
            onClick={logout}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#dc3545', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      ) : (
        <div>
          <p>Please login to continue</p>
          <button 
            onClick={async () => {
              console.log('🔍 AuthTestComponent: Login button clicked');
              try {
                console.log('🔍 AuthTestComponent: Calling login...');
                await login({ email: 'test@test.com', password: '123456' });
                console.log('🔍 AuthTestComponent: Login completed successfully');
              } catch (error) {
                console.error('🔍 AuthTestComponent: Login failed', error);
                alert('Login failed: ' + (error.message || 'Unknown error'));
              }
            }}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#007bff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            Login (test@test.com)
          </button>
          <button 
            onClick={() => login({ email: 'wrong@test.com', password: 'wrong' })}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#6c757d', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Login (wrong credentials)
          </button>
        </div>
      )}

      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        <p><strong>Test Instructions:</strong></p>
        <ol>
          <li>Page should show "Loading..." then "Login" button</li>
          <li>Click login: should call API, show "Welcome [name]", button changes to "Logout"</li>
          <li>Refresh page: should stay logged in (token persisted)</li>
          <li>Click logout: should show login button again</li>
          <li>Check localStorage: 'accessToken' should exist when logged in, removed when logged out</li>
          <li>Test 401 handling: Set invalid token in localStorage, refresh - should clear and show logged out</li>
        </ol>
      </div>
    </div>
  );
}
