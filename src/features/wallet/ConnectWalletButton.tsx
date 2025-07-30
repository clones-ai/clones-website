import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { WalletIcon } from 'lucide-react';

export default function ConnectWalletButton() {
    const { connected } = useWallet();

    return (
        <div className="flex items-center gap-2">
            {!connected && <WalletIcon className="w-5 h-5 text-[#94A3B8]" />}
            <WalletMultiButton className="!bg-[#8B5CF6] !text-white !border-none !rounded-full !px-6 !py-2 !font-medium hover:!bg-[#7C3AED] transition-all duration-200" />
        </div>
    );
} 