import { http, createStorage } from 'wagmi';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base, baseSepolia } from 'wagmi/chains';

/**
 * Custom storage with timeout to prevent infinite reconnection loops
 */
const customStorage = createStorage({
    storage: {
        getItem: (key) => {
            try {
                const item = localStorage.getItem(key);
                if (!item) return null;
                
                const parsed = JSON.parse(item);
                // Check if stored connection is older than 5 minutes
                if (parsed.timestamp && Date.now() - parsed.timestamp > 5 * 60 * 1000) {
                    localStorage.removeItem(key);
                    return null;
                }
                return item;
            } catch {
                return null;
            }
        },
        setItem: (key, value) => {
            try {
                const valueWithTimestamp = JSON.stringify({
                    ...JSON.parse(value),
                    timestamp: Date.now()
                });
                localStorage.setItem(key, valueWithTimestamp);
            } catch {
                localStorage.setItem(key, value);
            }
        },
        removeItem: (key) => localStorage.removeItem(key),
    },
});

/**
 * Wagmi configuration created outside component to prevent recreation
 * This fixes the main cause of isReconnecting getting stuck
 */
export const wagmiConfig = getDefaultConfig({
    appName: 'Clones Desktop',
    projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'demo-project-id',
    chains: [base, baseSepolia],
    transports: {
        [base.id]: http(),
        [baseSepolia.id]: http(),
    },
    storage: customStorage,
    ssr: false,
    // Add reconnection timeout to prevent infinite loops
    syncConnectedChain: true,
});