/**
 * @file useTransactionProcessor.ts
 * @summary A comprehensive React hook for processing blockchain transactions.
 *
 * @description
 * This hook encapsulates the entire lifecycle of a blockchain transaction that is initiated
 * from an external source (like Clones Desktop app) and executed through a web interface (like the Clones website). It uses a
 * state machine to manage the complex flow, ensuring predictable state transitions and robust
 * error handling.
 *
 * The process is designed to be secure and user-friendly, guiding the user through wallet
 * connection, authentication, transaction simulation, and execution.
 *
 *  It manages different transaction types:
 *  - createFactory: Creates a new reward pool factory contract.
 *  - fundPool: Funds a reward pool contract.
 *  - claimRewards: Claims rewards from a reward pool contract.
 *  - createAndFundPool: Creates a new reward pool factory contract and funds it.
 *  - withdrawPool: Withdraws funds from a reward pool contract.
 * 
 * ---
 *
 * ### Core Concepts
 *
 * 1.  **State Machine**: The hook is built around a reducer-based state machine (`transactionReducer`).
 *     Each state represents a distinct step in the transaction lifecycle. Transitions between
 *     states are strictly controlled by dispatched actions and validation guards. This prevents
 *     invalid states and race conditions.
 *
 * 2.  **Side Effect Management**: Asynchronous operations (API calls, wallet interactions) are
 *     treated as side effects and are managed separately from the pure state logic in the reducer.
 *     The `sideEffectHandlers` map specific states to asynchronous functions, which are executed
 *     by a central `useEffect` handler. This keeps the state logic predictable and testable.
 *
 * 3.  **Session-Based Security**: The transaction is initiated via a `sessionId` passed in the URL.
 *     This session is first validated with the backend. All subsequent sensitive API calls are
 *     authenticated using a secure session managed by `useAuth`.
 *
 * 4.  **Wagmi Integration**: It leverages wagmi hooks for all blockchain interactions, including:
 *     - `useAccount`: For wallet address and connection status.
 *     - `useSimulateContract`: To safely simulate the transaction before execution, catching potential reverts.
 *     - `useWriteContract`: To submit the approval and main transactions.
 *     - `useWaitForTransactionReceipt`: To monitor the transaction status on-chain.
 *     - `useReadContract`: For checking token allowances and decimals.
 *
 * ---
 *
 * ### Transaction Lifecycle (Happy Path)
 *
 * The typical flow for a transaction (e.g., funding a pool) is as follows:
 *
 * 1.  `IDLE`: The hook initializes. It checks for a `sessionId` and if the user is authenticated.
 *     - If not authenticated, it transitions to `AUTHENTICATING`.
 *     - If authenticated, it transitions to `FETCHING_SESSION`.
 *
 * 2.  `AUTHENTICATING`: (If needed) The user is prompted to sign a message to authenticate. On success,
 *     a secure session is established with the backend.
 *
 * 3.  `FETCHING_SESSION`: Fetches the transaction details and parameters from the backend using the `sessionId`.
 *     It also prepares the transaction data (`preparedTx`) needed for the blockchain call.
 *
 * 4.  `CHECKING_ALLOWANCE`: If the transaction involves an ERC20 token (e.g., `fundPool`), this state
 *     checks if the smart contract has sufficient allowance to spend the user's tokens. It dynamically
 *     fetches the token's decimals to handle non-standard tokens correctly.
 *
 * 5.  `NEEDS_APPROVAL`: If the allowance is insufficient, the state machine waits here. The UI will
 *     prompt the user to approve the token spending.
 *
 * 6.  `APPROVING` -> `APPROVAL_CONFIRMING`: The user submits an `approve` transaction. The hook waits for
 *     it to be confirmed on-chain.
 *
 * 7.  `SIMULATING`: Before execution, wagmi's `useSimulateContract` is used to simulate the transaction.
 *     This is a critical step to prevent sending a transaction that is likely to fail, saving the user gas fees.
 *
 * 8.  `READY_TO_EXECUTE`: The simulation was successful. The UI enables the "Execute" button, and the
 *     hook waits for the user's final confirmation.
 *
 * 9.  `EXECUTING` -> `CONFIRMING`: The user clicks "Execute". The transaction is submitted to the blockchain,
 *     and the hook waits for on-chain confirmation.
 *
 * 10. `SUCCESS`: The transaction is confirmed. The UI displays a success message with a link to the
 *     transaction on a block explorer.
 *
 * ---
 *
 * ### Error Handling & Robustness
 *
 * The hook is designed to be resilient:
 *
 * - **Invalid Transitions**: The state machine will not allow invalid state transitions (e.g., jumping from `IDLE` to `EXECUTING`).
 * - **User Rejection**: Explicitly handles wallet error code `4001` (user rejected request) for both approval and execution, allowing the user to retry.
 * - **Contract Reverts**: Catches and decodes simulation errors to provide meaningful feedback before the user spends gas.
 * - **Network/Account Changes**: If the user switches their wallet account or network mid-flow, the process is automatically reset to prevent errors.
 * - **Pre-Hash Failures**: Ensures the backend is notified of a failed transaction status even if the transaction never gets a hash (e.g., failed to broadcast).
 *
 */
import { useReducer, useEffect, useCallback, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useSimulateContract, useReadContract, useChainId, useConfig, useTransactionConfirmations } from 'wagmi';
import { parseEther, type Abi, type AbiFunction, parseUnits, isAddress, getAbiItem, encodeFunctionData } from 'viem';
import { z } from 'zod';

import { toUserError, type UserFacingError } from '../features/wallet/evmErrorDecoder';
import RewardPoolFactoryAbi from '../contracts/abis/RewardPoolFactory.json';
import RewardPoolImplementationAbi from '../contracts/abis/RewardPoolImplementation.json';
import ClaimRouterAbi from '../contracts/abis/ClaimRouter.json';
import { GasEstimationService, type GasEstimate } from '../services/gasEstimationService';

const erc20Abi = [
    { name: 'decimals', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint8' }] },
    { name: 'allowance', type: 'function', stateMutability: 'view', inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }], outputs: [{ type: 'uint256' }] },
] as const;

// Retry and backoff configuration
const BACKOFF_CONFIG = {
    baseDelayMs: 500,
    maxDelayMs: 4000,
    maxRetries: 10,
    timeoutMs: 20000,
    confirmationThreshold: 12, // blocks
} as const;

// Validation schemas
const AddressSchema = z.string().refine((addr) => isAddress(addr), 'Invalid Ethereum address');

const AmountStringSchema = z.string().regex(/^\d+(\.\d+)?$/, 'Invalid decimal amount');

const TransactionTypeSchema = z.enum(['createFactory', 'fundPool', 'claimRewards', 'createAndFundPool', 'withdrawPool']);

const TransactionParamsSchema = z.object({
    type: z.string(),
    creator: AddressSchema.optional(),
    token: z.string().optional(),
    tokenAddress: AddressSchema.optional(),
    amount: AmountStringSchema.optional(),
    poolAddress: AddressSchema.optional(),
    chainId: z.number().positive().optional(),
    submissionId: z.string().optional(),
});

const SessionSchema = z.object({
    sessionId: z.string().min(1),
    transactionType: TransactionTypeSchema,
    transactionParams: TransactionParamsSchema,
    sessionToken: z.string().min(1),
    expiresAt: z.string(),
    isExpired: z.boolean(),
    timeRemaining: z.number(),
});

