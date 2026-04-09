export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  preset: 'ts-jest',
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.(ts|tsx)',
    '<rootDir>/src/**/*.(test|spec).(ts|tsx)'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    'AuthContext\\.basic\\.test\\.tsx',
    'AuthContext\\.debug\\.test\\.tsx',
    'AuthContext\\.simple\\.test\\.tsx',
    'AuthContext\\.smoke\\.test\\.tsx',
    'AuthContext\\.working\\.test\\.tsx',
    'AuthContext\\.test\\.tsx'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  collectCoverageFrom: [
    'src/**/*.(ts|tsx)',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts'
  ],
  setupFiles: ['<rootDir>/src/jest.setup.js'],
};
