import React from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
    RainbowKitProvider,
    lightTheme,
    getDefaultConfig,
} from '@rainbow-me/rainbowkit';
import { base, baseSepolia } from 'wagmi/chains';
import { AuthProvider } from '../auth/AuthProvider';

// Import RainbowKit styles once
import '@rainbow-me/rainbowkit/styles.css';

interface WalletProviderProps {
    children: React.ReactNode;
}

/**
 * Use getDefaultConfig for better compatibility with RainbowKit v2 + Wagmi v2
 * This should resolve connector.getChainId issues
 */
export const config = getDefaultConfig({
    appName: 'Clones Desktop',
    projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'demo-project-id',
    chains: [base, baseSepolia],
    transports: {
        [base.id]: http(),
        [baseSepolia.id]: http(),
    },
    ssr: false,
});

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 3,
            retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
        },
        mutations: {
            retry: 1,
        },
    },
});

export default function WalletProvider({ children }: WalletProviderProps) {
    return (
        <WagmiProvider config={config}>
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
