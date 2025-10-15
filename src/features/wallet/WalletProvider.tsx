import React from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
    RainbowKitProvider,
    lightTheme,
} from '@rainbow-me/rainbowkit';
import { AuthProvider } from '../auth/AuthProvider';
import ConnectorCompatibilityGuard from './ConnectorCompatibilityGuard';
import { wagmiConfig } from './wagmiConfig';

// Import RainbowKit styles once
import '@rainbow-me/rainbowkit/styles.css';

interface WalletProviderProps {
    children: React.ReactNode;
}

/**
 * QueryClient created outside component to prevent recreation
 * Optimized retry settings to reduce connection delays
 */
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 2, // Reduced from 3
            retryDelay: attemptIndex => Math.min(500 * 2 ** attemptIndex, 10000), // Faster retries
            staleTime: 1000 * 60 * 5, // 5 minutes
        },
        mutations: {
            retry: 1,
        },
    },
});

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
                        <ConnectorCompatibilityGuard />
                        {children}
                    </AuthProvider>
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}
