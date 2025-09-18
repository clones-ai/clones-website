import '@testing-library/jest-dom';

// Global test configuration

// Mock console methods to avoid noise in test output
global.console = {
  ...console,
  // Keep only error and warn for debugging
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  group: jest.fn(),
  groupEnd: jest.fn(),
};

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.VITE_API_URL = 'http://localhost:3001';

// Mock import.meta.env for Vite environment variables in Jest
if (typeof (global as any).importMeta === 'undefined') {
  (global as any).importMeta = {
    env: {
      VITE_API_URL: 'http://localhost:3001',
      NODE_ENV: 'test',
    }
  };
}

// Mock window.matchMedia (used by some UI libraries)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock crypto.randomUUID if not available
if (!global.crypto) {
  global.crypto = {
    randomUUID: () => 'test-uuid-' + Math.random().toString(36).substring(7)
  } as any;
}

// Mock TextEncoder and TextDecoder for Node.js environment
if (!global.TextEncoder) {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// Mock fetch if not available in test environment
if (!global.fetch) {
  global.fetch = jest.fn();
}

// Mock wagmi hooks to avoid ES module issues
jest.mock('wagmi', () => ({
  useAccount: jest.fn(() => ({ address: '0x1234567890123456789012345678901234567890' })),
  useWriteContract: jest.fn(() => ({ 
    writeContract: jest.fn(),
    data: null,
    isPending: false,
    error: null 
  })),
  useWaitForTransactionReceipt: jest.fn(() => ({ 
    isSuccess: false,
    isLoading: false,
    error: null 
  })),
  useSimulateContract: jest.fn(() => ({ 
    data: null,
    error: null,
    isSuccess: false 
  })),
  useReadContract: jest.fn(() => ({ 
    data: BigInt(0),
    refetch: jest.fn(),
    isLoading: false 
  })),
  useChainId: jest.fn(() => 8453), // Base mainnet chain ID
  useConfig: jest.fn(() => ({ 
    chains: [{ id: 8453, name: 'Base', nativeCurrency: { symbol: 'ETH' } }] 
  })),
}));

// Mock viem
jest.mock('viem', () => ({
  parseEther: jest.fn((value: string) => BigInt(parseFloat(value) * 1e18)),
  formatEther: jest.fn((value: bigint) => (Number(value) / 1e18).toString()),
}));

// Setup global test timeout
jest.setTimeout(10000);

// Custom matchers for better assertions
expect.extend({
  toBeValidTransactionState(received) {
    const validStates = [
      'IDLE', 'AUTHENTICATING', 'FETCHING_SESSION', 'CHECKING_ALLOWANCE',
      'NEEDS_APPROVAL', 'APPROVING', 'APPROVAL_CONFIRMING', 'SIMULATING',
      'READY_TO_EXECUTE', 'EXECUTING', 'CONFIRMING', 'SUCCESS', 'ERROR', 'RESET'
    ];
    
    const pass = validStates.includes(received);
    
    return {
      message: () => 
        pass
          ? `Expected ${received} not to be a valid transaction state`
          : `Expected ${received} to be a valid transaction state. Valid states: ${validStates.join(', ')}`,
      pass,
    };
  },
});

// TypeScript declaration for custom matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidTransactionState(): R;
    }
  }
}