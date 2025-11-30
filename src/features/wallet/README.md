# Base Blockchain Wallet Integration

This feature provides complete Base blockchain wallet management with `wagmi` v2 and `RainbowKit`, following best practices for reliable wallet connections.

## Installation

```bash
npm install wagmi viem @rainbow-me/rainbowkit @tanstack/react-query
```

## Structure

```
src/features/wallet/
├── WalletProvider.tsx       # Root provider wrapping the app
├── ConnectWalletButton.tsx  # Connect/disconnect button component
├── wagmiConfig.ts           # Wagmi configuration
├── evmErrorDecoder.ts       # EVM error parsing utilities
├── hooks/
│   ├── index.ts             # Hook exports
│   ├── useWalletReady.ts    # Centralized wallet readiness state
│   ├── useWalletAuth.ts     # Authentication hook
│   └── useWalletName.ts     # Connected wallet name hook
├── index.ts                 # Public API exports
└── README.md                # This file
```

## Quick Start

### 1. Wrap your app with WalletProvider

```tsx
import { WalletProvider } from './features/wallet';

function App() {
  return (
    <WalletProvider>
      <Router>
        {/* Your application */}
      </Router>
    </WalletProvider>
  );
}
```

### 2. Add connect button to navigation

```tsx
import { ConnectWalletButton } from './features/wallet';

function Navigation() {
  return (
    <nav>
      <ConnectWalletButton />
    </nav>
  );
}
```

### 3. Use wallet hooks in components

```tsx
import { useWalletReady, useWalletAuth, useWalletName } from './features/wallet';

function MyComponent() {
  const { isReady, isConnected, isLoading, address } = useWalletReady();
  const { authenticateWallet, sendAuthToBackend } = useWalletAuth();
  const walletName = useWalletName();

  const handleAuth = async () => {
    if (!isReady) return;
    
    try {
      const authData = await authenticateWallet();
      await sendAuthToBackend(authData, 'optional-token');
      // Success!
    } catch (error) {
      console.error('Authentication failed:', error);
    }
  };

  return (
    <div>
      <p>Status: {isLoading ? 'Loading...' : isReady ? 'Ready' : 'Not connected'}</p>
      {isConnected && <p>Connected with: {walletName} ({address})</p>}
      <button onClick={handleAuth} disabled={!isReady}>
        Authenticate
      </button>
    </div>
  );
}
```

## Core Hooks

### useWalletReady

Centralized hook for wallet readiness state. **Use this as your single source of truth.**

```tsx
const {
  isReady,        // boolean - wallet fully ready for signing
  isConnected,    // boolean - wallet connected (may be initializing)
  isReconnecting, // boolean - actively reconnecting
  isLoading,      // boolean - any loading state
  address,        // `0x${string}` | undefined
  walletClient,   // Wallet client for signing
  wasForced,      // boolean - true if ready was forced due to timeout
} = useWalletReady();
```

Features:
- Single 8-second timeout for stuck reconnections
- Uses wagmi's `useAccountEffect` for proper event handling
- No polling - fully reactive
- Consolidates all state into one hook

### useWalletAuth

Authentication hook for wallet-based sign-in.

```tsx
const {
  authenticateWallet,  // () => Promise<AuthPayload>
  sendAuthToBackend,   // (payload, token?) => Promise<any>
  resetRateLimiting,   // () => void
  connected,           // boolean
  ready,               // boolean (alias for isReady)
  loading,             // boolean
  status,              // 'disconnected' | 'reconnecting' | 'connecting' | 'ready'
  address,             // `0x${string}` | undefined
  isSigning,           // boolean
} = useWalletAuth();
```

Features:
- Rate limiting with exponential backoff
- Circuit breaker after 3 failures (max 30s wait)
- No polling - relies on useWalletReady

### useWalletName

Returns a readable wallet name.

```tsx
const walletName = useWalletName(); // "MetaMask" or "0x1234...5678"
```

## Architecture Decisions

### Why no custom storage?

Previous implementations used custom storage with timestamps that:
- Corrupted wagmi's internal state format
- Caused unexpected session expiry
- Led to stuck reconnection states

The current implementation uses wagmi's native storage, letting wagmi handle persistence correctly.

### Why a single useWalletReady hook?

Previous implementations monitored `isReconnecting` in 4 different places with different timeouts (10s, 15s, etc.), causing:
- Race conditions
- Inconsistent UI states
- Unpredictable behavior

Now there's ONE source of truth with ONE timeout (8 seconds).

### Why no polling?

The `waitForTruthy` polling pattern (75ms intervals for 8 seconds) was:
- CPU-intensive
- Battery-draining on mobile
- An anti-pattern when reactive state is available

The new implementation is fully reactive using wagmi's hooks.

## Authentication Flow

### Message Format

```
Clones desktop
nonce: 1703123456789
```

The nonce is a Unix timestamp to prevent replay attacks.

### Payload Structure

```typescript
interface AuthPayload {
  address: `0x${string}`;
  signature: `0x${string}`;
  timestamp: number;
  message: string;
}
```

## Error Handling

Use the `evmErrorDecoder` for user-friendly error messages:

```tsx
import { toUserError } from './features/wallet';

try {
  await executeTransaction();
} catch (error) {
  const userError = toUserError(error, { abis: [myContractAbi] });
  showErrorToast(userError.title, userError.message);
}
```

## Supported Wallets

Via RainbowKit:
- MetaMask
- WalletConnect
- Coinbase Wallet
- Rainbow
- Trust Wallet
- And many more...

## Environment Variables

```env
VITE_API_URL=http://localhost:8001
VITE_WALLETCONNECT_PROJECT_ID=your-project-id
```

Get your WalletConnect Project ID from [WalletConnect Cloud](https://cloud.walletconnect.com).

## Migration from Previous Implementation

If upgrading from the old implementation:

1. Remove any `ConnectorCompatibilityGuard` imports
2. Replace multiple state checks with `useWalletReady`
3. Remove custom `isReconnecting` timeout handling
4. Use `isReady` from `useWalletReady` instead of manual checks

```tsx
// BEFORE
const { isConnected, isReconnecting, status } = useAccount();
const { data: walletClient, isLoading } = useWalletClient();
const ready = isConnected && !!walletClient && status === 'connected' && !isReconnecting && !isLoading;

// AFTER
const { isReady } = useWalletReady();
```

## Resources

- [Wagmi Documentation](https://wagmi.sh/)
- [RainbowKit Documentation](https://www.rainbowkit.com/)
- [Viem Documentation](https://viem.sh/)
- [Base Documentation](https://docs.base.org/)
