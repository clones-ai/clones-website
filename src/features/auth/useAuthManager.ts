/**
 * React hook for authentication state
 */
import { useEffect, useState } from 'react';
import { AuthManager, AuthState } from './AuthManager';

export function useAuthManager(): AuthState & {
    initialize: () => Promise<void>;
    authenticateWithWallet: (authData: any) => Promise<void>;
    secureCall: (endpoint: string, options?: RequestInit) => Promise<Response>;
    clearSession: () => Promise<void>;
    isReady: () => boolean;
} {
    const [state, setState] = useState<AuthState>(() =>
        AuthManager.getInstance().getState()
    );

    useEffect(() => {
        const authManager = AuthManager.getInstance();
        const unsubscribe = authManager.subscribe(setState);

        return () => {
            unsubscribe();
        };
    }, []);

    const authManager = AuthManager.getInstance();

    return {
        ...state,
        initialize: () => authManager.initialize(),
        authenticateWithWallet: (authData: any) => authManager.authenticateWithWallet(authData),
        secureCall: (endpoint: string, options?: RequestInit) => authManager.secureCall(endpoint, options),
        clearSession: () => authManager.clearSession(),
        isReady: () => authManager.isReady()
    };
}
