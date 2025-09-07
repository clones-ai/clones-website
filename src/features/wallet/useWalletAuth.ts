import { useCallback, useMemo, useRef, useState } from 'react';
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
    ref?: string | null;
};

export function useWalletAuth() {
    const { address, isConnected, status, isReconnecting } = useAccount();
    const { data: walletClient, isLoading: isWalletClientLoadingRaw } = useWalletClient();
    const { signMessageAsync } = useSignMessage();

    const [isSigning, setIsSigning] = useState(false);
    const signingRef = useRef(false);

    // Compute unified wallet state
    const walletState = useMemo(() => {
        // If still reconnecting from persisted state, don't show as disconnected
        if (isReconnecting) {
            return {
                connected: false,
                ready: false,
                loading: true,
                status: 'reconnecting' as const
            };
        }

        if (!isConnected || status !== 'connected') {
            return {
                connected: false,
                ready: false,
                loading: false,
                status: 'disconnected' as const
            };
        }

        const clientLoading = isWalletClientLoadingRaw || !walletClient;
        
        if (clientLoading) {
            return {
                connected: true,
                ready: false,
                loading: true,
                status: 'connecting' as const
            };
        }

        return {
            connected: true,
            ready: true,
            loading: false,
            status: 'ready' as const
        };
    }, [isConnected, status, isReconnecting, isWalletClientLoadingRaw, walletClient]);

    const isWalletReady = useCallback(() => {
        return walletState.ready;
    }, [walletState.ready]);

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
                    ref,
                };
            } finally {
                signingRef.current = false;
                setIsSigning(false);
            }
        },
        [address, isConnected, signMessageAsync, walletClient, buildSignMessage]
    );

    /**
     * Send the signed payload to your backend with HTTPS enforcement.
     * Defaults to `${VITE_API_URL}/api/v1/wallet/connect` unless VITE_AUTH_ENDPOINT overrides it.
     */
    const sendAuthToBackend = useCallback(
        async (payload: AuthPayload, token?: string | null) => {
            const { securePost } = await import('../../utils/api');
            
            const AUTH_PATH = import.meta.env.VITE_AUTH_ENDPOINT || '/api/v1/wallet/connect';

            // Merge token into the payload body (required by backend schema)
            const body = {
                ...payload,
                ...(token ? { token } : {}),
            };

            return securePost(AUTH_PATH, body);
        },
        []
    );


    return {
        // actions
        authenticateWallet,
        sendAuthToBackend,

        // unified state
        connected: walletState.connected,
        ready: walletState.ready,
        loading: walletState.loading,
        status: walletState.status,
        address,
        isSigning,

        // legacy compatibility
        isWalletClientLoading: walletState.loading,
        isWalletReady,
    };
}
