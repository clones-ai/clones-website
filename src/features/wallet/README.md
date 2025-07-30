# Solana Wallet Integration

This feature provides complete Solana wallet management with `@solana/wallet-adapter`, isolated and organized for better maintainability.

## Installation

```bash
npm install @solana/wallet-adapter-react @solana/wallet-adapter-wallets @solana/wallet-adapter-react-ui @solana/web3.js
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
  const { authenticateWallet, connected } = useWalletAuth();
  const walletName = useWalletName();

  const handleAuth = async () => {
    if (!connected) return;
    
    const authData = await authenticateWallet();
    // authData = { address, signature, timestamp, message }
    
    // Send to backend...
  };

  return (
    <div>
      <p>Connected with: {walletName}</p>
      <button onClick={handleAuth}>Authenticate</button>
    </div>
  );
}
```

## Features

- **Multi-wallet support** : Phantom, Solflare, Torus
- **Auto-connect** : Automatic reconnection on page reload
- **Message signing** : Secure authentication with timestamp nonce
- **Error handling** : Clear error messages and states
- **Design system** : Follows CLONES design with purple theme
- **Smart UI** : Dynamic messages based on connected wallet
- **Environment config** : Uses `PUBLIC_API_URL` for backend communication

## Authentication

### Message signing

The system uses message signing for backend authentication:

```tsx
import { useWalletAuth } from '../features/wallet';

function AuthComponent() {
  const { authenticateWallet, sendAuthToBackend } = useWalletAuth();

  const handleAuth = async () => {
    const authData = await authenticateWallet();
    // authData contains: address, signature, timestamp, message
    
    // Send to backend
    await sendAuthToBackend(authData, 'https://your-api.com', 'optional-token');
  };
}
```

### Message format

```
Clones desktop
nonce: 1703123456789
```

## Security

- **Message signing** : Cryptographic verification
- **Timestamp nonce** : Protection against replay attacks
- **Backend validation** : Server-side verification
- **Error handling** : Secure error management

## Supported wallets

- **Phantom** : Most popular wallet
- **Solflare** : Robust alternative
- **Torus** : Social wallet

## Environment Variables

Create a `.env` file in your project root:

```env
PUBLIC_API_URL=http://localhost:8001
```

This URL is used for backend authentication communication.

## Benefits

1. **Isolation** : All wallet logic grouped together
2. **Reusability** : Centralized imports via index.ts
3. **Maintainability** : Clear and documented structure
4. **Scalability** : Easy to add new wallets
5. **Testability** : Isolated and testable components
6. **Smart UX** : Dynamic interface based on wallet state
7. **Environment flexibility** : Configurable backend URL

## Resources

- [Solana Wallet Adapter Documentation](https://solana.com/developers/cookbook/wallets/connect-wallet-react)
- [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/)
- [Wallet Standard](https://github.com/solana-labs/wallet-standard) 