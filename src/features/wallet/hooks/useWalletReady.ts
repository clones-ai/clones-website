import { useState, useEffect, useRef, useMemo } from 'react';
import { useAccount, useAccountEffect, useWalletClient } from 'wagmi';

/**
 * Timeout before forcing ready state when reconnection is stuck.
 * 8 seconds is a good balance between giving wallets time to reconnect
 * and not blocking the user too long.
 */
const RECONNECT_TIMEOUT_MS = 8000;

export interface WalletReadyState {
    /** Whether the wallet is fully ready for signing operations */
    isReady: boolean;
    /** Whether a wallet is connected (may still be initializing) */
    isConnected: boolean;
    /** Whether wallet is actively reconnecting */
    isReconnecting: boolean;
    /** Whether wallet is in any loading state */
    isLoading: boolean;
    /** Connected wallet address */
    address: `0x${string}` | undefined;
    /** Wallet client for signing */
    walletClient: ReturnType<typeof useWalletClient>['data'];
    /** Whether ready state was forced due to timeout */
    wasForced: boolean;
}

/**
 * Centralized hook for wallet readiness state.
 * 
 * This hook consolidates all wallet state checks into a single source of truth,
 * replacing the fragmented monitoring across multiple components.
 * 
 * Features:
 * - Single timeout for stuck reconnection (8s)
 * - Proper event handling via useAccountEffect
 * - No polling - fully reactive
 * - Clear ready state for signing operations
 */
export function useWalletReady(): WalletReadyState {
    const { isConnected, isReconnecting, address, status } = useAccount();
    const { data: walletClient, isLoading: isWalletClientLoading } = useWalletClient();
    
    const [forceReady, setForceReady] = useState(false);
    const reconnectStartRef = useRef<number>(0);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    
    // Monitor reconnection with single timeout
    useEffect(() => {
        if (isReconnecting) {
            if (reconnectStartRef.current === 0) {
                reconnectStartRef.current = Date.now();
                
                timeoutRef.current = setTimeout(() => {
                    console.warn(
                        `[useWalletReady] Reconnection timeout after ${RECONNECT_TIMEOUT_MS}ms, forcing ready state`
                    );
                    setForceReady(true);
                }, RECONNECT_TIMEOUT_MS);
            }
        } else {
            // Reconnection completed or never started
            if (reconnectStartRef.current > 0) {
                const duration = Date.now() - reconnectStartRef.current;
                console.log(`[useWalletReady] Reconnection completed in ${duration}ms`);
            }
            
            reconnectStartRef.current = 0;
            setForceReady(false);
            
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        }
        
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        };
    }, [isReconnecting]);
    
    // Handle connection lifecycle events
    useAccountEffect({
        onConnect({ address: connectedAddress, connector }) {
            console.log(
                `[useWalletReady] Connected: ${connectedAddress?.slice(0, 8)}... via ${connector.name}`
            );
            // Reset force state on fresh connection
            setForceReady(false);
            reconnectStartRef.current = 0;
        },
        onDisconnect() {
            console.log('[useWalletReady] Disconnected');
            setForceReady(false);
            reconnectStartRef.current = 0;
        },
    });
    
    // Computed ready state
    const isReady = useMemo(() => {
        const baseConditions = 
            isConnected && 
            !!address && 
            !!walletClient && 
            status === 'connected' && 
            !isWalletClientLoading;
        
        // Ready if base conditions met AND (not reconnecting OR force ready)
        return baseConditions && (!isReconnecting || forceReady);
    }, [isConnected, address, walletClient, status, isWalletClientLoading, isReconnecting, forceReady]);
    
    const isLoading = useMemo(() => {
        return isWalletClientLoading || (isReconnecting && !forceReady);
    }, [isWalletClientLoading, isReconnecting, forceReady]);
    
    return {
        isReady,
        isConnected,
        isReconnecting: isReconnecting && !forceReady,
        isLoading,
        address,
        walletClient,
        wasForced: forceReady,
    };
}

