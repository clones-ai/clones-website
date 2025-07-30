import React, { useMemo } from 'react';
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
    PhantomWalletAdapter,
    SolflareWalletAdapter,
    TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

// Import the styles for the wallet modal
import '@solana/wallet-adapter-react-ui/styles.css';

interface WalletProviderProps {
    children: React.ReactNode;
}

export default function WalletProvider({ children }: WalletProviderProps) {
    // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'
    const endpoint = useMemo(() => clusterApiUrl('mainnet-beta'), []);

    // We can also provide a custom RPC endpoint, but we're using the default for now
    // const endpoint = useMemo(() => 'https://api.mainnet-beta.solana.com', []);

    // @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking and lazy loading
    // Only the wallets you configure here will be compiled into the application
    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new SolflareWalletAdapter(),
            new TorusWalletAdapter(),
        ],
        []
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <SolanaWalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    {children}
                </WalletModalProvider>
            </SolanaWalletProvider>
        </ConnectionProvider>
    );
} 