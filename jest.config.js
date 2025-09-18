/** @type {import('jest').Config} */
const config = {
  // Environment
  testEnvironment: 'jsdom',
  
  // Test file patterns
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}',
    '<rootDir>/src/test/**/*.{test,spec}.{js,jsx,ts,tsx}'
  ],
  
  // TypeScript support
  preset: 'ts-jest',
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
        resolveJsonModule: true,
        esModuleInterop: true,
        module: 'esnext',
        target: 'es2020',
        lib: ['es2020', 'dom'],
        moduleResolution: 'bundler',
      },
      isolatedModules: true,
    }],
  },
  
  // Module resolution
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  
  // Globals for import.meta
  globals: {
    'import.meta': {
      env: {
        VITE_API_URL: 'http://localhost:3001',
        NODE_ENV: 'test',
      }
    }
  },
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/src/test/setupTests.ts'],
  
  // Coverage
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/test/**/*',
    '!src/main.tsx',
    '!src/vite-env.d.ts'
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  
  // Mock handling
  clearMocks: true,
  restoreMocks: true,
  
  // Timeouts
  testTimeout: 10000,
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/build/'
  ],
  
  // Transform ES modules from node_modules
  transformIgnorePatterns: [
    'node_modules/(?!(wagmi|viem|@rainbow-me|@tanstack)/)'
  ],
  
  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
};

export default config;