# Auth Context Implementation - Testing Guide

## Manual Testing Instructions

### 1. Start the Application
```bash
# Terminal 1 (Backend)
cd backend
npm run dev

# Terminal 2 (Frontend)  
npm run dev
```

### 2. Test Authentication Flow

Visit `http://localhost:3000/auth-test` to access the test component.

#### Test Cases:

**Case 1: Initial State**
- Expected: Shows "Loading..." then "Not authenticated" with login button
- Verify: No token in localStorage

**Case 2: Successful Login**
- Click "Login (test@test.com)" button
- Expected: Shows "Welcome Test User" with logout button
- Verify: 
  - `accessToken` exists in localStorage
  - API call to POST /api/auth/login succeeds
  - User state is populated

**Case 3: Token Persistence**
- Refresh the page after successful login
- Expected: Still shows "Welcome Test User" (no loading flash)
- Verify: Token is validated via GET /api/user/me

**Case 4: Failed Login**
- Click "Login (wrong credentials)" button  
- Expected: Still shows "Not authenticated"
- Verify: No token stored in localStorage

**Case 5: Logout**
- Click logout button while authenticated
- Expected: Shows "Not authenticated" with login button
- Verify:
  - POST /api/auth/logout called
  - Token removed from localStorage
  - Redirects to home page

**Case 6: Token Refresh (401 Handling)**
- Manually set invalid token in localStorage:
  ```javascript
  localStorage.setItem('accessToken', 'invalid-token')
  ```
- Refresh page
- Expected: Shows "Not authenticated" 
- Verify: Invalid token cleared, no error shown

### 3. Test Integration with Existing Features

**Question Bank with Auth:**
1. Login successfully
2. Visit `/bank`
3. Expected: Favorites functionality works (can star/unstar questions)
4. Logout and visit `/bank`
5. Expected: Can still view questions but favorites disabled

**Chat with Auth:**
1. Login successfully  
2. Open chat interface
3. Expected: Chat works normally
4. Verify: API calls include Authorization header

### 4. Browser Console Testing

Open browser dev tools and monitor:

**Network Tab:**
- Login: POST /api/auth/login with credentials, returns 200 + token
- Token validation: GET /api/user/me with Bearer token  
- Logout: POST /api/auth/logout clears cookie
- All subsequent requests include Authorization header

**Console Tab:**
- No authentication errors
- Token refresh attempts logged on 401 responses

### 5. Edge Cases

**Multiple Tabs:**
- Login in tab A
- Open tab B - should show authenticated state
- Logout in tab A - tab B should update on next interaction

**Network Issues:**
- Disconnect network during login
- Expected: Graceful error handling, no crash

**Expired Token:**
- Wait for token to expire (or manually invalidate)
- Expected: Automatic refresh attempt, then logout if failed

## Automated Testing Setup (Future)

To run Jest tests, install dependencies:
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom @types/jest jest jsdom
```

Create `jest.config.js`:
```javascript
export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapping: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
};
```

The test file `src/contexts/AuthContext.test.tsx` is already created and ready to run once dependencies are installed.