const AbiSchema = z.custom<Abi>((v) => {
    try {
        if (!Array.isArray(v)) return false;

        // Basic structure validation
        return v.every(item =>
            typeof item === 'object' &&
            item !== null &&
            'type' in item &&
            ['function', 'event', 'error', 'constructor', 'fallback', 'receive'].includes(item.type)
        );
    } catch {
        return false;
    }
}, 'Invalid ABI structure');

const PreparedTransactionSchema = z.object({
    contractAddress: AddressSchema,
    spenderAddress: AddressSchema.optional(),
    functionName: z.string().min(1),
    args: z.array(z.unknown()),
    value: z.union([z.string(), z.bigint()]).optional(),
    abi: AbiSchema,
});

// Transaction whitelist for security
const TX_WHITELIST: Record<TransactionSession['transactionType'], { fn: string; abi: Abi }> = {
    fundPool: { fn: 'fund', abi: RewardPoolImplementationAbi as Abi },
    createFactory: { fn: 'createFactory', abi: RewardPoolFactoryAbi as Abi },
    claimRewards: { fn: 'payWithSig', abi: RewardPoolImplementationAbi as Abi },
    createAndFundPool: { fn: 'createAndFundPool', abi: RewardPoolFactoryAbi as Abi },
    withdrawPool: { fn: 'withdraw', abi: RewardPoolImplementationAbi as Abi },
};

function assertPreparedMatchesType(session: TransactionSession, preparedTx: PreparedTransaction): void {
    const rule = TX_WHITELIST[session.transactionType];
    if (!rule) {
        throw new Error(`Unknown transaction type: ${session.transactionType}`);
    }

    if (preparedTx.functionName !== rule.fn) {
        throw new Error(`Function name mismatch for type ${session.transactionType}: expected ${rule.fn}, got ${preparedTx.functionName}`);
    }

    // Validate the whitelisted function exists in the whitelisted ABI
    const whitelistedFunction = getAbiItem({ abi: rule.abi, name: rule.fn });
    if (!whitelistedFunction || whitelistedFunction.type !== 'function') {
        throw new Error(`Whitelisted function ${rule.fn} not found in ABI for type ${session.transactionType}`);
    }

    // Validate args count matches expected inputs
    const expectedArgCount = whitelistedFunction.inputs?.length ?? 0;
    const providedArgCount = Array.isArray(preparedTx.args) ? preparedTx.args.length : 0;
    if (providedArgCount !== expectedArgCount) {
        throw new Error(`Args length mismatch for ${rule.fn}: expected ${expectedArgCount}, got ${providedArgCount}`);
    }

    // Final validation: try to encode with whitelisted ABI
    // If this throws, the preparedTx is invalid/incompatible
    try {
        encodeFunctionData({
            abi: rule.abi,
            functionName: rule.fn as any,
            args: preparedTx.args as any
        });
    } catch (error) {
        throw new Error(`Failed to encode function data with whitelisted ABI: ${error instanceof Error ? error.message : 'Unknown encoding error'}`);
    }
}

// Security: Redact sensitive data from logs (safe for cyclical objects)
const redact = (msg: unknown, depth = 0, maxDepth = 2): unknown => {
    if (typeof msg === 'string') {
        return msg.replace(/sessionToken['":\s]*[^,\s}"']+/gi, 'sessionToken:[REDACTED]')
            .replace(/sessionId['":\s]*[^,\s}"']+/gi, 'sessionId:[REDACTED]')
            .replace(/authorization['":\s]*[^,\s}"']+/gi, 'authorization:[REDACTED]');
    }

    if (msg && typeof msg === 'object' && depth < maxDepth) {
        try {
            // Safe redaction for objects with depth limit
            const sensitiveKeys = ['sessionToken', 'sessionId', 'authorization', 'csrfToken', 'token'];
            const redacted: any = {};

            for (const [key, value] of Object.entries(msg)) {
                if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk.toLowerCase()))) {
                    redacted[key] = '[REDACTED]';
                } else if (typeof value === 'object' && value !== null && !Array.isArray(value) && depth < maxDepth) {
                    // Recursively redact nested objects with depth limit
                    redacted[key] = redact(value, depth + 1, maxDepth);
                } else {
                    redacted[key] = value;
                }
            }

            return redacted;
        } catch {
            // Fallback for problematic objects
            return '[OBJECT_REDACTION_FAILED]';
        }
    }

    return msg;
};

// Error handling helpers
const isUserRejected = (error: any): boolean => {
    return error?.code === 4001 ||
        error?.cause?.code === 4001 ||
        error?.message?.includes('User rejected');
};

const createUserRejectionError = (context: 'transaction' | 'approval'): UserFacingError => ({
    title: 'Transaction Cancelled',
    message: `You cancelled the ${context}. You can try again when ready.`,
    code: 'E_USER_REJECTED',
    category: 'user'
});

const dispatchUserError = (
    dispatch: React.Dispatch<TransactionAction>,
    error: any,
    context: string,
    updateSessionStatus: (status: 'completed' | 'failed' | 'cancelled', txHash?: string, error?: string) => Promise<void>,
    txHash?: string
) => {
    if (isUserRejected(error)) {
        const userError = createUserRejectionError(context.includes('approval') ? 'approval' : 'transaction');
        dispatch({ type: 'ERROR', payload: { error: userError } });
        updateSessionStatus('cancelled', txHash, userError.message);
    } else {
        const decodedError = toUserError(error, { abis: ALL_ABIS });
        if (context.includes('approval')) {
            decodedError.title = 'Token Approval Failed';
        }
        dispatch({ type: 'ERROR', payload: { error: decodedError } });
        updateSessionStatus('failed', txHash, decodedError.message);
    }
};

// Validation functions
const validateSession = (data: unknown): TransactionSession => {
    try {
        return SessionSchema.parse(data);
    } catch (error) {
        console.error('Session validation failed:', redact(error));
        throw new Error('Invalid session data received from backend');
    }
};

const validatePreparedTransaction = (data: unknown): PreparedTransaction => {
    try {
        return PreparedTransactionSchema.parse(data) as unknown as PreparedTransaction;
    } catch (error) {
        console.error('Prepared transaction validation failed:', redact(error));
        throw new Error('Invalid transaction data received from backend');
    }
};

// Define interfaces right in the hook file for encapsulation
export interface TransactionSession {
    sessionId: string;
    transactionType: 'createFactory' | 'fundPool' | 'claimRewards' | 'createAndFundPool' | 'withdrawPool';
    transactionParams: {
        type: string;
        creator?: string;
        token?: string;
        tokenAddress?: string;
        amount?: string;
        poolAddress?: string;
        chainId?: number;
        submissionId?: string;
    };
    sessionToken: string;
    expiresAt: string;
    isExpired: boolean;
    timeRemaining: number;
}

export interface PreparedTransaction {
    contractAddress: `0x${string}`;
    spenderAddress?: `0x${string}`; // Optional: if different from contractAddress
    functionName: string;
    args: unknown[];
    value?: string | bigint; // Allow bigint for wei values
    abi: Abi;
}

export interface SimulationRequest {
    request: {
        address: `0x${string}`;
        abi?: Abi;
        functionName?: string;
        args?: readonly unknown[];
        value?: bigint;
        gas?: bigint;
        gasPrice?: bigint;
        data?: `0x${string}`;
        to?: `0x${string}`;
        chainId?: number;
        [key: string]: unknown;
    };
    result?: unknown;
}

export interface TransactionReceipt {
    status: 'success' | 'reverted';
    transactionHash: `0x${string}`;
    blockNumber: bigint;
    gasUsed: bigint;
    logs?: Array<{
        address: `0x${string}`;
        data: `0x${string}`;
        topics: `0x${string}`[];
    }>;
}

