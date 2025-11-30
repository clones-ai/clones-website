import { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useConnect, type Connector } from 'wagmi';

/**
 * Custom wallet connect button using RainbowKit's render props.
 * 
 * Follows RainbowKit best practices:
 * - Properly checks `mounted` and `authenticationStatus` for readiness
 * - Checks provider availability before enabling buttons
 * - Handles all connection states cleanly
 */
export default function ConnectWalletButton() {
    return (
        <ConnectButton.Custom>
            {({
                account,
                chain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                authenticationStatus,
                mounted,
            }) => {
                // Check if component is ready for interaction
                const ready = mounted && authenticationStatus !== 'loading';

                // Full connection check including auth status
                const connected =
                    ready &&
                    account &&
                    chain &&
                    (!authenticationStatus || authenticationStatus === 'authenticated');

                return (
                    <div
                        {...(!ready && {
                            'aria-hidden': true,
                            style: {
                                opacity: 0,
                                pointerEvents: 'none',
                                userSelect: 'none',
                            } as React.CSSProperties,
                        })}
                    >
                        {(() => {
                            // Not connected - show connect button
                            if (!connected) {
                                return (
                                    <ConnectButtonWithProviderCheck
                                        onClick={openConnectModal}
                                    />
                                );
                            }

                            // Wrong network
                            if (chain?.unsupported) {
                                return (
                                    <button
                                        onClick={openChainModal}
                                        type="button"
                                        className="bg-red-500 text-white rounded-full px-6 py-2 font-medium hover:bg-red-600 transition-all duration-200"
                                    >
                                        Wrong network
                                    </button>
                                );
                            }

                            // Connected - show chain and account
                            return (
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={openChainModal}
                                        type="button"
                                        className="flex items-center bg-[#8B5CF6] text-white rounded-full px-4 py-2 font-medium hover:bg-[#7C3AED] transition-all duration-200"
                                    >
                                        {chain?.hasIcon && (
                                            <div
                                                className="mr-2"
                                                style={{
                                                    background: chain.iconBackground,
                                                    width: 16,
                                                    height: 16,
                                                    borderRadius: 999,
                                                    overflow: 'hidden',
                                                }}
                                            >
                                                {chain?.iconUrl && (
                                                    <img
                                                        alt={chain.name ?? 'Chain icon'}
                                                        src={chain.iconUrl}
                                                        style={{ width: 16, height: 16 }}
                                                    />
                                                )}
                                            </div>
                                        )}
                                        {chain?.name}
                                    </button>

                                    <button
                                        onClick={openAccountModal}
                                        type="button"
                                        className="bg-[#8B5CF6] text-white rounded-full px-6 py-2 font-medium hover:bg-[#7C3AED] transition-all duration-200"
                                    >
                                        {account?.displayName}
                                        {account?.displayBalance ? ` (${account.displayBalance})` : ''}
                                    </button>
                                </div>
                            );
                        })()}
                    </div>
                );
            }}
        </ConnectButton.Custom>
    );
}

/**
 * Connect button that checks provider availability.
 * 
 * This follows RainbowKit's recommended pattern for checking
 * if a wallet provider is actually available before enabling the button.
 */
function ConnectButtonWithProviderCheck({ onClick }: { onClick: () => void }) {
    const { connectors } = useConnect();
    const { isConnecting, isReconnecting } = useAccount();
    const [hasAvailableProvider, setHasAvailableProvider] = useState(false);
    const [isCheckingProviders, setIsCheckingProviders] = useState(true);

    // Check if any connector has an available provider
    useEffect(() => {
        let cancelled = false;

        const checkProviders = async () => {
            setIsCheckingProviders(true);

            try {
                // Check each connector for provider availability
                const providerChecks = connectors.map(async (connector: Connector) => {
                    try {
                        const provider = await connector.getProvider();
                        return !!provider;
                    } catch {
                        return false;
                    }
                });

                const results = await Promise.all(providerChecks);

                if (!cancelled) {
                    setHasAvailableProvider(results.some(Boolean));
                    setIsCheckingProviders(false);
                }
            } catch {
                if (!cancelled) {
                    // Default to allowing connection even if check fails
                    setHasAvailableProvider(true);
                    setIsCheckingProviders(false);
                }
            }
        };

        checkProviders();

        return () => {
            cancelled = true;
        };
    }, [connectors]);

    const isLoading = isConnecting || isReconnecting || isCheckingProviders;

    const getButtonText = () => {
        if (isReconnecting) return 'Reconnecting...';
        if (isConnecting) return 'Connecting...';
        if (isCheckingProviders) return 'Loading...';
        return 'Connect Wallet';
    };

    return (
        <button
            onClick={onClick}
            disabled={isLoading && !hasAvailableProvider}
            type="button"
            className={`
                bg-[#8B5CF6] text-white rounded-full px-6 py-2 font-medium
                transition-all duration-200
                ${isLoading
                    ? 'opacity-70 cursor-not-allowed'
                    : 'hover:bg-[#7C3AED]'
                }
            `}
            aria-label="Connect wallet"
        >
            {getButtonText()}
        </button>
    );
}
