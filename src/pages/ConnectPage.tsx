import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Wallet, Shield, Zap } from 'lucide-react';
import { useWalletAuth } from '../features/wallet';
import { useWalletName } from '../features/wallet/useWalletName';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { RevealUp } from '../components/motion/Reveal';
import { AnimatedButton } from '../components/motion/AnimatedButton';

export default function ConnectPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [connecting, setConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const { openConnectModal } = useConnectModal();
    const { authenticateWallet, sendAuthToBackend, connected, ready, loading, status } = useWalletAuth();
    const walletName = useWalletName();

    const token = searchParams.get('token') || '';
    const refCode = searchParams.get('ref');

    // Latch to prevent duplicate auto-auth attempts
    const autoAuthStarted = useRef(false);

    const connectWallet = useCallback(async () => {
        try {
            setConnecting(true);
            setError(null);

            if (!connected) {
                throw new Error('Wallet not connected. Please connect your wallet first.');
            }

            if (!ready) {
                throw new Error('Wallet is not ready for authentication. Please wait a moment and try again.');
            }

            const authData = await authenticateWallet(refCode);
            await sendAuthToBackend(authData, token);

            setSuccess(true);
            setError(null);

            // optional UX: redirect after a short delay
            setTimeout(() => {
                navigate('/');
            }, 3000);
        } catch (err: unknown) {
            console.error(err);
            const message = err instanceof Error ? err.message : 'Unknown error occurred';
            setError('Failed to connect wallet: ' + message);
        } finally {
            setConnecting(false);
        }
    }, [connected, ready, authenticateWallet, refCode, sendAuthToBackend, token, navigate]);

    // If token is present and we are NOT connected (and not reconnecting), open the wallet modal automatically.
    useEffect(() => {
        if (token && !connected && !loading && openConnectModal && status === 'disconnected') {
            openConnectModal();
        }
    }, [token, connected, loading, openConnectModal, status]);

    // Single auto-auth effect: run once when wallet becomes truly ready
    useEffect(() => {
        if (
            token &&
            connected &&
            ready &&
            !connecting &&
            !success &&
            !error &&
            !autoAuthStarted.current
        ) {
            autoAuthStarted.current = true; // prevents duplicate calls
            void connectWallet();
        }
    }, [
        token,
        connected,
        ready,
        connecting,
        success,
        error,
        connectWallet,
    ]);

    return (
        <section className="min-h-screen flex flex-col justify-center py-24 px-4 sm:px-6 relative overflow-hidden">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <RevealUp distance={8}>
                    <div className="text-center mb-16">
                        <div className="w-20 h-20 mx-auto mb-6 ultra-premium-glass-card rounded-full flex items-center justify-center">
                            <Wallet className="w-10 h-10 text-primary-500" />
                        </div>

                        <h1 className="text-4xl md:text-5xl font-light text-text-primary mb-6 tracking-wide font-system">
                            {connected ? 'Authenticate Wallet' : 'Connect Your Wallet'}
                        </h1>
                        <p className="text-text-secondary text-lg leading-relaxed max-w-xl mx-auto">
                            {connected
                                ? `Sign a message with your ${walletName} to authenticate with Clones Desktop`
                                : 'Connect your Ethereum wallet (MetaMask, Coinbase Wallet, Rabby, etc.) to access Clones Desktop'}
                        </p>
                    </div>
                </RevealUp>

                {/* Connection Card */}
                <RevealUp distance={6}>
                    <div className="ultra-premium-glass-card rounded-2xl p-8">
                        {!token ? (
                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto mb-4 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center">
                                    <Shield className="w-8 h-8 text-red-400" />
                                </div>
                                <h3 className="text-xl font-medium text-text-primary mb-2 font-system">Authentication Required</h3>
                                <p className="text-text-secondary">No connection token provided</p>
                            </div>
                        ) : success ? (
                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto mb-4 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center">
                                    <Shield className="w-8 h-8 text-green-400" />
                                </div>
                                <h3 className="text-xl font-medium text-text-primary mb-2 font-system">Authentication Successful</h3>
                                <p className="text-text-secondary mb-6">Your wallet has been authenticated with Clones Desktop</p>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-center gap-3 px-6 py-3 ultra-premium-glass-card border border-green-500/30 rounded-full">
                                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                        <span className="text-text-primary font-medium font-system">Wallet Authenticated</span>
                                    </div>

                                    <AnimatedButton
                                        onClick={() => setSuccess(false)}
                                        variant="secondary"
                                        className="w-full font-system"
                                    >
                                        Authenticate Again
                                    </AnimatedButton>
                                </div>
                            </div>
                        ) : error ? (
                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto mb-4 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center">
                                    <Shield className="w-8 h-8 text-red-400" />
                                </div>
                                <h3 className="text-xl font-medium text-text-primary mb-2 font-system">Connection Failed</h3>
                                <p className="text-text-secondary text-sm">{error}</p>
                            </div>
                        ) : (
                            <div className="text-center">
                                {connected ? (
                                    <div className="space-y-4">
                                        <div className={`flex items-center justify-center gap-3 px-6 py-3 ultra-premium-glass-card border rounded-full ${
                                            ready ? 'border-green-500/30' : 'border-yellow-500/30'
                                        }`}>
                                            <div className={`w-2 h-2 rounded-full ${
                                                ready ? 'bg-green-400 animate-pulse' : 'bg-yellow-400 animate-spin'
                                            }`}></div>
                                            <span className="text-text-primary font-medium font-system">
                                                {status === 'reconnecting' ? 'Reconnecting Wallet…' :
                                                 status === 'connecting' ? 'Preparing Wallet…' : 
                                                 status === 'ready' ? 'Wallet Connected' : 'Wallet Connected'}
                                            </span>
                                        </div>

                                        <AnimatedButton
                                            onClick={connectWallet}
                                            disabled={connecting || !ready}
                                            variant="primary"
                                            icon={Shield}
                                            loading={connecting || loading}
                                            className="w-full font-system"
                                        >
                                            {connecting || loading
                                                ? (connecting ? 'Authenticating…' : 'Preparing Wallet…')
                                                : 'Sign Message & Authenticate'
                                            }
                                        </AnimatedButton>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-center gap-3 px-6 py-3 ultra-premium-glass-card border border-text-muted/30 rounded-full">
                                            <Zap className="w-5 h-5 text-text-muted" />
                                            <span className="text-text-muted font-medium font-system">Wallet Not Connected</span>
                                        </div>

                                        <p className="text-text-secondary text-sm">
                                            Please connect your wallet using the button in the top-right corner
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Help section */}
                        <div className="mt-8 text-center space-y-3">
                            <p className="text-text-secondary text-sm">Don't have an EVM wallet?</p>
                            <div className="flex flex-wrap justify-center gap-3">
                                <a
                                    href="https://metamask.io/download"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 ultra-premium-glass-card border border-primary-500/30 rounded-full text-text-secondary hover:text-text-primary hover:border-primary-500/60 transition-all duration-200 text-sm hover:shadow-ultra-premium-hover"
                                >
                                    <span>MetaMask</span>
                                </a>
                                <a
                                    href="https://coinbase.com/wallet"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 ultra-premium-glass-card border border-blue-500/30 rounded-full text-text-secondary hover:text-text-primary hover:border-blue-500/60 transition-all duration-200 text-sm hover:shadow-ultra-premium-hover"
                                >
                                    <span>Coinbase Wallet</span>
                                </a>
                                <a
                                    href="https://rabby.io/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 ultra-premium-glass-card border border-pink-500/30 rounded-full text-text-secondary hover:text-text-primary hover:border-pink-500/60 transition-all duration-200 text-sm hover:shadow-ultra-premium-hover"
                                >
                                    <span>Rabby</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </RevealUp>
            </div>
        </section>
    );
}