// State Machine Definition
export type TransactionState =
    | 'IDLE'
    | 'AUTHENTICATING'
    | 'FETCHING_SESSION'
    | 'CHECKING_ALLOWANCE'
    | 'NEEDS_APPROVAL'
    | 'APPROVING'
    | 'APPROVAL_CONFIRMING'
    | 'SIMULATING'
    | 'READY_TO_EXECUTE'
    | 'EXECUTING'
    | 'CONFIRMING'
    | 'SUCCESS'
    | 'ERROR'
    | 'RESET';

export type TransactionAction =
    | { type: 'START_AUTHENTICATION' }
    | { type: 'AUTHENTICATION_SUCCESS' }
    | { type: 'START_FETCHING_SESSION' }
    | { type: 'SESSION_FETCH_SUCCESS'; payload: { session: TransactionSession; preparedTx: PreparedTransaction } }
    | { type: 'START_ALLOWANCE_CHECK' }
    | { type: 'ALLOWANCE_CHECK_SUCCESS'; payload: { needsApproval: boolean } }
    | { type: 'START_APPROVAL' }
    | { type: 'APPROVAL_SUBMITTED'; payload: { txHash: `0x${string}` } }
    | { type: 'APPROVAL_CONFIRMED' }
    | { type: 'START_SIMULATION' }
    | { type: 'SIMULATION_SUCCESS'; payload: { simulationRequest: SimulationRequest } }
    | { type: 'READY_TO_EXECUTE' }
    | { type: 'EXECUTE_TRANSACTION' }
    | { type: 'TRANSACTION_SUBMITTED'; payload: { txHash: `0x${string}` } }
    | { type: 'TRANSACTION_CONFIRMED' }
    | { type: 'ERROR'; payload: { error: UserFacingError } }
    | { type: 'SET_GAS_ESTIMATE'; payload: { gasEstimate: GasEstimate } }
    | { type: 'RETRY_FROM_ERROR' }
    | { type: 'RESET' };

export interface TransactionMachineState {
    currentState: TransactionState;
    sessionData: TransactionSession | null;
    preparedTx: PreparedTransaction | null;
    gasEstimate: GasEstimate | null;
    userError: UserFacingError | null;
    txHash: `0x${string}` | null;
    approvalTxHash: `0x${string}` | null;
    needsApproval: boolean;
    simulationRequest: SimulationRequest | null;
    isAutoAuthenticating: boolean;
}

const normalizeValue = (v?: string | bigint) => (typeof v === 'bigint' ? v : v ? parseEther(v) : undefined);

// Business Logic Helpers
export const TransactionBusinessLogic = {
    requiresApprovalCheck(transactionType: string): boolean {
        return transactionType === 'fundPool' || transactionType === 'createAndFundPool';
    },

    calculateNeedsApproval(currentAllowance: bigint, requiredAmount: bigint): boolean {
        if (requiredAmount === 0n) {
            return false; // No approval needed for zero amount
        }
        return currentAllowance < requiredAmount;
    },

    isTransactionTypeValid(type: string): type is TransactionSession['transactionType'] {
        return ['createFactory', 'fundPool', 'claimRewards', 'createAndFundPool', 'withdrawPool'].includes(type);
    },

    shouldAutoAuthenticate(sessionId: string | null, isAuthenticated: boolean): boolean {
        return !!sessionId && !isAuthenticated;
    }
};

// State Transition Guards
export const StateTransitions: Record<TransactionState, TransactionState[]> = {
    'IDLE': ['AUTHENTICATING', 'FETCHING_SESSION', 'ERROR', 'RESET'],
    'AUTHENTICATING': ['FETCHING_SESSION', 'ERROR', 'RESET'],
    'FETCHING_SESSION': ['CHECKING_ALLOWANCE', 'ERROR', 'RESET'],
    'CHECKING_ALLOWANCE': ['NEEDS_APPROVAL', 'SIMULATING', 'ERROR', 'RESET'],
    'NEEDS_APPROVAL': ['APPROVING', 'ERROR', 'RESET'],
    'APPROVING': ['APPROVAL_CONFIRMING', 'ERROR', 'RESET'],
    'APPROVAL_CONFIRMING': ['SIMULATING', 'ERROR', 'RESET'],
    'SIMULATING': ['READY_TO_EXECUTE', 'ERROR', 'RESET'],
    'READY_TO_EXECUTE': ['EXECUTING', 'ERROR', 'RESET', 'SIMULATING'],
    'EXECUTING': ['CONFIRMING', 'ERROR', 'RESET'],
    'CONFIRMING': ['SUCCESS', 'ERROR', 'RESET'],
    'SUCCESS': ['IDLE', 'RESET'],
    'ERROR': ['IDLE', 'NEEDS_APPROVAL', 'READY_TO_EXECUTE', 'RESET', 'FETCHING_SESSION', 'CHECKING_ALLOWANCE'], // ERROR does not transition to itself
    'RESET': ['IDLE', 'ERROR']
};

export function canTransitionTo(from: TransactionState, to: TransactionState): boolean {
    return StateTransitions[from]?.includes(to) ?? false;
}

// State Machine Logging and Monitoring
export const StateMachineLogger = {
    logTransition(from: TransactionState, to: TransactionState, action: TransactionAction): void {
        if (process.env.NODE_ENV === 'development') {
            console.group(`🔄 State Transition: ${from} → ${to}`);
            console.log('Action:', action);
            console.log('Timestamp:', new Date().toISOString());
            console.groupEnd();
        }
    },

    logInvalidTransition(from: TransactionState, to: TransactionState): void {
        console.error(`❌ Invalid state transition: ${from} → ${to}`);
        console.error('Valid transitions from', from, ':', StateTransitions[from]);
    },

    logError(error: Error | UserFacingError, context: string): void {
        console.group(`🚨 Error in ${context}`);
        console.error('Error:', redact(error));
        console.log('Timestamp:', new Date().toISOString());
        console.groupEnd();
    }
};

// State Machine Invariants
export const StateMachineInvariants = {
    validate(state: TransactionMachineState): boolean {
        const violations: string[] = [];

        // Invariant: sessionData must exist for most states
        if (['CHECKING_ALLOWANCE', 'SIMULATING', 'READY_TO_EXECUTE', 'EXECUTING', 'CONFIRMING'].includes(state.currentState)) {
            if (!state.sessionData) {
                violations.push('sessionData is required for state ' + state.currentState);
            }
        }

        // Invariant: preparedTx must exist for execution states
        if (['SIMULATING', 'READY_TO_EXECUTE', 'EXECUTING', 'CONFIRMING'].includes(state.currentState)) {
            if (!state.preparedTx) {
                violations.push('preparedTx is required for state ' + state.currentState);
            }
        }

        if (state.currentState === 'APPROVAL_CONFIRMING' && !state.approvalTxHash) {
            violations.push('APPROVAL_CONFIRMING requires approvalTxHash');
        }

        if (state.currentState === 'CONFIRMING' && !state.txHash) {
            violations.push('CONFIRMING requires txHash');
        }

        if (state.currentState === 'READY_TO_EXECUTE' && !state.simulationRequest) {
            violations.push('READY_TO_EXECUTE requires simulationRequest');
        }

        // Invariant: error states should have error messages
        if (state.currentState === 'ERROR' && !state.userError) {
            violations.push('ERROR state must have userError');
        }

        // Invariant: success state should have transaction hash
        if (state.currentState === 'SUCCESS' && !state.txHash) {
            violations.push('SUCCESS state should have txHash');
        }

        if (violations.length > 0) {
            console.warn('⚠️ State invariant violations:', violations);

            // In development, throw on invariant violations to catch bugs early
            if (process.env.NODE_ENV === 'development') {
                throw new Error(`State machine invariant violations: ${violations.join(', ')}`);
            }

            return false;
        }

        return true;
    }
};

