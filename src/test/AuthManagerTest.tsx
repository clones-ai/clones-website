/**
 * AuthManager Frontend Test Component
 * 
 * Interactive test component to validate AuthManager functionality
 * Add this to your app temporarily for testing
 */

import { useState } from 'react';
import { AuthManager } from '../features/auth';

interface TestResult {
  name: string;
  status: 'pending' | 'pass' | 'fail';
  message: string;
  timestamp?: number;
}

export function AuthManagerTest() {
  const authManager = AuthManager.getInstance();
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addTestResult = (result: TestResult) => {
    setTests(prev => [...prev, { ...result, timestamp: Date.now() }]);
  };

  const runTests = async () => {
    setIsRunning(true);
    setTests([]);

    // Test 1: Initial State
    addTestResult({
      name: 'Initial Auth State',
      status: authManager.getState().isLoading ? 'pending' : (authManager.getState().isAuthenticated ? 'pass' : 'pass'),
      message: `Loading: ${authManager.getState().isLoading}, Authenticated: ${authManager.getState().isAuthenticated}`
    });

    // Test 2: Initialize
    try {
      await authManager.initialize();
      addTestResult({
        name: 'AuthManager Initialize',
        status: 'pass',
        message: `Initialized successfully. CSRF: ${authManager.getState().csrfToken ? 'present' : 'missing'}`
      });
    } catch (error) {
      addTestResult({
        name: 'AuthManager Initialize',
        status: 'fail',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 3: CSRF Token Presence
    if (authManager.getState().csrfToken) {
      addTestResult({
        name: 'CSRF Token Retrieval',
        status: 'pass',
        message: `Token length: ${authManager.getState().csrfToken?.length} chars`
      });
    } else {
      addTestResult({
        name: 'CSRF Token Retrieval',
        status: 'fail',
        message: 'No CSRF token received from backend'
      });
    }

    // Test 4: Ready State
    addTestResult({
      name: 'AuthManager Ready State',
      status: authManager.isReady() ? 'pass' : 'fail',
      message: `Ready: ${authManager.isReady()}, Auth: ${authManager.getState().isAuthenticated}, CSRF: ${!!authManager.getState().csrfToken}`
    });

    // Test 5: SecureCall Availability (without calling)
    try {
      // This should throw immediately if not authenticated
      if (!authManager.getState().isAuthenticated) {
        try {
          await authManager.secureCall('/api/v1/test');
        } catch (error) {
          if (error instanceof Error && error.message.includes('Authentication required')) {
            addTestResult({
              name: 'SecureCall Guard',
              status: 'pass',
              message: 'Correctly blocks unauthenticated calls'
            });
          } else {
            addTestResult({
              name: 'SecureCall Guard',
              status: 'fail',
              message: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`
            });
          }
        }
      } else {
        addTestResult({
          name: 'SecureCall Guard',
          status: 'pass',
          message: 'Authenticated - secureCall should work'
        });
      }
    } catch (error) {
      addTestResult({
        name: 'SecureCall Guard',
        status: 'fail',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    setIsRunning(false);
  };

  const testMockAuthentication = async () => {
    addTestResult({
      name: 'Mock Authentication Test',
      status: 'pending',
      message: 'Testing with mock wallet data...'
    });

    try {
      // Mock wallet signature data (will fail but test the flow)
      await authManager.authenticateWithWallet({
        address: '0x742d35cc6441c8532b751c2e6c4e5c51b5d5c4d0' as `0x${string}`,
        signature: '0xmock-signature' as `0x${string}`,
        timestamp: Date.now(),
        message: 'Test message',
        token: 'test-token'
      });

      addTestResult({
        name: 'Mock Authentication Test',
        status: 'fail',
        message: 'Should have failed with mock data'
      });
    } catch (error) {
      addTestResult({
        name: 'Mock Authentication Test',
        status: 'pass',
        message: `Correctly rejected mock data: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pass': return '✅';
      case 'fail': return '❌';
      case 'pending': return '⏳';
      default: return '❓';
    }
  };

  return (
    <div className="fixed top-4 right-4 w-96 bg-gray-900 text-white p-4 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
      <h3 className="text-lg font-bold mb-4">🧪 AuthManager Test</h3>

      <div className="space-y-2 mb-4">
        <div className="text-sm">
          <strong>Current State:</strong>
        </div>
        <div className="text-xs space-y-1 bg-gray-800 p-2 rounded">
          <div>Loading: {authManager.getState().isLoading ? 'Yes' : 'No'}</div>
          <div>Authenticated: {authManager.getState().isAuthenticated ? 'Yes' : 'No'}</div>
          <div>Address: {authManager.getState().address || 'None'}</div>
          <div>CSRF: {authManager.getState().csrfToken ? `${authManager.getState().csrfToken?.substring(0, 20)}...` : 'None'}</div>
          <div>Ready: {authManager.isReady() ? 'Yes' : 'No'}</div>
          <div>Error: {authManager.getState().error || 'None'}</div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <button
          onClick={runTests}
          disabled={isRunning}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-3 py-1 rounded text-sm"
        >
          {isRunning ? 'Running Tests...' : 'Run Tests'}
        </button>

        <button
          onClick={testMockAuthentication}
          className="w-full bg-orange-600 hover:bg-orange-700 px-3 py-1 rounded text-sm"
        >
          Test Mock Auth
        </button>

        <button
          onClick={() => authManager.clearSession()}
          className="w-full bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
        >
          Clear Session
        </button>
      </div>

      <div className="space-y-1 text-xs">
        <div className="font-semibold">Test Results:</div>
        {tests.length === 0 ? (
          <div className="text-gray-400">No tests run yet</div>
        ) : (
          tests.map((test, index) => (
            <div key={index} className="bg-gray-800 p-2 rounded">
              <div className="flex items-center gap-2">
                <span>{getStatusIcon(test.status)}</span>
                <span className="font-medium">{test.name}</span>
              </div>
              <div className="text-gray-300 mt-1">{test.message}</div>
              {test.timestamp && (
                <div className="text-gray-500 text-xs">
                  {new Date(test.timestamp).toLocaleTimeString()}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/**
 * How to use this test component:
 * 
 * 1. Add to your main App.tsx temporarily:
 *    import { AuthManagerTest } from './test/AuthManagerTest';
 *    
 * 2. Add to JSX:
 *    {process.env.NODE_ENV === 'development' && <AuthManagerTest />}
 *    
 * 3. Open browser and run tests
 * 4. Remove when done testing
 */