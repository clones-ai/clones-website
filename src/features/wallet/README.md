# Base Blockchain Wallet Integration

This feature provides complete Base blockchain wallet management with `wagmi` and `RainbowKit`, isolated and organized for better maintainability.

## Installation

```bash
npm install wagmi viem @rainbow-me/rainbowkit @tanstack/react-query
```

## Structure

```
src/features/wallet/
├── WalletProvider.tsx      # Main provider for the application
├── ConnectWalletButton.tsx # Connect/disconnect button
├── useWalletAuth.ts        # Authentication hook
├── useWalletName.ts        # Hook to get connected wallet name
├── index.ts               # Centralized exports
└── README.md              # Documentation
```

## Quick Start

### 1. Setup in App.tsx

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
import { ConnectWalletButton } from '../features/wallet';

function Navigation() {
  return (
    <nav>
      <ConnectWalletButton />
    </nav>
  );
}
```

### 3. Use authentication in components

```tsx
import { useWalletAuth } from '../features/wallet';
import { useWalletName } from '../features/wallet/useWalletName';

function MyComponent() {
  const { authenticateWallet, connected, isWalletClientLoading } = useWalletAuth();
  const walletName = useWalletName();

  const handleAuth = async () => {
    if (!connected || isWalletClientLoading) return;
    
    try {
      const authData = await authenticateWallet();
      // authData = { address, signature, timestamp, message }
      
      // Send to backend...
    } catch (error) {
      console.error('Authentication failed:', error);
    }
  };

  return (
    <div>
      <p>Connected with: {walletName}</p>
      <button 
        onClick={handleAuth} 
        disabled={!connected || isWalletClientLoading}
      >
        {isWalletClientLoading ? 'Loading Wallet...' : 'Authenticate'}
      </button>
    </div>
  );
}
```

## Features

- **Multi-wallet support** : MetaMask, WalletConnect, Coinbase Wallet, and more
- **Base blockchain support** : Optimized for Base mainnet and testnet
- **Auto-connect** : Automatic reconnection on page reload
- **Message signing** : Secure authentication with timestamp nonce
- **Smart loading states** : Handles wallet client timing and loading states
- **Error handling** : Clear error messages and robust error recovery
- **Design system** : Follows CLONES design with purple theme
- **Smart UI** : Dynamic messages based on connected wallet and network
- **Environment config** : Uses `VITE_API_URL` for backend communication
- **Timing management** : Prevents authentication attempts before wallet client is ready

## Authentication

### Message signing

The system uses message signing for backend authentication:

```tsx
import { useWalletAuth } from '../features/wallet';

function AuthComponent() {
  const { authenticateWallet, sendAuthToBackend, connected, isWalletClientLoading } = useWalletAuth();

  const handleAuth = async () => {
    if (!connected || isWalletClientLoading) {
      console.error('Wallet not ready for authentication');
      return;
    }

    try {
      const authData = await authenticateWallet();
      // authData contains: address, signature, timestamp, message
      
      // Send to backend
      await sendAuthToBackend(authData, 'optional-token');
    } catch (error) {
      console.error('Authentication failed:', error.message);
    }
  };
}
```

### Message format

```
Clones desktop
nonce: 1703123456789
```

## Loading States & Timing

The wallet integration handles various loading states to ensure smooth user experience:

### useWalletAuth Hook States

```tsx
const { 
  authenticateWallet, 
  sendAuthToBackend, 
  connected, 
  address, 
  isWalletClientLoading  // NEW: Indicates if wallet client is loading
} = useWalletAuth();
```

### Best Practices

1. **Always check loading state before authentication**:
```tsx
const handleAuth = async () => {
  if (!connected || isWalletClientLoading) {
    return; // Don't attempt auth if wallet client isn't ready
  }
  
  try {
    const authData = await authenticateWallet();
    // Process authentication...
  } catch (error) {
    // Handle timing or connection errors
  }
};
```

2. **Provide visual feedback during loading**:
```tsx
<button disabled={!connected || isWalletClientLoading}>
  {isWalletClientLoading ? 'Loading Wallet...' : 'Authenticate'}
</button>
```

3. **Handle auto-authentication timing**:
```tsx
useEffect(() => {
  if (connected && token && !isWalletClientLoading) {
    // Safe to auto-authenticate
    handleAuth();
  }
}, [connected, token, isWalletClientLoading]);
```

## Security

- **Message signing** : Cryptographic verification using Ethereum standards
- **Timestamp nonce** : Protection against replay attacks
- **Backend validation** : Server-side verification
- **Error handling** : Secure error management with proper timing checks
- **Network validation** : Ensures connection to correct Base network
- **Client state validation** : Prevents authentication attempts with invalid wallet client state

## Supported wallets

- **MetaMask** : Most popular Ethereum wallet
- **WalletConnect** : Protocol for connecting mobile wallets
- **Coinbase Wallet** : Native Base support
- **Rainbow** : Popular mobile wallet
- **Trust Wallet** : Multi-chain support

## Environment Variables

Create a `.env` file in your project root:

```env
VITE_API_URL=http://localhost:8001
VITE_WALLETCONNECT_PROJECT_ID=your-project-id-from-walletconnect-cloud
```

- `VITE_API_URL`: Backend URL
- `VITE_AUTH_ENDPOINT`: Backend API URL for authentication communication
- `VITE_WALLETCONNECT_PROJECT_ID`: Get this from [WalletConnect Cloud](https://cloud.walletconnect.com)

## Benefits

1. **Isolation** : All wallet logic grouped together
2. **Reusability** : Centralized imports via index.ts
3. **Maintainability** : Clear and documented structure
4. **Scalability** : Easy to add new wallets and chains
5. **Testability** : Isolated and testable components
6. **Smart UX** : Dynamic interface based on wallet and network state
7. **Environment flexibility** : Configurable backend URL and WalletConnect project
8. **Base optimized** : Native support for Base blockchain features
9. **Robust timing** : Proper handling of wallet client loading states
10. **Error resilience** : Graceful handling of connection timing issues

## Resources

- [Wagmi Documentation](https://wagmi.sh/)
- [RainbowKit Documentation](https://www.rainbowkit.com/)
- [Viem Documentation](https://viem.sh/)
- [Base Documentation](https://docs.base.org/)
- [WalletConnect Cloud](https://cloud.walletconnect.com/) 