// Type-safe writeContract helper
type WriteParams<A extends Abi, F extends Extract<AbiFunction, { name: string }>> = {
    abi: A;
    address: `0x${string}`;
    functionName: F['name'];
    args: any[]; // Could be typed more strictly if needed
    value?: bigint;
    account?: `0x${string}`;
    chainId?: number;
};

function buildWriteParams<A extends Abi>(
    pt: PreparedTransaction,
    account?: `0x${string}`,
    chainId?: number
): WriteParams<A, any> {
    return {
        abi: pt.abi as A,
        address: pt.contractAddress,
        functionName: pt.functionName as any,
        args: pt.args as any,
        ...(typeof pt.value === 'bigint' ? { value: pt.value } : pt.value ? { value: parseEther(pt.value) } : {}),
        ...(account && { account }),
        ...(chainId && { chainId }),
    };
}


function createStateTransition(from: TransactionState, to: TransactionState, action?: TransactionAction): TransactionState | null {
    if (!canTransitionTo(from, to)) {
        StateMachineLogger.logInvalidTransition(from, to);
        return null;
    }

    if (action) {
        StateMachineLogger.logTransition(from, to, action);
    }

    return to;
}

const initialState: TransactionMachineState = {
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
};

export function transactionReducer(state: TransactionMachineState, action: TransactionAction): TransactionMachineState {
    // Validate current state invariants before processing action
    StateMachineInvariants.validate(state);

    // Validate state transitions with guards
    const validateTransition = (targetState: TransactionState): TransactionState | null => {
        return createStateTransition(state.currentState, targetState, action);
    };

    switch (action.type) {
        case 'START_AUTHENTICATION': {
            const newState = validateTransition('AUTHENTICATING');
            if (!newState) return state;
            return {
                ...state,
                currentState: newState,
                isAutoAuthenticating: newState === 'AUTHENTICATING',
                userError: null
            };
        }

        case 'AUTHENTICATION_SUCCESS': {
            const newState = validateTransition('FETCHING_SESSION');
            if (!newState) return state;
            return {
                ...state,
                currentState: newState,
                isAutoAuthenticating: false
            };
        }

        case 'START_FETCHING_SESSION': {
            // Prevent duplicate fetching session actions
            if (state.currentState === 'FETCHING_SESSION') {
                console.warn('Ignoring duplicate START_FETCHING_SESSION action');
                return state;
            }
            const newState = validateTransition('FETCHING_SESSION');
            if (!newState) return state;
            return {
                ...state,
                currentState: newState,
                userError: null
            };
        }

        case 'SESSION_FETCH_SUCCESS': {
            const newState = validateTransition('CHECKING_ALLOWANCE');
            if (!newState) return state;
            return {
                ...state,
                currentState: newState,
                sessionData: action.payload.session,
                preparedTx: action.payload.preparedTx
            };
        }

        case 'ALLOWANCE_CHECK_SUCCESS': {
            // Business logic centralized in reducer
            const targetState = action.payload.needsApproval ? 'NEEDS_APPROVAL' : 'SIMULATING';
            const newState = validateTransition(targetState);
            if (!newState) return state;
            return {
                ...state,
                currentState: newState,
                needsApproval: action.payload.needsApproval
            };
        }

        case 'START_APPROVAL': {
            // Prevent duplicate approval actions
            if (state.currentState === 'APPROVING') {
                console.warn('Ignoring duplicate START_APPROVAL action');
                return state;
            }
            const newState = validateTransition('APPROVING');
            if (!newState) return state;
            return {
                ...state,
                currentState: newState
            };
        }

        case 'APPROVAL_SUBMITTED': {
            const newState = validateTransition('APPROVAL_CONFIRMING');
            if (!newState) return state;
            return {
                ...state,
                currentState: newState,
                approvalTxHash: action.payload.txHash
            };
        }

        case 'APPROVAL_CONFIRMED': {
            const newState = validateTransition('SIMULATING');
            if (!newState) return state;
            return {
                ...state,
                currentState: newState,
                needsApproval: false
            };
        }

        case 'START_SIMULATION': {
            const newState = validateTransition('SIMULATING');
            if (!newState) return state;
            return {
                ...state,
                currentState: newState
            };
        }

        case 'SIMULATION_SUCCESS': {
            const newState = validateTransition('READY_TO_EXECUTE');
            if (!newState) return state;
            return {
                ...state,
                currentState: newState,
                simulationRequest: action.payload.simulationRequest
            };
        }

        case 'EXECUTE_TRANSACTION': {
            const newState = validateTransition('EXECUTING');
            if (!newState) return state;
            return {
                ...state,
                currentState: newState
            };
        }

        case 'TRANSACTION_SUBMITTED': {
            const newState = validateTransition('CONFIRMING');
            if (!newState) return state;
            return {
                ...state,
                currentState: newState,
                txHash: action.payload.txHash
            };
        }

        case 'TRANSACTION_CONFIRMED': {
            const newState = validateTransition('SUCCESS');
            if (!newState) return state;
            return {
                ...state,
                currentState: newState
            };
        }

        case 'ERROR': {
            if (state.currentState === 'ERROR') {
                console.warn('Ignoring redundant error dispatch:', action.payload.error);
                return state;
            }
            const newState = validateTransition('ERROR');
            if (!newState) return state;
            const newStateObj = {
                ...state,
                currentState: newState,
                userError: action.payload.error
            };

            // Log error with context
            StateMachineLogger.logError(action.payload.error, `State: ${state.currentState}`);

            // Validate final state
            StateMachineInvariants.validate(newStateObj);

            return newStateObj;
        }

        case 'SET_GAS_ESTIMATE': {
            // Gas estimation doesn't change state
            return {
                ...state,
                gasEstimate: action.payload.gasEstimate
            };
        }

        case 'RETRY_FROM_ERROR': {
            if (state.currentState === 'ERROR') {
                const baseReset = {
                    userError: null,
                    txHash: null,
                    approvalTxHash: null,
                    gasEstimate: null // Always reset gas estimate on retry
                };

                let targetState: TransactionState;
                let nextStateChanges: Partial<TransactionMachineState> = {};

                // If we were in approval flow, go back to NEEDS_APPROVAL
                if (state.needsApproval) {
                    targetState = 'NEEDS_APPROVAL';
                    nextStateChanges = { simulationRequest: null, gasEstimate: null };
                }
                // If we have a simulation, go back to READY_TO_EXECUTE, but PRESERVE the simulation request
                else if (state.simulationRequest) {
                    targetState = 'READY_TO_EXECUTE';
                    // Don't reset gasEstimate here to preserve it for shallow retry
                }
                // Fallback to re-checking allowance if session is present (deep retry)
                else if (state.sessionData) {
                    targetState = 'CHECKING_ALLOWANCE';
                    nextStateChanges = { simulationRequest: null, gasEstimate: null };
                }
                // Fallback: If no session data, try fetching it again (deep retry)
                else {
                    targetState = 'FETCHING_SESSION';
                    nextStateChanges = { simulationRequest: null, preparedTx: null, gasEstimate: null };
                }

                const validatedTargetState = validateTransition(targetState);
                if (!validatedTargetState) return state;

                return {
                    ...state,
                    ...baseReset,
                    ...nextStateChanges,
                    currentState: validatedTargetState
                };
            }
            return state;
        }

        case 'RESET': {
            return initialState;
        }

        default: {
            console.warn(`⚠️ Unknown action type:`, action);
            return state;
        }
    }
}

