// Centralized exports for wallet functionality
export { default as WalletProvider } from './WalletProvider';
export { default as ConnectWalletButton } from './ConnectWalletButton';

// Re-export hooks from hooks directory
export { useWalletAuth, useWalletName } from './hooks';