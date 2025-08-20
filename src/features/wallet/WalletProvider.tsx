import React from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
    RainbowKitProvider,
    getDefaultConfig,
    lightTheme,
} from '@rainbow-me/rainbowkit';
import { base, baseSepolia } from 'wagmi/chains';

// Import RainbowKit styles once
import '@rainbow-me/rainbowkit/styles.css';

interface WalletProviderProps {
    children: React.ReactNode;
}

/**
 * Build wagmi config for Base + Base Sepolia.
 * We keep SSR disabled and enable autoConnect.
 */
const config = getDefaultConfig({
    appName: 'Clones Desktop',
    projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'demo-project-id',
    chains: [base, baseSepolia],
    ssr: false,
    // RainbowKit enables autoConnect via connectors under the hood.
    // With getDefaultConfig v2, autoConnect is true by default.
});

const queryClient = new QueryClient();

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
                    {children}
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}