// Side Effects Middleware
interface SideEffect {
    execute: () => Promise<void>;
    cleanup?: () => void;
}

type SideEffectHandler = (
    state: TransactionMachineState,
    dispatch: React.Dispatch<TransactionAction>,
    dependencies: {
        searchParams: URLSearchParams;
        isAuthenticated: boolean;
        establishSessionFromTransaction: (sessionId: string) => Promise<void>;
        secureCall: (url: string, options?: RequestInit) => Promise<Response>;
        estimateGas: () => Promise<void>;
        isAuthenticatingRef: React.MutableRefObject<boolean>;
        lastAuthAttempt: React.MutableRefObject<number>;
        authFailureCount: React.MutableRefObject<number>;
    }
) => SideEffect | null;

const createSideEffectsMiddleware = (handlers: Record<TransactionState, SideEffectHandler>) => {
    return (
        state: TransactionMachineState,
        dispatch: React.Dispatch<TransactionAction>,
        dependencies: Parameters<SideEffectHandler>[2]
    ): SideEffect | null => {
        const handler = handlers[state.currentState];
        return handler ? handler(state, dispatch, dependencies) : null;
    };
};


const sideEffectHandlers: Record<TransactionState, SideEffectHandler> = {
    'IDLE': () => null,
    'AUTHENTICATING': (_state, dispatch, { searchParams, establishSessionFromTransaction, isAuthenticatingRef, lastAuthAttempt, authFailureCount }) => {
        const sessionId = searchParams.get('sessionId');
        if (!sessionId) return null;

        return {
            execute: async () => {
                // Prevent concurrent authentication attempts
                if (isAuthenticatingRef.current) {
                    console.warn('🚫 Authentication already in progress, skipping duplicate call');
                    return;
                }

                // Circuit breaker: prevent auth spam
                const now = Date.now();
                const timeSinceLastAttempt = now - lastAuthAttempt.current;

                if (authFailureCount.current >= 3) {
                    const waitTime = Math.min(5000 * Math.pow(2, authFailureCount.current - 3), 30000); // Max 30s
                    if (timeSinceLastAttempt < waitTime) {
                        console.warn(`🚫 Auth circuit breaker: waiting ${Math.ceil((waitTime - timeSinceLastAttempt) / 1000)}s before retry`);
                        const userError = {
                            title: 'Too Many Attempts',
                            message: `Please wait ${Math.ceil(waitTime / 1000)} seconds before trying again.`,
                            code: 'E_RATE_LIMITED',
                            category: 'user' as const
                        };
                        dispatch({ type: 'ERROR', payload: { error: userError } });
                        return;
                    }
                }

                // Mark as authenticating BEFORE making the call
                isAuthenticatingRef.current = true;
                lastAuthAttempt.current = now;

                try {
                    await establishSessionFromTransaction(sessionId);
                    authFailureCount.current = 0; // Reset on success
                    dispatch({ type: 'AUTHENTICATION_SUCCESS' });
                } catch (error) {
                    authFailureCount.current++;
                    console.error('❌ Auto-authentication failed:', redact(error));
                    const userError = error instanceof Error
                        ? { title: 'Authentication Failed', message: error.message, code: 'E_AUTH_FAILED', category: 'unknown' as const }
                        : { title: 'Authentication Failed', message: 'Auto-authentication failed', code: 'E_AUTH_FAILED', category: 'unknown' as const };
                    dispatch({ type: 'ERROR', payload: { error: userError } });
                } finally {
                    isAuthenticatingRef.current = false;
                }
            }
        };
    },

    'FETCHING_SESSION': (_state, dispatch, { searchParams, secureCall }) => {
        const sessionId = searchParams.get('sessionId');
        if (!sessionId) return null;

        const controller = new AbortController();

        return {
            execute: async () => {
                try {
                    const sessionResponse = await secureCall(`/api/v1/transaction/session?sessionId=${sessionId}`, { signal: controller.signal });
                    if (!sessionResponse.ok) throw new Error(`Failed to fetch session: ${sessionResponse.status}`);
                    const sessionJson = await sessionResponse.json();
                    const session = validateSession((sessionJson as { data: unknown }).data);

                    if (session.isExpired) {
                        try {
                            await secureCall('/api/v1/transaction/complete', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ sessionId, status: 'failed', error: 'Session expired' }),
                                signal: controller.signal
                            });
                        } catch (e) {
                            if (!(e instanceof Error && e.name === 'AbortError')) {
                                console.warn('Failed to notify backend of expired session', e);
                            }
                        }

                        dispatch({
                            type: 'ERROR',
                            payload: {
                                error: { title: 'Session Expired', message: 'Transaction session has expired. Please try again from the desktop app.', code: 'E_SESSION_EXPIRED', category: 'unknown' }
                            }
                        });
                        return;
                    }

                    if (controller.signal.aborted) return;

                    const response = await secureCall('/api/v1/transaction/prepare-tx', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            sessionToken: session.sessionToken,
                            ...session.transactionParams
                        }),
                        signal: controller.signal
                    });

                    if (!response.ok) {
                        // Try to extract the error message from the API response
                        let errorMessage = `Failed to prepare transaction: ${response.statusText}`;
                        try {
                            const errorData = await response.json();
                            if (errorData?.error?.message) {
                                errorMessage = errorData.error.message;
                            }
                        } catch (parseError) {
                            // If parsing fails, we'll use the default error message
                            console.warn('Failed to parse error response:', parseError);
                        }
                        throw new Error(errorMessage);
                    }

                    if (controller.signal.aborted) return;

                    const prepareData = await response.json();
                    const preparedTx = validatePreparedTransaction((prepareData as { data: unknown }).data);
                    assertPreparedMatchesType(session, preparedTx);
                    dispatch({
                        type: 'SESSION_FETCH_SUCCESS',
                        payload: {
                            session,
                            preparedTx
                        }
                    });
                } catch (err) {
                    if (err instanceof Error && err.name === 'AbortError') {
                        console.log('Fetch aborted in FETCHING_SESSION side effect.');
                        return;
                    }
                    const message = err instanceof Error ? err.message : 'Failed to load transaction session';
                    dispatch({
                        type: 'ERROR',
                        payload: {
                            error: { title: 'Initialization Failed', message, code: 'E_INIT_FAILED', category: 'unknown' }
                        }
                    });
                }
            },
            cleanup: () => {
                controller.abort();
            }
        };
    },

    'CHECKING_ALLOWANCE': () => null, // Handled by wagmi hook
    'NEEDS_APPROVAL': () => null,
    'APPROVING': () => null, // Handled by wagmi hook
    'APPROVAL_CONFIRMING': () => null, // Handled by wagmi hook
    'SIMULATING': () => null, // Handled by wagmi hook
    'READY_TO_EXECUTE': () => null,
    'EXECUTING': () => null, // Handled by wagmi hook
    'CONFIRMING': () => null, // Handled by wagmi hook
    'SUCCESS': () => null,
    'ERROR': () => null,
    'RESET': () => null // Reset is handled by the reducer directly
};

const ALL_ABIS = [RewardPoolFactoryAbi, RewardPoolImplementationAbi, ClaimRouterAbi] as Abi[];

