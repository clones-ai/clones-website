import { useWallet } from '@solana/wallet-adapter-react';

export interface WalletAuthResult {
    address: string;
    signature: string;
    timestamp: number;
    message: string;
}

export interface BackendPayload {
    address: string;
    signature: string;
    timestamp: number;
    token?: string;
}

export function useWalletAuth() {
    const { publicKey, signMessage, connected } = useWallet();

    const authenticateWallet = async (): Promise<WalletAuthResult | null> => {
        if (!connected || !publicKey || !signMessage) {
            throw new Error('Wallet not connected or does not support message signing');
        }

        try {
            // Create message with timestamp nonce
            const timestamp = Date.now();
            const message = `Clones desktop\nnonce: ${timestamp}`;

            // Convert message to Uint8Array for signing
            const messageBytes = new TextEncoder().encode(message);
            const signature = await signMessage(messageBytes);
            const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)));

            return {
                address: publicKey.toString(),
                signature: signatureBase64,
                timestamp,
                message
            };
        } catch (error) {
            console.error('Failed to authenticate wallet:', error);
            throw error;
        }
    };

    const sendAuthToBackend = async (authData: WalletAuthResult, token?: string) => {
        // TODO: Fix env var loading
        const apiUrl = import.meta.env.PUBLIC_API_URL || 'http://localhost:8001';

        const payload: BackendPayload = {
            address: authData.address,
            signature: authData.signature,
            timestamp: authData.timestamp
        };

        if (token) {
            payload.token = token;
        }

        const response = await fetch(`${apiUrl}/api/v1/wallet/connect`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Backend authentication failed: ${response.statusText}`);
        }

        return response.json();
    };

    return {
        authenticateWallet,
        sendAuthToBackend,
        connected,
        publicKey
    };
} 