import React from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, lightTheme } from '@rainbow-me/rainbowkit';

import { AuthProvider } from '../auth/AuthProvider';
import { wagmiConfig } from './wagmiConfig';

import '@rainbow-me/rainbowkit/styles.css';

interface WalletProviderProps {
    children: React.ReactNode;
}

/**
 * QueryClient configuration.
 * 
 * Created outside component to prevent recreation on re-renders.
 * Optimized retry settings for faster feedback on connection issues.
 */
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 2,
            retryDelay: (attemptIndex) => Math.min(500 * 2 ** attemptIndex, 10000),
            staleTime: 1000 * 60 * 5, // 5 minutes
        },
        mutations: {
            retry: 1,
        },
    },
});

/**
 * Root provider for wallet functionality.
 * 
 * Provides:
 * - Wagmi context for wallet interactions
 * - React Query for caching and state management
 * - RainbowKit for wallet connection UI
 * - Auth context for session management
 * 
 * Note: ConnectorCompatibilityGuard has been removed. Wallet compatibility
 * is now handled natively by wagmi's built-in mechanisms and our
 * useWalletReady hook's timeout handling.
 */
export default function WalletProvider({ children }: WalletProviderProps) {
    return (
        <WagmiProvider config={wagmiConfig}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider
                    modalSize="compact"
                    theme={lightTheme({
                        borderRadius: 'medium',
                        fontStack: 'rounded',
                        overlayBlur: 'small',
                    })}
                >
                    <AuthProvider>
                        {children}
                    </AuthProvider>
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}
