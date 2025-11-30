import { http, createConfig } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import {
    injectedWallet,
    rabbyWallet,
    metaMaskWallet,
    coinbaseWallet,
    walletConnectWallet,
    rainbowWallet,
    phantomWallet,
    trustWallet,
} from '@rainbow-me/rainbowkit/wallets';

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'demo-project-id';
const appName = 'Clones Desktop';

/**
 * Custom wallet connectors with explicit support for injected wallets.
 * 
 * Order matters: wallets are displayed in this order in the modal.
 * injectedWallet is a fallback for any injected provider not explicitly listed.
 */
const connectors = connectorsForWallets(
    [
        {
            groupName: 'Recommended',
            wallets: [
                rabbyWallet,
                metaMaskWallet,
                coinbaseWallet,
                rainbowWallet,
            ],
        },
        {
            groupName: 'Other Wallets',
            wallets: [
                walletConnectWallet,
                phantomWallet,
                trustWallet,
                injectedWallet, // Fallback for any other injected wallet
            ],
        },
    ],
    {
        appName,
        projectId,
    }
);

/**
 * Wagmi configuration with custom connectors.
 * 
 * Key decisions:
 * - Custom connectors for better injected wallet support (Rabby, etc.)
 * - SSR disabled for SPA
 * - Multiple chains supported (Base mainnet and testnet)
 */
export const wagmiConfig = createConfig({
    connectors,
    chains: [base, baseSepolia],
    transports: {
        [base.id]: http(),
        [baseSepolia.id]: http(),
    },
    ssr: false,
});
