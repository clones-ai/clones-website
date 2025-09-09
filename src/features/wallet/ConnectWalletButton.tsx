import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

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
                const ready = mounted && authenticationStatus !== 'loading';
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
                            if (!connected) {
                                return (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={openConnectModal}
                                            type="button"
                                            className="bg-[#8B5CF6] text-white rounded-full px-6 py-2 font-medium hover:bg-[#7C3AED] transition-all duration-200"
                                            aria-label="Connect wallet"
                                        >
                                            Connect Wallet
                                        </button>
                                    </div>
                                );
                            }

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

                            return (
                                <div style={{ display: 'flex', gap: 12 }}>
                                    <button
                                        onClick={openChainModal}
                                        style={{ display: 'flex', alignItems: 'center' }}
                                        type="button"
                                        className="bg-[#8B5CF6] text-white rounded-full px-4 py-2 font-medium hover:bg-[#7C3AED] transition-all duration-200"
                                    >
                                        {chain?.hasIcon && (
                                            <div
                                                style={{
                                                    background: chain.iconBackground,
                                                    width: 12,
                                                    height: 12,
                                                    borderRadius: 999,
                                                    overflow: 'hidden',
                                                    marginRight: 4,
                                                }}
                                            >
                                                {chain?.iconUrl && (
                                                    <img
                                                        alt={chain.name ?? 'Chain icon'}
                                                        src={chain.iconUrl}
                                                        style={{ width: 12, height: 12 }}
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
