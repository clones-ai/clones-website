import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Wallet, Shield, Zap, CheckCircle, AlertTriangle } from 'lucide-react';
import { useWalletAuth, useWalletName } from '../features/wallet/hooks';
import { useAccount } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { RevealUp } from '../components/motion/Reveal';
import { AnimatedButton } from '../components/motion/AnimatedButton';
import { SimpleSpline } from '../components/shared/SimpleSpline';

export default function ConnectPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [connecting, setConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const { openConnectModal } = useConnectModal();
    const { authenticateWallet, sendAuthToBackend, ready } = useWalletAuth();
    const { isConnected, isReconnecting } = useAccount();
    const walletName = useWalletName();

    const token = searchParams.get('token') || '';
    const fromPage = searchParams.get('from');
    const sessionId = searchParams.get('sessionId');

    // Latch to prevent duplicate auto-auth attempts
    const autoAuthStarted = useRef(false);
    const stableReadyTimestamp = useRef<number>(0);
    
    // Fallback mechanism for stuck isReconnecting state
    const reconnectingStartTime = useRef(0);
    const [showReconnectingTimeout, setShowReconnectingTimeout] = useState(false);

    const connectWallet = useCallback(async () => {
        try {
            setConnecting(true);
            setError(null);

            if (!isConnected) {
                throw new Error('Wallet not connected. Please connect your wallet first.');
            }

            if (!ready) {
                throw new Error('Wallet is not ready for authentication. Please wait a moment and try again.');
            }

            const authData = await authenticateWallet();
            await sendAuthToBackend(authData, token);

            setSuccess(true);
            setError(null);

            setTimeout(() => {
                if (fromPage === 'transaction' && sessionId) {
                    navigate(`/wallet/transaction?sessionId=${sessionId}`);
                } else {
                    navigate('/');
                }
            }, 2000);
        } catch (err: unknown) {
            console.error(err);
            const message = err instanceof Error ? err.message : 'Unknown error occurred';
            setError('Failed to connect wallet: ' + message);
            // Reset the latch so user can retry auto-auth
            autoAuthStarted.current = false;
        } finally {
            setConnecting(false);
        }
    }, [isConnected, ready, authenticateWallet, sendAuthToBackend, token, navigate, fromPage, sessionId]);

    // Track when wallet becomes ready for stability check
    const [isStable, setIsStable] = useState(false);

    useEffect(() => {
        if (ready && !isReconnecting) {
            if (stableReadyTimestamp.current === 0) {
                console.log('Wallet ready, starting stability timer...');
                stableReadyTimestamp.current = Date.now();
                setIsStable(false);

                // Wait 300ms for wallet to stabilize before allowing auto-auth
                const timer = setTimeout(() => {
                    console.log('Wallet stable, ready for auto-auth');
                    setIsStable(true);
                }, 300);

                return () => clearTimeout(timer);
            }
        } else {
            stableReadyTimestamp.current = 0;
            setIsStable(false);
        }
    }, [ready, isReconnecting]);

    // Monitor isReconnecting timeout and show fallback
    useEffect(() => {
        if (isReconnecting) {
            if (reconnectingStartTime.current === 0) {
                reconnectingStartTime.current = Date.now();
                setShowReconnectingTimeout(false);
                console.log('[ConnectPage] Reconnection started, monitoring...');
            }
        } else {
            if (reconnectingStartTime.current > 0) {
                const duration = Date.now() - reconnectingStartTime.current;
                console.log(`[ConnectPage] Reconnection completed in ${duration}ms`);
                reconnectingStartTime.current = 0;
                setShowReconnectingTimeout(false);
            }
        }

        // Show timeout warning and provide manual override after 15 seconds
        if (isReconnecting && reconnectingStartTime.current > 0) {
            const duration = Date.now() - reconnectingStartTime.current;
            if (duration > 15000 && !showReconnectingTimeout) {
                console.warn(`[ConnectPage] Reconnection timeout (${duration}ms). Showing manual override.`);
                setShowReconnectingTimeout(true);
            }
        }
    }, [isReconnecting, showReconnectingTimeout]);

    // Auto-open connect modal if not connected (but allow override if reconnecting too long)
    useEffect(() => {
        if (token && !isConnected && (!isReconnecting || showReconnectingTimeout) && openConnectModal) {
            console.log('Auto-opening connect modal...');
            openConnectModal();
        }
    }, [token, isConnected, isReconnecting, showReconnectingTimeout, openConnectModal]);

    // Auto-authenticate once wallet is connected AND stable
    useEffect(() => {
        if (
            token &&
            isConnected &&
            (!isReconnecting || showReconnectingTimeout) && // Wait for reconnection or allow timeout override
            ready &&
            isStable && // Wait for stability period
            !connecting &&
            !success &&
            !error &&
            !autoAuthStarted.current
        ) {
            console.log('Starting auto-authentication...', {
                isConnected,
                isReconnecting,
                ready,
                isStable
            });
            autoAuthStarted.current = true;
            void connectWallet();
        }
    }, [
        token,
        isConnected,
        isReconnecting,
        showReconnectingTimeout,
        ready,
        isStable,
        connecting,
        success,
        error,
        connectWallet,
    ]);

    const renderStateContent = () => {
        if (!token) {
            return (
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center">
                        <Shield className="w-8 h-8 text-red-400" />
                    </div>
                    <h3 className="text-xl font-medium text-text-primary mb-2 font-system">Authentication Required</h3>
                    <p className="text-text-secondary">No connection token provided. Please initiate connection from the Clones Desktop app.</p>
                </div>
            );
        }

        if (success) {
            return (
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-8 h-8 text-green-400" />
                    </div>
                    <h3 className="text-xl font-medium text-text-primary mb-2 font-system">Authentication Successful</h3>
                    <p className="text-text-secondary">Redirecting you back to the app...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center">
                        <AlertTriangle className="w-8 h-8 text-red-400" />
                    </div>
                    <h3 className="text-xl font-medium text-text-primary mb-2 font-system">Authentication Failed</h3>
                    <p className="text-text-secondary text-sm mb-6">{error}</p>
                    <AnimatedButton
                        onClick={() => {
                            setError(null);
                            autoAuthStarted.current = false;
                            if (isConnected) {
                                void connectWallet();
                            } else {
                                openConnectModal?.();
                            }
                        }}
                        variant="secondary"
                        size="lg"
                    >
                        Try Again
                    </AnimatedButton>
                </div>
            );
        }

        if (isConnected) {
            return (
                <div className="space-y-6 text-center">
                    <div className={`inline-flex items-center justify-center gap-3 px-6 py-3 ultra-premium-glass-card border rounded-full ${ready ? 'border-green-500/30' : 'border-yellow-500/30'}`}>
                        <div className={`w-2 h-2 rounded-full ${ready ? 'bg-green-400 animate-pulse' : 'bg-yellow-400 animate-spin'}`} />
                        <span className="text-text-primary font-medium font-system">
                            {isReconnecting ? 
                            showReconnectingTimeout ? 'Reconnection Taking Long...' : 'Reconnecting Wallet...' 
                            : ready ? `${walletName} Connected` : 'Preparing Wallet...'}
                        </span>
                    </div>

                    {isReconnecting && (
                        <p className="text-text-secondary text-sm">
                            {showReconnectingTimeout ? 
                                'Connection is taking longer than expected. You can try reconnecting manually.' : 
                                'Please wait while we establish a connection with your wallet...'}
                        </p>
                    )}

                    {showReconnectingTimeout && (
                        <div className="mb-4">
                            <AnimatedButton
                                onClick={() => {
                                    // Force refresh/reconnect by opening modal
                                    setShowReconnectingTimeout(false);
                                    reconnectingStartTime.current = 0;
                                    openConnectModal?.();
                                }}
                                variant="secondary"
                                size="sm"
                                className="mr-3"
                            >
                                Reconnect Manually
                            </AnimatedButton>
                            <AnimatedButton
                                onClick={() => window.location.reload()}
                                variant="secondary"
                                size="sm"
                            >
                                Refresh Page
                            </AnimatedButton>
                        </div>
                    )}

                    <AnimatedButton
                        onClick={connectWallet}
                        disabled={connecting || !ready || (isReconnecting && !showReconnectingTimeout)}
                        variant="primary"
                        icon={Shield}
                        loading={connecting || (isReconnecting && !showReconnectingTimeout)}
                        className="w-full font-system"
                        size="lg"
                    >
                        {isReconnecting && !showReconnectingTimeout ? 'Reconnecting...' : connecting ? 'Check Wallet...' : 'Sign & Authenticate'}
                    </AnimatedButton>
                </div>
            );
        }

        return (
            <div className="space-y-6 text-center">
                <div className="inline-flex items-center justify-center gap-3 px-6 py-3 ultra-premium-glass-card border border-text-muted/30 rounded-full">
                    <Zap className="w-5 h-5 text-text-muted" />
                    <span className="text-text-muted font-medium font-system">Wallet Not Connected</span>
                </div>
                <p className="text-text-secondary text-base max-w-sm mx-auto">
                    Please connect your wallet to continue. The connect modal should have opened automatically.
                </p>
                <AnimatedButton
                    onClick={() => openConnectModal?.()}
                    variant="primary"
                    icon={Wallet}
                    className="w-full font-system"
                    size="lg"
                >
                    Open Connect Modal
                </AnimatedButton>
            </div>
        );
    };

    return (
        <section className="min-h-screen flex flex-col justify-center relative py-12 px-4 sm:px-6 overflow-hidden">
            <div className="absolute inset-0 z-0">
                <SimpleSpline
                    url="/data-transfer.splinecode"
                    className="absolute inset-0"
                    style={{
                        opacity: '0.2',
                        minHeight: '100vh',
                        height: '100vh',
                    }}
                    loading="lazy"
                />
                <div
                    className="absolute inset-0 pointer-events-none z-10"
                    style={{
                        background: 'radial-gradient(circle at center, transparent 0%, rgba(12, 5, 21, 0.8) 70%, rgba(12, 5, 21, 1) 100%)'
                    }}
                />
            </div>

            <div className="relative max-w-2xl mx-auto text-center z-10">
                <RevealUp>
                    <div className="w-20 h-20 mx-auto mb-8 ultra-premium-glass-card rounded-full flex items-center justify-center">
                        <Wallet className="w-10 h-10 text-primary-500" />
                    </div>
                </RevealUp>

                <RevealUp>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-text-primary tracking-wide mb-6 leading-tight font-system">
                        Wallet Authentication
                    </h1>
                </RevealUp>
                <RevealUp>
                    <p className="text-lg text-text-muted max-w-xl mx-auto leading-relaxed mb-12">
                        {isConnected
                            ? `Sign a message with your ${walletName} to securely connect with Clones Desktop.`
                            : 'Connect your wallet to authenticate and get started with Clones Desktop.'}
                    </p>
                </RevealUp>

                <RevealUp>
                    <div className="ultra-premium-glass-card rounded-2xl p-8 max-w-md mx-auto">
                        {renderStateContent()}
                    </div>
                </RevealUp>

                <RevealUp>
                    <div className="mt-12 text-center space-y-4">
                        <p className="text-text-secondary text-sm">Don't have an EVM wallet?</p>
                        <div className="flex flex-wrap justify-center gap-3">
                            <a href="https://metamask.io/download" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 ultra-premium-glass-card border border-primary-500/30 rounded-full text-text-secondary hover:text-text-primary hover:border-primary-500/60 transition-all duration-200 text-sm hover:shadow-ultra-premium-hover">
                                MetaMask
                            </a>
                            <a href="https://coinbase.com/wallet" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 ultra-premium-glass-card border border-blue-500/30 rounded-full text-text-secondary hover:text-text-primary hover:border-blue-500/60 transition-all duration-200 text-sm hover:shadow-ultra-premium-hover">
                                Coinbase Wallet
                            </a>
                            <a href="https://rabby.io/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 ultra-premium-glass-card border border-pink-500/30 rounded-full text-text-secondary hover:text-text-primary hover:border-pink-500/60 transition-all duration-200 text-sm hover:shadow-ultra-premium-hover">
                                Rabby
                            </a>
                        </div>
                    </div>
                </RevealUp>
            </div>
        </section>
    );
}
