import { useCallback, useState, useRef } from 'react';
import { useSignMessage } from 'wagmi';
import { useWalletReady } from './useWalletReady';

export interface AuthPayload {
    address: `0x${string}`;
    signature: `0x${string}`;
    timestamp: number;
    message: string;
}

export type WalletStatus = 'disconnected' | 'reconnecting' | 'connecting' | 'ready';

/**
 * Authentication hook for wallet-based sign-in.
 * 
 * This hook provides:
 * - Wallet authentication via message signing
 * - Backend communication for session establishment
 * - Rate limiting to prevent auth spam
 * 
 * No polling - uses reactive state from useWalletReady.
 */
export function useWalletAuth() {
    const { isReady, isConnected, isReconnecting, isLoading, address, walletClient } = useWalletReady();
    const { signMessageAsync } = useSignMessage();
    
    const [isSigning, setIsSigning] = useState(false);
    const signingRef = useRef(false);
    
    // Rate limiting for backend auth calls
    const authFailureCount = useRef(0);
    const lastAuthAttempt = useRef(0);
    
    // Compute wallet status
    const status: WalletStatus = (() => {
        if (isReconnecting) return 'reconnecting';
        if (isLoading) return 'connecting';
        if (isReady) return 'ready';
        return 'disconnected';
    })();
    
    /**
     * Build the message to sign.
     * Format must match backend verification.
     */
    const buildSignMessage = useCallback((timestamp: number): string => {
        return `Clones desktop\nnonce: ${timestamp}`;
    }, []);
    
    /**
     * Request wallet signature for authentication.
     * 
     * Pre-conditions:
     * - Wallet must be ready (isReady === true)
     * - No signing operation in progress
     * 
     * @throws Error if wallet not ready or signing in progress
     * @returns AuthPayload with address, signature, timestamp, and message
     */
    const authenticateWallet = useCallback(async (): Promise<AuthPayload> => {
        if (process.env.NODE_ENV === 'development') {
            console.log('🔐 authenticateWallet called', { isReady, hasAddress: !!address });
        }
        
        // Pre-flight checks
        if (!isReady) {
            throw new Error(
                'Wallet not ready for authentication. Please wait for connection to stabilize.'
            );
        }
        
        if (!address) {
            throw new Error('No wallet address available');
        }
        
        if (signingRef.current) {
            throw new Error('Authentication already in progress');
        }
        
        signingRef.current = true;
        setIsSigning(true);
        
        try {
            const timestamp = Date.now();
            const message = buildSignMessage(timestamp);
            
            if (process.env.NODE_ENV === 'development') {
                console.log('📝 Requesting signature from wallet...');
            }
            const signature = await signMessageAsync({ message });
            if (process.env.NODE_ENV === 'development') {
                console.log('✅ Signature received');
            }
            
            return {
                address,
                signature,
                timestamp,
                message,
            };
        } finally {
            signingRef.current = false;
            setIsSigning(false);
        }
    }, [isReady, address, signMessageAsync, buildSignMessage]);
    
    /**
     * Send authentication payload to backend.
     * 
     * Features:
     * - Rate limiting with exponential backoff
     * - Circuit breaker after 3 failures
     * 
     * @param payload Authentication payload from authenticateWallet
     * @param token Optional connection token
     */
    const sendAuthToBackend = useCallback(
        async (payload: AuthPayload, token?: string | null) => {
            console.log('🚀 sendAuthToBackend called', {
                address: payload.address,
                hasToken: !!token,
                timestamp: payload.timestamp,
                failureCount: authFailureCount.current,
            });
            
            // Circuit breaker: prevent auth spam
            const now = Date.now();
            const timeSinceLastAttempt = now - lastAuthAttempt.current;
            
            if (authFailureCount.current >= 3) {
                const waitTime = Math.min(
                    5000 * Math.pow(2, authFailureCount.current - 3),
                    30000
                );
                
                if (timeSinceLastAttempt < waitTime) {
                    const waitSeconds = Math.ceil((waitTime - timeSinceLastAttempt) / 1000);
                    console.warn(`🚫 Auth circuit breaker: waiting ${waitSeconds}s before retry`);
                    throw new Error(
                        `Too many authentication attempts. Please wait ${waitSeconds} seconds.`
                    );
                }
            }
            
            lastAuthAttempt.current = now;
            
            try {
                const { createAuthService } = await import('../../auth');
                
                const authData = {
                    ...payload,
                    ...(token ? { token } : {}),
                };
                
                console.log('📡 Calling AuthService.authenticateWithWallet...');
                
                const authService = createAuthService();
                const result = await authService.authenticateWithWallet(authData);
                
                // Reset failure count on success
                authFailureCount.current = 0;
                console.log('✅ Authentication successful');
                
                return result;
            } catch (error) {
                authFailureCount.current++;
                console.error('❌ Authentication failed', {
                    error,
                    failureCount: authFailureCount.current,
                });
                throw error;
            }
        },
        []
    );
    
    /**
     * Reset rate limiting state.
     * Call this when user explicitly wants to retry.
     */
    const resetRateLimiting = useCallback(() => {
        authFailureCount.current = 0;
        lastAuthAttempt.current = 0;
    }, []);
    
    return {
        // Actions
        authenticateWallet,
        sendAuthToBackend,
        resetRateLimiting,
        
        // State
        connected: isConnected && !!address && !!walletClient,
        ready: isReady,
        loading: isLoading,
        status,
        address,
        isSigning,
        
        // Legacy compatibility
        isWalletClientLoading: isLoading,
        isWalletReady: useCallback(() => isReady, [isReady]),
    };
}