export const useTransactionProcessor = () => {
    const [searchParams] = useSearchParams();
    const { address, isConnected } = useAccount();
    const chainId = useChainId();
    const config = useConfig();
    const currentChain = config.chains.find(chain => chain.id === chainId);
    const { isAuthenticated, secureCall, establishSessionFromTransaction } = useAuth();

    const [state, dispatch] = useReducer(transactionReducer, initialState);
    const isAuthenticatingRef = useRef(false);
    const activeEffectRef = useRef<SideEffect | null>(null);
    const lastGasReqId = useRef(0);
    const authFailureCount = useRef(0);
    const lastAuthAttempt = useRef(0);

    const { writeContract, data: writeData, isPending: isWritePending, error: writeError } = useWriteContract();

    // Single writeContract instance handles both approvals and transactions

    const { isSuccess: isApprovalConfirmed, isLoading: isApprovalConfirming, isError: isApprovalError, error: approvalReceiptError } = useWaitForTransactionReceipt({
        hash: state.approvalTxHash ? (state.approvalTxHash as `0x${string}`) : undefined,
        query: { enabled: !!state.approvalTxHash }
    });

    const { data: approvalConfirmations } = useTransactionConfirmations({
        hash: state.approvalTxHash ?? undefined,
        query: {
            enabled: state.currentState === 'APPROVAL_CONFIRMING' && !!state.approvalTxHash,
            refetchInterval: 2000, // Poll for confirmations every 2s
        }
    });

    const tokenAddress = state.sessionData?.transactionParams?.tokenAddress as `0x${string}` | undefined;
    const spender = (state.preparedTx?.spenderAddress ?? state.preparedTx?.contractAddress) as `0x${string}` | undefined;

    const { data: tokenDecimalsRaw, isError: isDecimalsError, error: decimalsError } = useReadContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'decimals',
        query: { enabled: !!(state.currentState === 'CHECKING_ALLOWANCE' && tokenAddress) },
    });
    const tokenDecimals = (tokenDecimalsRaw as number | undefined) ?? 18;

    const { data: allowance, isLoading: isAllowanceLoading, refetch: refetchAllowance } = useReadContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'allowance',
        args: address && spender ? [address, spender] : undefined,
        query: {
            enabled: !!(state.currentState === 'CHECKING_ALLOWANCE' &&
                (state.sessionData?.transactionType === 'fundPool' || state.sessionData?.transactionType === 'createAndFundPool') &&
                address && spender && state.sessionData.transactionParams.tokenAddress),
        },
    });

    const { data: receipt, isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: writeData });

    const updateSessionStatus = useCallback(async (status: 'completed' | 'failed' | 'cancelled', txHash?: string, error?: string) => {
        if (!state.sessionData) return;
        try {
            await secureCall('/api/v1/transaction/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId: state.sessionData.sessionId, status, txHash, error })
            });
        } catch (err) {
            console.error('Failed to update session status:', redact(err));
        }
    }, [state.sessionData, secureCall]);

    const { data: simulationRequest, error: simulationError, isSuccess: isSimulationSuccess, refetch: refetchSimulation } = useSimulateContract(state.preparedTx ? {
        address: state.preparedTx.contractAddress,
        abi: state.preparedTx.abi,
        functionName: state.preparedTx.functionName,
        args: state.preparedTx.args,
        value: normalizeValue(state.preparedTx.value),
        ...(address && { account: address }),
        query: {
            enabled: false,
        },
    } : { query: { enabled: false } });

    // Trigger simulation manually when state enters 'SIMULATING'
    useEffect(() => {
        if (state.currentState === 'SIMULATING') {
            refetchSimulation?.();
        }
    }, [state.currentState, refetchSimulation]);

    // Verify chain consistency
    useEffect(() => {
        const expectedChainId = state.sessionData?.transactionParams?.chainId;
        if (expectedChainId && currentChain && expectedChainId !== currentChain.id) {
            // Prevent spamming dispatch if already in an error state
            if (state.currentState === 'ERROR' && state.userError?.code === 'E_WRONG_CHAIN') return;

            dispatch({
                type: 'ERROR',
                payload: {
                    error: {
                        title: 'Wrong Network',
                        message: `Please switch to the correct network (Chain ID: ${expectedChainId}). You are currently on Chain ID: ${currentChain.id}.`,
                        code: 'E_WRONG_CHAIN',
                        category: 'user',
                        context: { expectedChainId }
                    }
                }
            });
        }
    }, [state.sessionData, currentChain, state.currentState, state.userError, dispatch]);

    // Verify account consistency
    useEffect(() => {
        const expectedAccount = state.sessionData?.transactionParams?.creator?.toLowerCase();
        if (expectedAccount && address && expectedAccount !== address.toLowerCase()) {
            if (state.currentState === 'ERROR' && state.userError?.code === 'E_WRONG_ACCOUNT') return;
            dispatch({
                type: 'ERROR',
                payload: {
                    error: {
                        title: 'Wrong Account',
                        message: `Please connect with the correct wallet address: ${expectedAccount}.`,
                        code: 'E_WRONG_ACCOUNT',
                        category: 'user',
                        context: { expectedAccount }
                    }
                }
            });
        }
    }, [address, state.sessionData, state.currentState, state.userError, dispatch]);

    // Allowance checking effect - triggered when in CHECKING_ALLOWANCE state
    useEffect(() => {
        if (state.currentState !== 'CHECKING_ALLOWANCE') return;

        const requires = TransactionBusinessLogic.requiresApprovalCheck(state.sessionData?.transactionType || '');
        if (!requires) {
            dispatch({ type: 'ALLOWANCE_CHECK_SUCCESS', payload: { needsApproval: false } });
            return;
        }

        if (tokenAddress && isDecimalsError) {
            console.error("Failed to fetch token decimals:", redact(decimalsError));
            dispatch({
                type: 'ERROR',
                payload: {
                    error: {
                        title: 'Token Error',
                        message: 'Could not read token properties. The token may be non-standard or on the wrong network.',
                        code: 'E_DECIMALS_FETCH',
                        category: 'contract'
                    }
                }
            });
            return;
        }

        if (!state.sessionData?.transactionParams.amount) return;
        if (tokenAddress && tokenDecimalsRaw === undefined) return; // Wait for the real value to be fetched
        if (isAllowanceLoading || allowance === undefined) return;

        try {
            const required = parseUnits(state.sessionData.transactionParams.amount, tokenDecimals);
            const needsApproval = (allowance as bigint) < required;
            dispatch({ type: 'ALLOWANCE_CHECK_SUCCESS', payload: { needsApproval } });
        } catch (error) {
            console.error('Error checking allowance:', redact(error));
            dispatch({
                type: 'ERROR',
                payload: {
                    error: { title: 'Allowance Check Failed', message: 'Failed to check token allowance.', code: 'E_ALLOWANCE_CHECK', category: 'contract' }
                }
            });
        }
    }, [state.currentState, allowance, isAllowanceLoading, tokenDecimals, tokenDecimalsRaw, tokenAddress, state.sessionData, isDecimalsError, decimalsError, dispatch]);

    // Simulation result effect
    useEffect(() => {
        if (state.currentState === 'SIMULATING') {
            if (simulationError) {
                const decodedError = toUserError(simulationError, { abis: ALL_ABIS });
                dispatch({ type: 'ERROR', payload: { error: decodedError } });
                updateSessionStatus('failed', undefined, decodedError.message);
            } else if (isSimulationSuccess && simulationRequest) {
                dispatch({ type: 'SIMULATION_SUCCESS', payload: { simulationRequest } });
            }
        }
    }, [state.currentState, simulationError, isSimulationSuccess, simulationRequest, updateSessionStatus]);

    // Transaction write error handling
    useEffect(() => {
        if (writeError && (state.currentState === 'EXECUTING' || state.currentState === 'CONFIRMING')) {
            dispatchUserError(dispatch, writeError, 'transaction', updateSessionStatus, state.txHash ?? undefined);
        }
    }, [writeError, state.currentState, state.txHash, updateSessionStatus]);

    // Approval error handling
    useEffect(() => {
        if (writeError && state.currentState === 'APPROVING') {
            dispatchUserError(dispatch, writeError, 'approval', updateSessionStatus, state.approvalTxHash ?? undefined);
        }
    }, [writeError, state.currentState, state.approvalTxHash, updateSessionStatus]);

    useEffect(() => {
        if ((isApprovalError || approvalReceiptError) && !isWritePending && !isApprovalConfirming) {
            dispatchUserError(dispatch, approvalReceiptError, 'approval', updateSessionStatus, state.approvalTxHash ?? undefined);
        }
    }, [isApprovalError, approvalReceiptError, isWritePending, isApprovalConfirming, state.approvalTxHash, updateSessionStatus]);

    const estimateGas = useCallback(async () => {
        if (!state.sessionData) return;

        // Anti-race: prevent slow estimation from overwriting newer one
        const reqId = ++lastGasReqId.current;

        try {
            const gasService = new GasEstimationService(secureCall);
            const estimate = await gasService.estimateGas(state.sessionData.transactionType, state.sessionData.transactionParams);

            // Only dispatch if this is still the latest request
            if (reqId === lastGasReqId.current) {
                dispatch({ type: 'SET_GAS_ESTIMATE', payload: { gasEstimate: estimate } });
            }
        } catch (err) {
            console.warn('Gas estimation failed:', redact(err));
        }
    }, [state.sessionData, secureCall]);

    // Create middleware after handlers are defined
    const sideEffectsMiddleware = useMemo(() => createSideEffectsMiddleware(sideEffectHandlers), []);

    // Handle missing session ID
    useEffect(() => {
        const sessionId = searchParams.get('sessionId');
        if (state.currentState === 'IDLE' && !sessionId) {
            dispatch({
                type: 'ERROR',
                payload: {
                    error: { title: 'Missing Session ID', message: 'Transaction session ID is missing from URL.', code: 'E_NO_SESSION', category: 'unknown' }
                }
            });
        }
    }, [state.currentState, searchParams]);

    // Initialization effect - runs once when authenticated and in IDLE state
    useEffect(() => {
        const sessionId = searchParams.get('sessionId');

        if (state.currentState === 'IDLE' && sessionId && isAuthenticated) {
            dispatch({ type: 'START_FETCHING_SESSION' });
        }
    }, [state.currentState, searchParams, isAuthenticated]);

    // Auto-authentication effect
    useEffect(() => {
        const sessionId = searchParams.get('sessionId');

        if (state.currentState === 'IDLE' && sessionId && !isAuthenticated && !state.isAutoAuthenticating) {
            // Don't auto-retry if we've failed recently and are in cooldown
            const now = Date.now();
            const timeSinceLastAttempt = now - lastAuthAttempt.current;
            const isInCooldown = authFailureCount.current >= 3 && timeSinceLastAttempt < 5000;

            if (!isInCooldown) {
                console.log('🚀 Triggering auto-authentication for sessionId:', sessionId);
                dispatch({ type: 'START_AUTHENTICATION' });
            } else {
                console.warn('🚫 Auto-authentication in cooldown, skipping');
            }
        }
    }, [state.currentState, searchParams, isAuthenticated, state.isAutoAuthenticating]);

    // Central Side Effects Handler for other states
    useEffect(() => {
        // Skip IDLE state as it's handled above
        if (state.currentState === 'IDLE') return;

        // Cleanup previous effect
        if (activeEffectRef.current?.cleanup) {
            activeEffectRef.current.cleanup();
            activeEffectRef.current = null;
        }

        // Get side effect for current state
        const effect = sideEffectsMiddleware(state, dispatch, {
            searchParams,
            isAuthenticated,
            establishSessionFromTransaction,
            secureCall,
            estimateGas,
            isAuthenticatingRef,
            lastAuthAttempt,
            authFailureCount
        });

        if (effect) {
            activeEffectRef.current = effect;
            effect.execute().catch((err) => console.error('Side effect error:', redact(err)));
        }

        // Cleanup on unmount
        return () => {
            if (activeEffectRef.current?.cleanup) {
                activeEffectRef.current.cleanup();
            }
        };
    }, [state, searchParams, isAuthenticated, sideEffectsMiddleware, establishSessionFromTransaction, secureCall, estimateGas, lastAuthAttempt, authFailureCount]);

    const executeApproval = useCallback(() => {
        // NOTE on Approval Amount:
        // We currently approve the exact transaction amount for maximum security,
        // preventing potential allowance abuse. If an "infinite approval" feature is
        // considered in the future, it should be an explicit opt-in from the user
        // and should still use a capped value rather than MAX_UINT256 unless
        // absolutely necessary and the risks are clearly communicated.

        if (!tokenAddress || !spender || !state.sessionData?.transactionParams.amount) return;

        // Require a connected wallet before attempting approval
        if (!isConnected || !address) {
            dispatch({
                type: 'ERROR',
                payload: {
                    error: {
                        title: 'Wallet not connected',
                        message: 'Please connect your wallet to approve tokens.',
                        code: 'E_WALLET_NOT_CONNECTED',
                        category: 'user'
                    }
                }
            });
            return;
        }

        // Prevent multiple approval attempts
        if (state.currentState !== 'NEEDS_APPROVAL') {
            console.warn('executeApproval called but not in NEEDS_APPROVAL state:', state.currentState);
            return;
        }

        dispatch({ type: 'START_APPROVAL' });
        writeContract({
            address: tokenAddress,
            // Note: No 'outputs' field for maximum token compatibility
            // Some tokens (USDT, BNB, etc.) don't return bool from approve()
            // Omitting outputs prevents ABI decode errors with non-standard tokens
            abi: [{ name: 'approve', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }] }],
            functionName: 'approve',
            args: [spender, parseUnits(state.sessionData.transactionParams.amount, tokenDecimals)],
            ...(address && { account: address }),
            ...(chainId && { chainId }),
        });
    }, [state.sessionData, state.currentState, writeContract, address, isConnected, tokenDecimals, tokenAddress, spender, chainId, dispatch]);

    const executeTransaction = useCallback(() => {
        if (state.currentState !== 'READY_TO_EXECUTE' || isWritePending) {
            console.warn('executeTransaction called but not in READY_TO_EXECUTE state or write is pending:', state.currentState);
            return;
        }
        if (!state.preparedTx) {
            console.error('preparedTx is null in executeTransaction');
            return;
        }

        // Require a connected wallet before attempting main transaction
        if (!isConnected || !address) {
            dispatch({
                type: 'ERROR',
                payload: {
                    error: {
                        title: 'Wallet not connected',
                        message: 'Please connect your wallet to execute the transaction.',
                        code: 'E_WALLET_NOT_CONNECTED',
                        category: 'user'
                    }
                }
            });
            return;
        }

        // Stale simulation check: ensure chain and account have not changed since simulation
        const simulatedChainId = state.simulationRequest?.request.chainId;
        const simulatedAccountRaw = (state.simulationRequest?.request as { account?: any })?.account;

        // Extract address from account object (Wagmi can return { address: "0x...", type: "json-rpc" })
        const simulatedAccount = typeof simulatedAccountRaw === 'string'
            ? simulatedAccountRaw
            : simulatedAccountRaw?.address;

        if (simulatedChainId !== currentChain?.id || (simulatedAccount && simulatedAccount.toLowerCase() !== address?.toLowerCase())) {
            console.warn('Stale simulation detected. Chain or account has changed. Re-simulating...');
            dispatch({ type: 'START_SIMULATION' });
            return;
        }

        // Security: Use only validated preparedTx data (never trust simulationRequest for execution)
        dispatch({ type: 'EXECUTE_TRANSACTION' });
        writeContract(buildWriteParams(state.preparedTx, address, chainId));
    }, [state.preparedTx, state.simulationRequest, state.currentState, isWritePending, address, isConnected, chainId, currentChain, writeContract, dispatch]);

    // Handle approval confirmation and recheck allowance
    useEffect(() => {
        if (isApprovalConfirmed && state.currentState === 'APPROVAL_CONFIRMING') {
            let cancelled = false;

            const recheckAllowance = async () => {
                const startTime = Date.now();
                try {
                    for (let i = 0; i < BACKOFF_CONFIG.maxRetries; i++) {
                        if (cancelled) return; // Check cancellation flag

                        if (Date.now() - startTime > BACKOFF_CONFIG.timeoutMs) {
                            throw new Error(`Allowance verification timed out after ${BACKOFF_CONFIG.timeoutMs / 1000} seconds.`);
                        }

                        const { data: newAllowance } = await refetchAllowance();
                        if (cancelled) return; // Check cancellation flag after async operation

                        if (newAllowance !== undefined && state.sessionData?.transactionParams.amount) {
                            const requiredAmount = parseUnits(state.sessionData.transactionParams.amount, tokenDecimals);
                            if ((newAllowance as bigint) >= requiredAmount) {
                                if (!cancelled) {
                                    dispatch({ type: 'APPROVAL_CONFIRMED' });
                                }
                                return;
                            }

                            // Early exit if approval is confirmed with wrong amount after enough blocks.
                            // This prevents polling indefinitely if the user approved a smaller amount.
                            if ((newAllowance as bigint) < requiredAmount && approvalConfirmations && approvalConfirmations >= BACKOFF_CONFIG.confirmationThreshold) {
                                throw new Error(`Approval confirmed with insufficient allowance after ${BACKOFF_CONFIG.confirmationThreshold}+ confirmations.`);
                            }
                        }

                        const delay = Math.min(BACKOFF_CONFIG.baseDelayMs * 2 ** i, BACKOFF_CONFIG.maxDelayMs);
                        await new Promise(resolve => setTimeout(resolve, delay));
                    }
                    throw new Error('Allowance did not update in time after multiple retries.');
                } catch (error) {
                    if (cancelled) return; // Don't dispatch error if cancelled

                    console.error('Failed to recheck allowance after approval:', redact(error));
                    const message = error instanceof Error ? error.message : 'Could not verify token approval. Please refresh and try again.';
                    dispatch({
                        type: 'ERROR',
                        payload: {
                            error: { title: 'Approval Verification Failed', message, code: 'E_APPROVAL_VERIFICATION', category: 'contract' }
                        }
                    });
                }
            };

            recheckAllowance();

            // Cleanup function to cancel the operation
            return () => {
                cancelled = true;
            };
        }
    }, [isApprovalConfirmed, state.currentState, refetchAllowance, state.sessionData, tokenDecimals, dispatch, approvalConfirmations]);

    // Handle transaction submission
    useEffect(() => {
        if (writeData && state.currentState === 'EXECUTING') {
            dispatch({ type: 'TRANSACTION_SUBMITTED', payload: { txHash: writeData } });
        }
    }, [writeData, state.currentState]);

    // Handle approval transaction submission
    useEffect(() => {
        if (writeData && state.currentState === 'APPROVING') {
            dispatch({ type: 'APPROVAL_SUBMITTED', payload: { txHash: writeData } });
        }
    }, [writeData, state.currentState]);

    // Handle transaction confirmation
    useEffect(() => {
        if (state.sessionData && state.txHash && isConfirmed && receipt && state.currentState === 'CONFIRMING') {
            if (receipt.status === 'success') {
                dispatch({ type: 'TRANSACTION_CONFIRMED' });
                updateSessionStatus('completed', state.txHash);
            } else if (receipt.status === 'reverted') {
                const err = { title: 'Transaction Failed', message: 'Transaction was reverted by the smart contract', code: 'E_TX_REVERTED', category: 'contract' as const };
                dispatch({ type: 'ERROR', payload: { error: err } });
                updateSessionStatus('failed', state.txHash, err.message);
            }
        }
    }, [isConfirmed, receipt, state.txHash, state.sessionData, state.currentState, updateSessionStatus]);

    // Gas estimation effect - triggered when session data is available
    useEffect(() => {
        if (state.sessionData && state.preparedTx && !state.gasEstimate) {
            estimateGas();
        }
    }, [state.sessionData, state.preparedTx, state.gasEstimate, estimateGas]);

    // Track wallet values to detect real changes
    const lastWalletState = useRef({ address, chainId });

    // Reset flow if account or chain changes during critical states
    useEffect(() => {
        const criticalStates = ['SIMULATING', 'EXECUTING', 'CONFIRMING', 'APPROVAL_CONFIRMING'];
        const realAddressChange = lastWalletState.current.address !== address;
        const realChainChange = lastWalletState.current.chainId !== chainId;

        if (criticalStates.includes(state.currentState) && (realAddressChange || realChainChange)) {
            console.warn('Wallet address or chain changed during transaction. Resetting flow.', {
                oldAddress: lastWalletState.current.address,
                newAddress: address,
                oldChain: lastWalletState.current.chainId,
                newChain: chainId
            });
            updateSessionStatus('cancelled', undefined, 'Wallet/network changed mid-flow');
            dispatch({ type: 'RESET' });
        }

        // Update ref after check
        lastWalletState.current = { address, chainId };
    }, [address, chainId, state.currentState, updateSessionStatus]);

    const retryFromError = useCallback(() => {
        dispatch({ type: 'RETRY_FROM_ERROR' });
    }, []);

    const refreshGasEstimate = useCallback(() => {
        if (state.sessionData) {
            estimateGas();
        }
    }, [state.sessionData, estimateGas]);

    const isBusy = useMemo(() =>
        ['AUTHENTICATING', 'FETCHING_SESSION', 'CHECKING_ALLOWANCE', 'SIMULATING', 'EXECUTING', 'CONFIRMING', 'APPROVING', 'APPROVAL_CONFIRMING'].includes(state.currentState)
        , [state.currentState]);

    return {
        userError: state.userError,
        sessionData: state.sessionData,
        gasEstimate: state.gasEstimate,
        gasEstimateSource: 'server-side' as const, // UI can show "Estimated server-side"
        needsApproval: state.needsApproval,
        isConfirmed: state.currentState === 'SUCCESS',
        txHash: state.txHash,
        isSimulating: state.currentState === 'SIMULATING',
        isApprovalPending: isWritePending && state.currentState === 'APPROVING',
        isApprovalConfirming,
        isWritePending,
        isConfirming,
        canExecute: state.currentState === 'READY_TO_EXECUTE' && !isWritePending && !isConfirming,
        isBusy,
        executeApproval,
        executeTransaction,
        updateSessionStatus,
        retryFromError,
        refreshGasEstimate,
        isAutoAuthenticating: state.isAutoAuthenticating,
        isAuthenticated
    };
};
