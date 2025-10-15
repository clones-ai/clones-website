import { useEffect, useRef } from 'react';
import { useAccount, useDisconnect, useConnectorClient } from 'wagmi';

/**
 * Disconnects and resets if the active connector appears to be a stale/legacy instance
 * (e.g., missing required methods like getChainId), which can happen after HMR or
 * when multiple optimized deps conflict.
 * 
 * Enhanced with timeout protection to prevent infinite reconnection loops.
 */
export default function ConnectorCompatibilityGuard() {
    const { isConnected, isReconnecting } = useAccount();
    const { disconnect } = useDisconnect();
    const { data: client } = useConnectorClient();
    
    const lastDisconnectTime = useRef(0);
    const reconnectingStartTime = useRef(0);
    const hasLoggedTimeout = useRef(false);

    useEffect(() => {
        if (!isConnected || !client) return;

        // Prevent too frequent disconnections (max 1 per 10 seconds)
        const now = Date.now();
        if (now - lastDisconnectTime.current < 10000) {
            return;
        }

        const connector: any = (client as any)?.transport?.connector ?? (client as any)?.connector ?? null;

        // If connector is present but doesn't implement getChainId (wagmi v2 expectation), force a disconnect
        if (connector && typeof connector.getChainId !== 'function') {
            console.warn('[ConnectorCompatibilityGuard] Detected incompatible connector (missing getChainId). Forcing disconnect.');
            try {
                disconnect();
                lastDisconnectTime.current = now;
            } catch (e) {
                console.warn('[ConnectorCompatibilityGuard] Disconnect failed:', e);
            }
        }
    }, [isConnected, client, disconnect]);

    // Monitor isReconnecting state and log timeout warnings
    useEffect(() => {
        if (isReconnecting) {
            if (reconnectingStartTime.current === 0) {
                reconnectingStartTime.current = Date.now();
                hasLoggedTimeout.current = false;
                console.log('[ConnectorCompatibilityGuard] Reconnection started');
            }
        } else {
            if (reconnectingStartTime.current > 0) {
                const duration = Date.now() - reconnectingStartTime.current;
                console.log(`[ConnectorCompatibilityGuard] Reconnection completed in ${duration}ms`);
                reconnectingStartTime.current = 0;
                hasLoggedTimeout.current = false;
            }
        }

        // Log warning if reconnecting for too long
        if (isReconnecting && reconnectingStartTime.current > 0) {
            const duration = Date.now() - reconnectingStartTime.current;
            if (duration > 15000 && !hasLoggedTimeout.current) { // 15 seconds
                console.warn(`[ConnectorCompatibilityGuard] Reconnection taking unusually long: ${duration}ms. This may indicate a stuck state.`);
                hasLoggedTimeout.current = true;
            }
        }
    }, [isReconnecting]);

    return null;
}


