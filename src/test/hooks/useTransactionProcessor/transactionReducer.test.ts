import {
    transactionReducer,
    type TransactionAction,
    StateTransitions,
    type TransactionMachineState,
    type TransactionState,
} from '../../../hooks/useTransactionProcessor';
import {
    createMockState,
    createMockTransactionSession,
    createMockPreparedTransaction,
    createMockUserError,
    createMockGasEstimate,
    createMockTxHash,
    expectStateTransition,
    expectStateUnchanged
} from './setup';

describe('transactionReducer', () => {
    let initialState: TransactionMachineState;

    beforeEach(() => {
        initialState = createMockState();
        // Suppress console logs for cleaner test output
        jest.spyOn(console, 'warn').mockImplementation(() => { });
        jest.spyOn(console, 'error').mockImplementation(() => { });
        jest.spyOn(console, 'group').mockImplementation(() => { });
        jest.spyOn(console, 'groupEnd').mockImplementation(() => { });
        jest.spyOn(console, 'log').mockImplementation(() => { });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('Core Transitions', () => {
        test('IDLE -> AUTHENTICATING on START_AUTHENTICATION', () => {
            const action: TransactionAction = { type: 'START_AUTHENTICATION' };
            expectStateTransition(initialState, action, 'AUTHENTICATING', transactionReducer);

            const result = transactionReducer(initialState, action);
            expect(result.isAutoAuthenticating).toBe(true);
        });

        test('AUTHENTICATING -> FETCHING_SESSION on AUTHENTICATION_SUCCESS', () => {
            const state = createMockState({ currentState: 'AUTHENTICATING' });
            const action: TransactionAction = { type: 'AUTHENTICATION_SUCCESS' };

            expectStateTransition(state, action, 'FETCHING_SESSION', transactionReducer);

            const result = transactionReducer(state, action);
            expect(result.isAutoAuthenticating).toBe(false);
        });

        test('FETCHING_SESSION -> CHECKING_ALLOWANCE on SESSION_FETCH_SUCCESS', () => {
            const state = createMockState({ currentState: 'FETCHING_SESSION' });
            const mockSession = createMockTransactionSession();
            const mockPreparedTx = createMockPreparedTransaction();

            const action: TransactionAction = {
                type: 'SESSION_FETCH_SUCCESS',
                payload: { session: mockSession, preparedTx: mockPreparedTx }
            };

            const result = transactionReducer(state, action);
            expect(result.currentState).toBe('CHECKING_ALLOWANCE');
            expect(result.sessionData).toEqual(mockSession);
            expect(result.preparedTx).toEqual(mockPreparedTx);
        });

        test('CHECKING_ALLOWANCE -> NEEDS_APPROVAL when approval needed', () => {
            const state = createMockState({ currentState: 'CHECKING_ALLOWANCE' });
            const action: TransactionAction = {
                type: 'ALLOWANCE_CHECK_SUCCESS',
                payload: { needsApproval: true }
            };

            expectStateTransition(state, action, 'NEEDS_APPROVAL', transactionReducer);

            const result = transactionReducer(state, action);
            expect(result.needsApproval).toBe(true);
        });

        test('CHECKING_ALLOWANCE -> SIMULATING when no approval needed', () => {
            const state = createMockState({ currentState: 'CHECKING_ALLOWANCE' });
            const action: TransactionAction = {
                type: 'ALLOWANCE_CHECK_SUCCESS',
                payload: { needsApproval: false }
            };

            expectStateTransition(state, action, 'SIMULATING', transactionReducer);

            const result = transactionReducer(state, action);
            expect(result.needsApproval).toBe(false);
        });

        test('NEEDS_APPROVAL -> APPROVING on START_APPROVAL', () => {
            const state = createMockState({ currentState: 'NEEDS_APPROVAL' });
            const action: TransactionAction = { type: 'START_APPROVAL' };

            expectStateTransition(state, action, 'APPROVING', transactionReducer);
        });

        test('APPROVING -> APPROVAL_CONFIRMING on APPROVAL_SUBMITTED', () => {
            const state = createMockState({ currentState: 'APPROVING' });
            const txHash = createMockTxHash();
            const action: TransactionAction = {
                type: 'APPROVAL_SUBMITTED',
                payload: { txHash }
            };

            const result = transactionReducer(state, action);
            expect(result.currentState).toBe('APPROVAL_CONFIRMING');
            expect(result.approvalTxHash).toBe(txHash);
        });

        test('APPROVAL_CONFIRMING -> SIMULATING on APPROVAL_CONFIRMED', () => {
            const state = createMockState({
                currentState: 'APPROVAL_CONFIRMING',
                needsApproval: true
            });

            const action: TransactionAction = { type: 'APPROVAL_CONFIRMED' };

            const result = transactionReducer(state, action);
            expect(result.currentState).toBe('SIMULATING');
            expect(result.needsApproval).toBe(false);
        });

        test('SIMULATING -> READY_TO_EXECUTE on SIMULATION_SUCCESS', () => {
            const state = createMockState({ currentState: 'SIMULATING' });
            const mockSimulationRequest = {
                request: {
                    address: '0x1234567890123456789012345678901234567890' as `0x${string}`,
                    functionName: 'test',
                    args: [],
                }
            } as any;

            const action: TransactionAction = {
                type: 'SIMULATION_SUCCESS',
                payload: { simulationRequest: mockSimulationRequest }
            };

            const result = transactionReducer(state, action);
            expect(result.currentState).toBe('READY_TO_EXECUTE');
            expect(result.simulationRequest).toEqual(mockSimulationRequest);
        });

        test('READY_TO_EXECUTE -> EXECUTING on EXECUTE_TRANSACTION', () => {
            const state = createMockState({ currentState: 'READY_TO_EXECUTE' });
            const action: TransactionAction = { type: 'EXECUTE_TRANSACTION' };

            expectStateTransition(state, action, 'EXECUTING', transactionReducer);
        });

        test('EXECUTING -> CONFIRMING on TRANSACTION_SUBMITTED', () => {
            const state = createMockState({ currentState: 'EXECUTING' });
            const txHash = createMockTxHash();
            const action: TransactionAction = {
                type: 'TRANSACTION_SUBMITTED',
                payload: { txHash }
            };

            const result = transactionReducer(state, action);
            expect(result.currentState).toBe('CONFIRMING');
            expect(result.txHash).toBe(txHash);
        });

        test('CONFIRMING -> SUCCESS on TRANSACTION_CONFIRMED', () => {
            const state = createMockState({ currentState: 'CONFIRMING' });
            const action: TransactionAction = { type: 'TRANSACTION_CONFIRMED' };

            expectStateTransition(state, action, 'SUCCESS', transactionReducer);
        });
    });

    describe('Error Handling', () => {
        test('Any state -> ERROR on ERROR action', () => {
            const mockError = createMockUserError({ code: 'E_UNKNOWN' });
            // All states except ERROR itself and SUCCESS should transition to ERROR
            // SUCCESS is terminal and cannot transition to ERROR
            const allStates = Object.keys(StateTransitions).filter(s => s !== 'ERROR' && s !== 'SUCCESS') as TransactionState[];

            allStates.forEach(currentState => {
                const state = createMockState({ currentState });
                const action: TransactionAction = { type: 'ERROR', payload: { error: mockError } };
                const result = transactionReducer(state, action);

                expect(result.currentState).toBe('ERROR');
                expect(result.userError).toEqual(mockError);
            });
        });

        test('SUCCESS state should not transition to ERROR (terminal state)', () => {
            const mockError = createMockUserError({ code: 'E_UNKNOWN' });
            const state = createMockState({ currentState: 'SUCCESS' });
            const action: TransactionAction = { type: 'ERROR', payload: { error: mockError } };
            const result = transactionReducer(state, action);

            // SUCCESS should remain SUCCESS even on ERROR action
            expect(result.currentState).toBe('SUCCESS');
            expect(result.userError).toBeNull(); // Should not set error
        });

        test('should not dispatch redundant ERROR', () => {
            const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });

            const state = createMockState({ currentState: 'ERROR', userError: createMockUserError({ code: 'E_FIRST' }) });
            const action: TransactionAction = { type: 'ERROR', payload: { error: createMockUserError({ code: 'E_SECOND' }) } };

            const result = transactionReducer(state, action);

            expect(result.currentState).toBe('ERROR');
            expect(result.userError?.code).toBe('E_FIRST');
            expect(consoleWarnSpy).toHaveBeenCalledWith(
                'Ignoring redundant error dispatch:',
                action.payload.error
            );

            consoleWarnSpy.mockRestore();
        });

        test('ERROR action logs error with context', () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
            const mockError = createMockUserError();
            const action: TransactionAction = {
                type: 'ERROR',
                payload: { error: mockError }
            };

            transactionReducer(initialState, action);

            // Check that error logging was called
            expect(consoleErrorSpy).toHaveBeenCalled();
            consoleErrorSpy.mockRestore();
        });
    });

    describe('RESET Functionality', () => {
        test('RESET action returns to initial state', () => {
            const modifiedState = createMockState({
                currentState: 'ERROR',
                sessionData: createMockTransactionSession(),
                userError: createMockUserError(),
                txHash: createMockTxHash()
            });

            const action: TransactionAction = { type: 'RESET' };
            const result = transactionReducer(modifiedState, action);

            expect(result).toEqual(initialState);
        });

        test('RESET can be called from any state', () => {
            const allStates = Object.keys(StateTransitions) as TransactionState[];

            const action: TransactionAction = { type: 'RESET' };

            allStates.forEach(stateName => {
                const state = createMockState({
                    currentState: stateName,
                    sessionData: createMockTransactionSession()
                });

                const result = transactionReducer(state, action);
                expect(result).toEqual(initialState);
            });
        });
    });

    describe('Gas Estimation', () => {
        test('SET_GAS_ESTIMATE does not change state but updates gas estimate', () => {
            const gasEstimate = createMockGasEstimate();
            const action: TransactionAction = {
                type: 'SET_GAS_ESTIMATE',
                payload: { gasEstimate }
            };

            const result = transactionReducer(initialState, action);

            expect(result.currentState).toBe('IDLE'); // State unchanged
            expect(result.gasEstimate).toEqual(gasEstimate);
        });

        test('SET_GAS_ESTIMATE works from any state', () => {
            const allStates = Object.keys(StateTransitions) as TransactionState[];
            const gasEstimate = createMockGasEstimate();
            const action: TransactionAction = {
                type: 'SET_GAS_ESTIMATE',
                payload: { gasEstimate }
            };

            allStates.forEach(stateName => {
                const state = createMockState({ currentState: stateName });
                const result = transactionReducer(state, action);

                expect(result.currentState).toBe(stateName);
                expect(result.gasEstimate).toEqual(gasEstimate);
            });
        });
    });

    describe('Invalid State Transitions', () => {
        test('should not transition on invalid state transition', () => {
            const initialState = createMockState({ currentState: 'IDLE' });
            const action: TransactionAction = { type: 'EXECUTE_TRANSACTION' }; // Invalid from IDLE

            const result = transactionReducer(initialState, action);

            // Should not transition due to invalid transition
            expect(result.currentState).toBe('IDLE');
        });

        test('should log invalid transitions', () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

            const initialState = createMockState({ currentState: 'IDLE' });
            const action: TransactionAction = { type: 'EXECUTE_TRANSACTION' };

            transactionReducer(initialState, action);

            expect(consoleErrorSpy).toHaveBeenCalledWith('❌ Invalid state transition: IDLE → EXECUTING');

            consoleErrorSpy.mockRestore();
        });

        test('should not change state for actions not valid in current state', () => {
            const fromState = createMockState({ currentState: 'IDLE' });
            const action: TransactionAction = { type: 'TRANSACTION_CONFIRMED' }; // Invalid action for IDLE state
            expectStateUnchanged(fromState, action, transactionReducer);
        });

        test('should not change state for approval actions when not in approval flow', () => {
            const fromState = createMockState({ currentState: 'IDLE', needsApproval: false });
            const action: TransactionAction = { type: 'APPROVAL_CONFIRMED' }; // Invalid action
            expectStateUnchanged(fromState, action, transactionReducer);
        });

        test('should not change state for transaction confirmation when not executing', () => {
            const fromState = createMockState({ currentState: 'SUCCESS' });
            const action: TransactionAction = { type: 'TRANSACTION_CONFIRMED' }; // Invalid action
            expectStateUnchanged(fromState, action, transactionReducer);
        });
    });

    describe('Unknown Actions', () => {
        test('should handle unknown actions gracefully', () => {
            const unknownAction = { type: 'UNKNOWN_ACTION' } as any;
            const result = transactionReducer(initialState, unknownAction);

            expect(result).toEqual(initialState);
        });

        test('should log warning for unknown actions', () => {
            const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });

            const unknownAction = { type: 'UNKNOWN_ACTION' } as any;
            transactionReducer(initialState, unknownAction);

            expect(consoleWarnSpy).toHaveBeenCalledWith(
                '⚠️ Unknown action type:',
                unknownAction
            );

            consoleWarnSpy.mockRestore();
        });
    });
});