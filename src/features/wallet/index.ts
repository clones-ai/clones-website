// Main provider
export { default as WalletProvider } from './WalletProvider';

// Components
export { default as ConnectWalletButton } from './ConnectWalletButton';

// Hooks
export { useWalletAuth, type AuthPayload, type WalletStatus } from './hooks/useWalletAuth';
export { useWalletName } from './hooks/useWalletName';
export { useWalletReady, type WalletReadyState } from './hooks/useWalletReady';

// Config
export { wagmiConfig } from './wagmiConfig';

// Utilities
export { toUserError, type UserFacingError, type ErrorCategory } from './evmErrorDecoder';
