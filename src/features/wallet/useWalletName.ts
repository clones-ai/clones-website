import { useWallet } from '@solana/wallet-adapter-react';

export const useWalletName = () => {
    const { wallet } = useWallet();

    if (!wallet) return 'Solana Wallet';
    return wallet.adapter.name || 'Solana Wallet';
}; 