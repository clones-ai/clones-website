import type { Abi, Hex } from 'viem';
import { decodeErrorResult, formatEther } from 'viem';
import type { BaseError } from 'wagmi';

export type ErrorCategory = 'user' | 'contract' | 'network' | 'gas' | 'unknown';
export type ErrorCode = string;

export interface UserFacingError {
    title: string;
    message: string;
    category: ErrorCategory;
    code: ErrorCode;
    context?: Record<string, any>;
}

export function tryDecodeWithAbis(data: Hex | undefined, abis: Abi[]): null | {
    name: string;
    args: readonly unknown[] | undefined;
} {
    if (!data) return null;
    for (const abi of abis) {
        try {
            const decoded = decodeErrorResult({ data, abi });
            return { name: decoded.errorName, args: decoded.args };
        } catch {
            // keep trying
        }
    }
    return null;
}

export function toUserError(
    err: BaseError | Error,
    opts: {
        abis: Abi[]; // 1st = the contract you're currently calling. Others are fallbacks.
    }
): UserFacingError {
    // Extract viem error data
    const base = err as BaseError & { cause?: { data?: Hex; code?: number; details?: string } };
    const data = base?.cause?.data as Hex | undefined;

    // Enhanced debugging for development
    if (process.env.NODE_ENV === 'development') {
        console.log('toUserError - Full error:', err);
        console.log('toUserError - Base error:', base);
        console.log('toUserError - Error data:', data);
        console.log('toUserError - Message:', base.message);
        console.log('toUserError - Short message:', base.shortMessage);
        console.log('toUserError - Cause:', base.cause);
    }

    // 1) Custom error decoding via ABI(s)
    const decoded = tryDecodeWithAbis(data, opts.abis);

    if (decoded) {
        const { name, args } = decoded;

        // --- Contract-specific mappings (precise & actionable) ---
        switch (name) {
            case 'Unauthorized': { // Unauthorized(string role)
                const role = args?.[0] as string | undefined;
                return {
                    title: 'Unauthorized',
                    message: role ? `This action requires role "${role}".` : 'Access denied by contract.',
                    code: 'E_UNAUTHORIZED',
                    category: 'contract',
                    context: { name, args },
                };
            }
            case 'InvalidParameter': { // InvalidParameter(string param)
                const param = args?.[0] as string | undefined;
                return {
                    title: 'Invalid parameter',
                    message: param ? `Invalid "${param}". Please verify your input.` : 'One or more parameters are invalid.',
                    code: 'E_INVALID_PARAMETER',
                    category: 'contract',
                    context: { name, args },
                };
            }
            case 'ReentrancyGuardReentrantCall':
                return {
                    title: 'Operation blocked',
                    message: 'This operation was blocked by reentrancy guard. Please retry shortly.',
                    code: 'E_REENTRANCY',
                    category: 'contract',
                    context: { name, args },
                };
            case 'EnforcedPause':
            case 'ExpectedPause':
                return {
                    title: 'Contract is paused',
                    message: 'The contract is currently paused. Please try again later.',
                    code: 'E_PAUSED',
                    category: 'contract',
                    context: { name, args },
                };
            case 'AlreadyExists': { // AlreadyExists(string resource)
                const resource = args?.[0] as string | undefined;
                return {
                    title: 'Already exists',
                    message: resource ? `"${resource}" already exists.` : 'Resource already exists.',
                    code: 'E_ALREADY_EXISTS',
                    category: 'contract',
                    context: { name, args },
                };
            }
            case 'InsufficientBalance': { // InsufficientBalance(uint256 balance, uint256 needed)
                const bal = args?.[0];
                const need = args?.[1];
                return {
                    title: 'Insufficient balance (contract)',
                    message: `Pool balance ${formatEther((bal ?? 0n) as bigint)} is lower than required ${formatEther((need ?? 0n) as bigint)}.`,
                    code: 'E_POOL_BALANCE',
                    category: 'contract',
                    context: { name, args },
                };
            }
            case 'SecurityViolation': { // SecurityViolation(string check)
                const check = args?.[0] as string | undefined;
                let message = 'Security checks failed.';
                if (check?.includes('token_transfer')) message = 'Token rejected (fee-on-transfer or non-compliant).';
                if (check?.includes('permit')) message = 'Permit signature failed. Try regular approval.';
                if (check?.includes('signature')) message = 'Invalid publisher/user signature.';
                if (check?.includes('deadline')) message = 'Signature deadline exceeded.';
                return {
                    title: 'Security violation',
                    message,
                    code: 'E_SECURITY',
                    category: 'contract',
                    context: { name, args },
                };
            }
            case 'SafeERC20FailedOperation': { // (address token)
                return {
                    title: 'Token transfer failed',
                    message: 'ERC20 operation failed. The token may be fee-on-transfer or non-compliant.',
                    code: 'E_ERC20_SAFE',
                    category: 'contract',
                    context: { name, args },
                };
            }
            case 'ECDSAInvalidSignature':
            case 'ECDSAInvalidSignatureS':
            case 'ECDSAInvalidSignatureLength':
                return {
                    title: 'Invalid signature',
                    message: 'Signature verification failed.',
                    code: 'E_SIGNATURE',
                    category: 'contract',
                    context: { name, args },
                };
            default:
                // Unknown custom error, still useful to bubble up name & args
                return {
                    title: 'Contract error',
                    message: `${name} ${Array.isArray(args) ? JSON.stringify(args) : ''}`.trim(),
                    code: `E_${name.toUpperCase()}`,
                    category: 'contract',
                    context: { name, args },
                };
        }
    }

    // 2) Known wallet/RPC/gas errors (fallbacks)
    const msg = (base.shortMessage || base.message || `${err}`).toLowerCase();

    if (msg.includes('user rejected') || msg.includes('user denied')) {
        return { title: 'Rejected by user', message: 'Transaction was rejected in the wallet.', code: 'E_USER_REJECTED', category: 'user' };
    }
    if (msg.includes('insufficient funds')) {
        return { title: 'Insufficient funds', message: 'Not enough native token to cover gas.', code: 'E_INSUFFICIENT_FUNDS', category: 'gas' };
    }
    if (msg.includes('intrinsic gas too low') || msg.includes('gas required exceeds allowance')) {
        return { title: 'Gas too low', message: 'Increase gas limit and try again.', code: 'E_GAS_LIMIT', category: 'gas' };
    }
    if (msg.includes('nonce') && msg.includes('too low')) {
        return { title: 'Nonce too low', message: 'Another tx with same nonce is mined or pending.', code: 'E_NONCE_LOW', category: 'network' };
    }

    // 3) Common ERC20/DeFi errors for fund operations
    if (msg.includes('erc20: transfer amount exceeds balance') || msg.includes('insufficient balance')) {
        return { title: 'Insufficient token balance', message: 'You don\'t have enough tokens to complete this transaction.', code: 'E_INSUFFICIENT_BALANCE', category: 'user' };
    }
    if (msg.includes('erc20: transfer amount exceeds allowance') || msg.includes('insufficient allowance')) {
        return { title: 'Insufficient allowance', message: 'Please approve the contract to spend your tokens first.', code: 'E_INSUFFICIENT_ALLOWANCE', category: 'user' };
    }
    if (msg.includes('transfer failed') || (msg.includes('reverted') && msg.includes('fund'))) {
        return { title: 'Token transfer failed', message: 'Token transfer was rejected. Check your balance and approvals.', code: 'E_TRANSFER_FAILED', category: 'contract' };
    }

    return { title: 'Unknown error', message: base.shortMessage || base.message || 'Transaction failed.', code: 'E_UNKNOWN', category: 'unknown', context: { details: base?.cause?.details } };
}
