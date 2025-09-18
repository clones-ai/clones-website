import { useCallback, useRef, useState } from 'react';
import { useAccount, useWalletClient, useSignMessage } from 'wagmi';

/**
 * Wait until a getter returns a truthy value (or timeout).
 * This prevents signing too early when walletClient isn't ready yet.
 */
async function waitForTruthy<T>(
    getter: () => T | undefined | null,
    {
        intervalMs = 75,
        timeoutMs = 8000,
    }: { intervalMs?: number; timeoutMs?: number } = {}
): Promise<T> {
    const start = Date.now();
    return new Promise<T>((resolve, reject) => {
        const tick = () => {
            const val = getter();
            if (val) return resolve(val);
            if (Date.now() - start >= timeoutMs) {
                return reject(new Error('Wallet client did not initialize in time'));
            }
            setTimeout(tick, intervalMs);
        };
        tick();
    });
}

export type AuthPayload = {
    address: `0x${string}`;
    signature: `0x${string}`;
    timestamp: number;
    message: string;
    ref?: string;
};

export function useWalletAuth() {
    const { address, isConnected, status, isReconnecting } = useAccount();
    const { data: walletClient, isLoading: isWalletClientLoadingRaw } = useWalletClient();
    const { signMessageAsync } = useSignMessage();

    const [isSigning, setIsSigning] = useState(false);
    const signingRef = useRef(false);
    
    // Circuit breaker for auth backend calls
    const authFailureCount = useRef(0);
    const lastAuthAttempt = useRef(0);

    const connected = isConnected && !!address && !!walletClient && status === 'connected';
    const ready = connected && !isWalletClientLoadingRaw;
    const loading = isReconnecting || isWalletClientLoadingRaw || (isConnected && !walletClient);

    const walletStatus = (() => {
        if (isReconnecting) return 'reconnecting';
        if (loading) return 'connecting';
        if (ready) return 'ready';
        return 'disconnected';
    })();

    const isWalletReady = useCallback(() => {
        return ready;
    }, [ready]);

    /**
     * Build the exact message to sign. Keep formatting stable for backend verification.
     */
    const buildSignMessage = useCallback((timestamp: number, ref?: string | null) => {
        const header = 'Clones desktop';
        const base = `${header}\nnonce: ${timestamp}`;
        return ref ? `${base}\nref: ${ref}` : base;
    }, []);

    /**
     * Trigger the wallet signature once the wallet client is truly ready.
     */
    const authenticateWallet = useCallback(
        async (ref?: string | null): Promise<AuthPayload> => {
            if (!isConnected) {
                throw new Error('Wallet not connected');
            }
            if (signingRef.current) {
                throw new Error('Authentication already in progress');
            }

            signingRef.current = true;
            setIsSigning(true);

            try {
                // Wait explicitly for wallet client init to avoid race conditions
                await waitForTruthy(() => walletClient, { intervalMs: 80, timeoutMs: 8000 });

                const ts = Date.now();
                const message = buildSignMessage(ts, ref);

                const signature = await signMessageAsync({ message });

                if (!address) {
                    throw new Error('Missing address after signing');
                }

                return {
                    address,
                    signature,
                    timestamp: ts,
                    message,
                    ref: ref ?? undefined,
                };
            } finally {
                signingRef.current = false;
                setIsSigning(false);
            }
        },
        [address, isConnected, signMessageAsync, walletClient, buildSignMessage]
    );

    /**
     * Send the signed payload to your backend using AuthManager
     * Uses bootstrap call (NO CSRF) for initial authentication
     */
    const sendAuthToBackend = useCallback(
        async (payload: AuthPayload, token?: string | null) => {
            console.log('🚀 sendAuthToBackend called', { 
                address: payload.address,
                hasToken: !!token,
                timestamp: payload.timestamp,
                failureCount: authFailureCount.current 
            });

            // Circuit breaker: prevent auth spam
            const now = Date.now();
            const timeSinceLastAttempt = now - lastAuthAttempt.current;
            
            if (authFailureCount.current >= 3) {
                const waitTime = Math.min(5000 * Math.pow(2, authFailureCount.current - 3), 30000); // Max 30s
                if (timeSinceLastAttempt < waitTime) {
                    const waitSeconds = Math.ceil((waitTime - timeSinceLastAttempt) / 1000);
                    console.warn(`🚫 Auth circuit breaker: waiting ${waitSeconds}s before retry`);
                    throw new Error(`Too many authentication attempts. Please wait ${waitSeconds} seconds before trying again.`);
                }
            }
            
            lastAuthAttempt.current = now;

            try {
                const { createAuthService } = await import('../../auth');

                // Merge token into the payload body (required by backend schema)
                const authData = {
                    ...payload,
                    ...(token ? { token } : {}),
                };

                console.log('📡 Calling AuthService.authenticateWithWallet...', {
                    endpoint: '/api/v1/wallet/connect',
                    address: authData.address
                });

                // Use AuthService for authentication
                const authService = createAuthService();
                const result = await authService.authenticateWithWallet(authData);
                
                // Reset failure count on success
                authFailureCount.current = 0;
                console.log('✅ Authentication successful', result);
                
                return result;
            } catch (error) {
                authFailureCount.current++;
                console.error('❌ Authentication failed', { 
                    error,
                    failureCount: authFailureCount.current,
                    timeSinceLastAttempt 
                });
                throw error;
            }
        },
        []
    );


    return {
        // actions
        authenticateWallet,
        sendAuthToBackend,

        connected,
        ready,
        loading,
        status: walletStatus,
        address,
        isSigning,

        // legacy compatibility
        isWalletClientLoading: loading,
        isWalletReady,
    };
}
