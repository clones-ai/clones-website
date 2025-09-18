import { useMemo } from 'react';
import { useAccount } from 'wagmi';

/**
 * Returns a readable wallet name (connector name), falling back to address short form.
 */
export function useWalletName() {
    const { address, connector } = useAccount();

    return useMemo(() => {
        if (connector?.name) return connector.name;
        if (!address) return 'Wallet';
        return `${address.slice(0, 6)}…${address.slice(-4)}`;
    }, [address, connector?.name]);
}
