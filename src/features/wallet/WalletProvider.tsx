import React from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
    RainbowKitProvider,
    lightTheme,
    connectorsForWallets,
} from '@rainbow-me/rainbowkit';
import {
    injectedWallet,
    walletConnectWallet,
    coinbaseWallet,
    metaMaskWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { base, baseSepolia } from 'wagmi/chains';
import { AuthProvider } from '../auth/AuthProvider';

// Import RainbowKit styles once
import '@rainbow-me/rainbowkit/styles.css';

interface WalletProviderProps {
    children: React.ReactNode;
}

/**
 * Build wagmi config for Base + Base Sepolia with explicit connectors.
 * This approach avoids getDefaultConfig compatibility issues.
 */
const connectors = connectorsForWallets(
    [
        {
            groupName: 'Recommended',
            wallets: [
                metaMaskWallet,
                injectedWallet,
                coinbaseWallet,
                walletConnectWallet,
            ],
        },
    ],
    {
        appName: 'Clones Desktop',
        projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'demo-project-id',
    }
);

const config = createConfig({
    connectors,
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
