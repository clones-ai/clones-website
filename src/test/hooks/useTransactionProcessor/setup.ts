import {
    TransactionSession,
    PreparedTransaction,
    TransactionMachineState,
    TransactionAction
} from '../../../hooks/useTransactionProcessor';
import type { UserFacingError } from '../../../features/wallet/evmErrorDecoder';
import type { GasEstimate } from '../../../services/gasEstimationService';

// Test Data Factory
export const createMockTransactionSession = (overrides: Partial<TransactionSession> = {}): TransactionSession => ({
    sessionId: 'test-session-123',
    transactionType: 'fundPool',
    transactionParams: {
        type: 'fundPool',
        amount: '100',
        tokenAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC Base
        poolAddress: '0x1234567890123456789012345678901234567890',
        creator: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef'
    },
    sessionToken: 'session-token-456',
    expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
    isExpired: false,
    timeRemaining: 3600,
    ...overrides
});

export const createMockPreparedTransaction = (overrides: Partial<PreparedTransaction> = {}): PreparedTransaction => ({
    contractAddress: '0x1234567890123456789012345678901234567890',
    functionName: 'fundPool',
    args: ['0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef', BigInt('100000000')], // 100 USDC
    value: '0',
    abi: [
        {
            name: 'fundPool',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [
                { name: 'recipient', type: 'address' },
                { name: 'amount', type: 'uint256' }
            ],
            outputs: []
        }
    ],
    ...overrides
});

export const createMockGasEstimate = (overrides: Partial<GasEstimate> = {}): GasEstimate => ({
    gasLimit: '21000',
    gasPrice: '1000000000', // 1 gwei
    totalCost: '21000000000000', // 0.000021 ETH
    isExpensive: false,
    ...overrides
});

export const createMockUserError = (overrides: Partial<UserFacingError> = {}): UserFacingError => ({
    title: 'Test Error',
    message: 'This is a test error message',
    code: 'E_TEST_ERROR',
    category: 'unknown',
    ...overrides
});

export const createMockState = (overrides: Partial<TransactionMachineState> = {}): TransactionMachineState => ({
    currentState: 'IDLE',
    sessionData: null,
    preparedTx: null,
    gasEstimate: null,
    userError: null,
    txHash: null,
    approvalTxHash: null,
    needsApproval: false,
    simulationRequest: null,
    isAutoAuthenticating: false,
    ...overrides
});

// Test utilities
export const createMockTxHash = (): `0x${string}` =>
    `0x${'a'.repeat(64)}` as `0x${string}`;

export const waitFor = (ms: number): Promise<void> =>
    new Promise(resolve => setTimeout(resolve, ms));

// Mock implementations
export const mockSecureCall = jest.fn();
export const mockEstablishSessionFromTransaction = jest.fn();
export const mockWriteContract = jest.fn();
export const mockWriteApproval = jest.fn();
export const mockRefetchAllowance = jest.fn();

// Reset all mocks
export const resetAllMocks = (): void => {
    jest.clearAllMocks();
    mockSecureCall.mockReset();
    mockEstablishSessionFromTransaction.mockReset();
    mockWriteContract.mockReset();
    mockWriteApproval.mockReset();
    mockRefetchAllowance.mockReset();
};

// Common test assertions
export const expectStateTransition = (
    fromState: TransactionMachineState,
    action: TransactionAction,
    expectedState: string,
    reducer: (state: TransactionMachineState, action: TransactionAction) => TransactionMachineState
): void => {
    const result = reducer(fromState, action);
    expect(result.currentState).toBe(expectedState);
};

export const expectStateUnchanged = (
    state: TransactionMachineState,
    action: TransactionAction,
    reducer: (state: TransactionMachineState, action: TransactionAction) => TransactionMachineState
): void => {
    const result = reducer(state, action);
    expect(result).toEqual(state);
};