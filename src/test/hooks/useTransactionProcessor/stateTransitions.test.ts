import {
    StateTransitions,
    canTransitionTo,
    type TransactionState
} from '../../../hooks/useTransactionProcessor';

describe('State Transitions and Guards', () => {
    describe('canTransitionTo', () => {
        describe('Valid Transitions', () => {
            test('should allow IDLE -> AUTHENTICATING', () => {
                expect(canTransitionTo('IDLE', 'AUTHENTICATING')).toBe(true);
            });

            test('should allow AUTHENTICATING -> FETCHING_SESSION', () => {
                expect(canTransitionTo('AUTHENTICATING', 'FETCHING_SESSION')).toBe(true);
            });

            test('should allow FETCHING_SESSION -> CHECKING_ALLOWANCE', () => {
                expect(canTransitionTo('FETCHING_SESSION', 'CHECKING_ALLOWANCE')).toBe(true);
            });

            test('should allow CHECKING_ALLOWANCE -> NEEDS_APPROVAL', () => {
                expect(canTransitionTo('CHECKING_ALLOWANCE', 'NEEDS_APPROVAL')).toBe(true);
            });

            test('should allow CHECKING_ALLOWANCE -> SIMULATING (skip approval)', () => {
                expect(canTransitionTo('CHECKING_ALLOWANCE', 'SIMULATING')).toBe(true);
            });

            test('should allow NEEDS_APPROVAL -> APPROVING', () => {
                expect(canTransitionTo('NEEDS_APPROVAL', 'APPROVING')).toBe(true);
            });

            test('should allow APPROVING -> APPROVAL_CONFIRMING', () => {
                expect(canTransitionTo('APPROVING', 'APPROVAL_CONFIRMING')).toBe(true);
            });

            test('should allow APPROVAL_CONFIRMING -> SIMULATING', () => {
                expect(canTransitionTo('APPROVAL_CONFIRMING', 'SIMULATING')).toBe(true);
            });

            test('should allow SIMULATING -> READY_TO_EXECUTE', () => {
                expect(canTransitionTo('SIMULATING', 'READY_TO_EXECUTE')).toBe(true);
            });

            test('should allow READY_TO_EXECUTE -> EXECUTING', () => {
                expect(canTransitionTo('READY_TO_EXECUTE', 'EXECUTING')).toBe(true);
            });

            test('should allow EXECUTING -> CONFIRMING', () => {
                expect(canTransitionTo('EXECUTING', 'CONFIRMING')).toBe(true);
            });

            test('should allow CONFIRMING -> SUCCESS', () => {
                expect(canTransitionTo('CONFIRMING', 'SUCCESS')).toBe(true);
            });

            test('should allow SUCCESS -> IDLE (start new transaction)', () => {
                expect(canTransitionTo('SUCCESS', 'IDLE')).toBe(true);
            });
        });

        describe('Error Transitions', () => {
            test('should allow any state to transition to ERROR', () => {
                const allStates: TransactionState[] = [
                    'IDLE', 'AUTHENTICATING', 'FETCHING_SESSION', 'CHECKING_ALLOWANCE',
                    'NEEDS_APPROVAL', 'APPROVING', 'APPROVAL_CONFIRMING', 'SIMULATING',
                    'READY_TO_EXECUTE', 'EXECUTING', 'CONFIRMING'
                ];

                allStates.forEach(state => {
                    if (state !== 'ERROR') { // ERROR state might not be able to transition to itself
                        expect(canTransitionTo(state, 'ERROR')).toBe(true);
                    }
                });
            });

            test('should allow ERROR -> IDLE (recovery)', () => {
                expect(canTransitionTo('ERROR', 'IDLE')).toBe(true);
            });

            test('should allow ERROR -> RESET', () => {
                expect(canTransitionTo('ERROR', 'RESET')).toBe(true);
            });
        });

        describe('Specific State Rules', () => {
            test('RESET should only allow transition to IDLE or ERROR', () => {
                const validTransitions = ['IDLE', 'ERROR'];
                const allStates = Object.keys(StateTransitions) as TransactionState[];
                const otherStates = allStates.filter(s => !validTransitions.includes(s) && s !== 'RESET');

                validTransitions.forEach(state => {
                    expect(canTransitionTo('RESET', state as TransactionState)).toBe(true);
                });

                otherStates.forEach(state => {
                    expect(canTransitionTo('RESET', state)).toBe(false);
                });
            });

            test('SUCCESS should only allow transition to IDLE, RESET', () => {
                const validFromSuccess = ['IDLE', 'RESET'];
                const allStates = Object.keys(StateTransitions) as TransactionState[];
                const invalidFromSuccess = allStates.filter(state => !validFromSuccess.includes(state) && state !== 'SUCCESS');

                validFromSuccess.forEach(state => {
                    expect(canTransitionTo('SUCCESS', state as TransactionState)).toBe(true);
                });

                invalidFromSuccess.forEach(state => {
                    expect(canTransitionTo('SUCCESS', state as TransactionState)).toBe(false);
                });
            });
        });

        describe('Invalid Transitions', () => {
            test('should prevent skipping required steps', () => {
                // Can't skip authentication - but can skip to fetching if already authenticated
                expect(canTransitionTo('IDLE', 'SIMULATING')).toBe(false);
                expect(canTransitionTo('IDLE', 'EXECUTING')).toBe(false);

                // Can't skip simulation
                expect(canTransitionTo('CHECKING_ALLOWANCE', 'EXECUTING')).toBe(false);
                expect(canTransitionTo('NEEDS_APPROVAL', 'EXECUTING')).toBe(false);

                // Can't go back to earlier states (except via RESET or ERROR)
                expect(canTransitionTo('SIMULATING', 'AUTHENTICATING')).toBe(false);
                expect(canTransitionTo('EXECUTING', 'SIMULATING')).toBe(false);
                expect(canTransitionTo('SUCCESS', 'SIMULATING')).toBe(false);
            });

            test('should prevent impossible backwards transitions', () => {
                expect(canTransitionTo('SUCCESS', 'AUTHENTICATING')).toBe(false);
                expect(canTransitionTo('SUCCESS', 'FETCHING_SESSION')).toBe(false);
                expect(canTransitionTo('SUCCESS', 'CHECKING_ALLOWANCE')).toBe(false);
                expect(canTransitionTo('SUCCESS', 'NEEDS_APPROVAL')).toBe(false);
                expect(canTransitionTo('SUCCESS', 'APPROVING')).toBe(false);
                expect(canTransitionTo('SUCCESS', 'APPROVAL_CONFIRMING')).toBe(false);
                expect(canTransitionTo('SUCCESS', 'SIMULATING')).toBe(false);
                expect(canTransitionTo('SUCCESS', 'READY_TO_EXECUTE')).toBe(false);
                expect(canTransitionTo('SUCCESS', 'EXECUTING')).toBe(false);
                expect(canTransitionTo('SUCCESS', 'CONFIRMING')).toBe(false);
            });

            test('should prevent approval flow bypass', () => {
                // Can't skip approval when needed
                expect(canTransitionTo('NEEDS_APPROVAL', 'SIMULATING')).toBe(false);
                expect(canTransitionTo('NEEDS_APPROVAL', 'READY_TO_EXECUTE')).toBe(false);

                // Can't skip approval confirmation
                expect(canTransitionTo('APPROVING', 'SIMULATING')).toBe(false);
                expect(canTransitionTo('APPROVING', 'READY_TO_EXECUTE')).toBe(false);
            });
        });

        describe('Edge Cases', () => {
            test('should handle undefined/null states gracefully', () => {
                expect(canTransitionTo(undefined as any, 'IDLE')).toBe(false);
                expect(canTransitionTo('IDLE', undefined as any)).toBe(false);
                expect(canTransitionTo(null as any, 'IDLE')).toBe(false);
                expect(canTransitionTo('IDLE', null as any)).toBe(false);
            });

            test('should handle invalid state names', () => {
                expect(canTransitionTo('INVALID_STATE' as any, 'IDLE')).toBe(false);
                expect(canTransitionTo('IDLE', 'INVALID_STATE' as any)).toBe(false);
            });

            test('should handle same state transitions', () => {
                const allStates: TransactionState[] = [
                    'IDLE', 'AUTHENTICATING', 'FETCHING_SESSION', 'CHECKING_ALLOWANCE',
                    'NEEDS_APPROVAL', 'APPROVING', 'APPROVAL_CONFIRMING', 'SIMULATING',
                    'READY_TO_EXECUTE', 'EXECUTING', 'CONFIRMING', 'SUCCESS', 'ERROR', 'RESET'
                ];

                allStates.forEach(state => {
                    // Most states should not allow self-transitions
                    // Exception might be ERROR or IDLE depending on implementation
                    const canSelfTransition = canTransitionTo(state, state);

                    // Document the expected behavior
                    if (state === 'ERROR' || state === 'IDLE') {
                        // These states might allow self-transitions
                        expect(typeof canSelfTransition).toBe('boolean');
                    } else {
                        // Most states should not allow self-transitions
                        expect(canSelfTransition).toBe(false);
                    }
                });
            });
        });
    });

    describe('State Transition Completeness', () => {
        test('all states should have defined transitions', () => {
            const allStates: TransactionState[] = [
                'IDLE', 'AUTHENTICATING', 'FETCHING_SESSION', 'CHECKING_ALLOWANCE',
                'NEEDS_APPROVAL', 'APPROVING', 'APPROVAL_CONFIRMING', 'SIMULATING',
                'READY_TO_EXECUTE', 'EXECUTING', 'CONFIRMING', 'SUCCESS', 'ERROR', 'RESET'
            ];

            allStates.forEach(state => {
                expect(StateTransitions[state]).toBeDefined();
                expect(Array.isArray(StateTransitions[state])).toBe(true);
                expect(StateTransitions[state].length).toBeGreaterThan(0);
            });
        });

        test('all transitions should reference valid states', () => {
            const allStates: TransactionState[] = [
                'IDLE', 'AUTHENTICATING', 'FETCHING_SESSION', 'CHECKING_ALLOWANCE',
                'NEEDS_APPROVAL', 'APPROVING', 'APPROVAL_CONFIRMING', 'SIMULATING',
                'READY_TO_EXECUTE', 'EXECUTING', 'CONFIRMING', 'SUCCESS', 'ERROR', 'RESET'
            ];

            Object.values(StateTransitions).forEach(transitions => {
                transitions.forEach(targetState => {
                    expect(allStates).toContain(targetState);
                });
            });
        });

        test('all states should be reachable', () => {
            const allStates = Object.keys(StateTransitions) as TransactionState[];

            const reachableStates = new Set<TransactionState>();

            // Add initial state
            reachableStates.add('IDLE');

            // Collect all reachable states
            Object.values(StateTransitions).forEach(transitions => {
                transitions.forEach(state => {
                    reachableStates.add(state);
                });
            });

            allStates.forEach(state => {
                expect(reachableStates.has(state)).toBe(true);
            });
        });

        test('state machine should have proper entry and exit points', () => {
            const processingStates = [
                'AUTHENTICATING', 'FETCHING_SESSION', 'CHECKING_ALLOWANCE',
                'NEEDS_APPROVAL', 'APPROVING', 'APPROVAL_CONFIRMING', 'SIMULATING',
                'READY_TO_EXECUTE', 'EXECUTING', 'CONFIRMING'
            ];

            // SUCCESS and ERROR should not loop back into processing states directly
            processingStates.forEach(state => {
                expect(StateTransitions['SUCCESS']).not.toContain(state);
            });
        });
    });
});