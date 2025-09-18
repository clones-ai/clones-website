import { TransactionBusinessLogic } from '../../../hooks/useTransactionProcessor';

describe('TransactionBusinessLogic', () => {
    describe('requiresApprovalCheck', () => {
        test('should return true for fundPool transactions', () => {
            expect(TransactionBusinessLogic.requiresApprovalCheck('fundPool')).toBe(true);
        });

        test('should return true for createAndFundPool transactions', () => {
            expect(TransactionBusinessLogic.requiresApprovalCheck('createAndFundPool')).toBe(true);
        });

        test('should return false for createFactory transactions', () => {
            expect(TransactionBusinessLogic.requiresApprovalCheck('createFactory')).toBe(false);
        });

        test('should return false for claimRewards transactions', () => {
            expect(TransactionBusinessLogic.requiresApprovalCheck('claimRewards')).toBe(false);
        });

        test('should return false for withdrawPool transactions', () => {
            expect(TransactionBusinessLogic.requiresApprovalCheck('withdrawPool')).toBe(false);
        });

        test('should return false for unknown transaction types', () => {
            expect(TransactionBusinessLogic.requiresApprovalCheck('unknownType')).toBe(false);
        });

        test('should handle empty string', () => {
            expect(TransactionBusinessLogic.requiresApprovalCheck('')).toBe(false);
        });
    });

    describe('calculateNeedsApproval', () => {
        test('should return true when current allowance is less than required amount', () => {
            const currentAllowance = BigInt('50000000'); // 50 USDC (6 decimals)
            const requiredAmount = BigInt('100000000'); // 100 USDC (6 decimals)

            expect(TransactionBusinessLogic.calculateNeedsApproval(currentAllowance, requiredAmount)).toBe(true);
        });

        test('should return false when current allowance equals required amount', () => {
            const currentAllowance = BigInt('100000000'); // 100 USDC
            const requiredAmount = BigInt('100000000'); // 100 USDC

            expect(TransactionBusinessLogic.calculateNeedsApproval(currentAllowance, requiredAmount)).toBe(false);
        });

        test('should return false when current allowance is greater than required amount', () => {
            const currentAllowance = BigInt('200000000'); // 200 USDC
            const requiredAmount = BigInt('100000000'); // 100 USDC

            expect(TransactionBusinessLogic.calculateNeedsApproval(currentAllowance, requiredAmount)).toBe(false);
        });

        test('should handle zero allowance', () => {
            const currentAllowance = BigInt('0');
            const requiredAmount = BigInt('100000000');

            expect(TransactionBusinessLogic.calculateNeedsApproval(currentAllowance, requiredAmount)).toBe(true);
        });

        test('should handle zero required amount', () => {
            const currentAllowance = BigInt('100000000');
            const requiredAmount = BigInt('0');

            expect(TransactionBusinessLogic.calculateNeedsApproval(currentAllowance, requiredAmount)).toBe(false);
        });

        test('should handle very large numbers', () => {
            const currentAllowance = BigInt('999999999999999999999999999999');
            const requiredAmount = BigInt('1000000000000000000000000000000');

            expect(TransactionBusinessLogic.calculateNeedsApproval(currentAllowance, requiredAmount)).toBe(true);
        });
    });

    describe('isTransactionTypeValid', () => {
        const validTypes = ['createFactory', 'fundPool', 'claimRewards', 'createAndFundPool', 'withdrawPool'];

        test.each(validTypes)('should return true for valid transaction type: %s', (type) => {
            expect(TransactionBusinessLogic.isTransactionTypeValid(type)).toBe(true);
        });

        test('should return false for invalid transaction types', () => {
            const invalidTypes = ['invalidType', 'deposit', 'withdraw', 'swap', ''];

            invalidTypes.forEach(type => {
                expect(TransactionBusinessLogic.isTransactionTypeValid(type)).toBe(false);
            });
        });

        test('should be case sensitive', () => {
            expect(TransactionBusinessLogic.isTransactionTypeValid('FundPool')).toBe(false);
            expect(TransactionBusinessLogic.isTransactionTypeValid('FUNDPOOL')).toBe(false);
            expect(TransactionBusinessLogic.isTransactionTypeValid('fundpool')).toBe(false);
        });

        test('should handle special characters', () => {
            expect(TransactionBusinessLogic.isTransactionTypeValid('fund-pool')).toBe(false);
            expect(TransactionBusinessLogic.isTransactionTypeValid('fund_pool')).toBe(false);
            expect(TransactionBusinessLogic.isTransactionTypeValid('fund pool')).toBe(false);
        });
    });

    describe('shouldAutoAuthenticate', () => {
        test('should return true when sessionId exists and user is not authenticated', () => {
            expect(TransactionBusinessLogic.shouldAutoAuthenticate('session-123', false)).toBe(true);
        });

        test('should return false when sessionId exists but user is authenticated', () => {
            expect(TransactionBusinessLogic.shouldAutoAuthenticate('session-123', true)).toBe(false);
        });

        test('should return false when sessionId is null', () => {
            expect(TransactionBusinessLogic.shouldAutoAuthenticate(null, false)).toBe(false);
            expect(TransactionBusinessLogic.shouldAutoAuthenticate(null, true)).toBe(false);
        });

        test('should return false when sessionId is empty string', () => {
            expect(TransactionBusinessLogic.shouldAutoAuthenticate('', false)).toBe(false);
            expect(TransactionBusinessLogic.shouldAutoAuthenticate('', true)).toBe(false);
        });

        test('should handle various truthy sessionId values', () => {
            const truthyValues = ['session-123', '0', 'false', '  spaces  ', 'uuid-1234-5678'];

            truthyValues.forEach(sessionId => {
                expect(TransactionBusinessLogic.shouldAutoAuthenticate(sessionId, false)).toBe(true);
                expect(TransactionBusinessLogic.shouldAutoAuthenticate(sessionId, true)).toBe(false);
            });
        });
    });

    describe('Edge Cases and Error Handling', () => {
        test('requiresApprovalCheck should handle null/undefined input', () => {
            expect(TransactionBusinessLogic.requiresApprovalCheck(null as any)).toBe(false);
            expect(TransactionBusinessLogic.requiresApprovalCheck(undefined as any)).toBe(false);
        });

        test('isTransactionTypeValid should handle null/undefined input', () => {
            expect(TransactionBusinessLogic.isTransactionTypeValid(null as any)).toBe(false);
            expect(TransactionBusinessLogic.isTransactionTypeValid(undefined as any)).toBe(false);
        });

        test('shouldAutoAuthenticate should handle edge cases', () => {
            expect(TransactionBusinessLogic.shouldAutoAuthenticate(undefined as any, false)).toBe(false);
            expect(TransactionBusinessLogic.shouldAutoAuthenticate('0', false)).toBe(true); // '0' is truthy
        });
    });
});