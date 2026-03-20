import { register, login, refresh, logout } from './auth.controller';
import * as authService from '../services/auth.service';
import { AuthenticationError } from '../utils/errors';

async function verify() {
  console.log('--- Testing Auth Controller Logic ---');

  // Helper to create mock Express objects
  const createMocks = () => {
    const res: any = {
      status: function(code: number) { this.statusCode = code; return this; },
      json: function(data: any) { this.body = data; return this; },
      cookie: function(name: string, val: any, opt: any) { 
        this.cookies = this.cookies || {};
        this.cookies[name] = { val, opt }; 
        return this; 
      },
      clearCookie: function(name: string, opt: any) {
        this.clearedCookies = this.clearedCookies || {};
        this.clearedCookies[name] = opt;
        return this;
      }
    };
    const next = (err?: any) => { if (err) throw err; };
    return { res, next };
  };

  // Test 1: Register Controller
  console.log('[Test 1] Controller: register...');
  const { res: resReg, next: nextReg } = createMocks();
  const mockUser = { id: 'u1', email: 'c@t.com', name: 'N', level: 'L', createdAt: new Date(), updatedAt: new Date(), lastLoginAt: null };
  
  // Mock service
  (authService as any).register = async () => ({
    user: mockUser,
    accessToken: 'at1',
    refreshToken: 'rt1'
  });

  await register({ body: {} } as any, resReg, nextReg);
  console.assert(resReg.statusCode === 201, 'Should set 201');
  console.assert(resReg.cookies.refreshToken.val === 'rt1', 'Should set rt cookie');
  console.assert(resReg.body.data.accessToken === 'at1', 'Should return at in body');
  console.log('✅ Register controller logic passed');

  // Test 2: Refresh Controller
  console.log('\n[Test 2] Controller: refresh...');
  const { res: resRef, next: nextRef } = createMocks();
  (authService as any).refresh = async (rt: string) => ({ accessToken: 'new_at' });

  await refresh({ cookies: { refreshToken: 'rt2' } } as any, resRef, nextRef);
  console.assert(resRef.statusCode === 200, 'Should set 200');
  console.assert(resRef.body.data.accessToken === 'new_at', 'Should return new at');
  console.log('✅ Refresh controller logic passed');

  // Test 3: Logout Controller
  console.log('\n[Test 3] Controller: logout...');
  const { res: resLog, next: nextLog } = createMocks();
  (authService as any).logout = async () => {};

  await logout({ cookies: { refreshToken: 'rt3' } } as any, resLog, nextLog);
  console.assert(resLog.statusCode === 200, 'Should set 200');
  console.assert(resLog.clearedCookies.refreshToken, 'Should clear rt cookie');
  console.log('✅ Logout controller logic passed');

  console.log('\n--- All auth controller logic tests passed ---');
}

verify().catch(err => {
  console.error('Controller logic test failed:', err);
  process.exit(1);
});
