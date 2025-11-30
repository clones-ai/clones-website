import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Wallet, Shield, Zap, CheckCircle, AlertTriangle } from 'lucide-react';
import { useConnectModal } from '@rainbow-me/rainbowkit';

import { useWalletAuth, useWalletName, useWalletReady } from '../features/wallet/hooks';
import { RevealUp } from '../components/motion/Reveal';
import { AnimatedButton } from '../components/motion/AnimatedButton';
import { SimpleSpline } from '../components/shared/SimpleSpline';

type PageState = 'idle' | 'connecting' | 'success' | 'error';

/**
 * Wallet connection page for authenticating with Clones Desktop.
 * 
 * Flow:
 * 1. Check for token in URL params
 * 2. Auto-open connect modal if wallet not connected
 * 3. Once connected and ready, auto-authenticate
 * 4. On success, redirect to appropriate page
 */
export default function ConnectPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const { openConnectModal } = useConnectModal();
    const { isReady, isConnected, isReconnecting, isLoading } = useWalletReady();
    const { authenticateWallet, sendAuthToBackend, resetRateLimiting } = useWalletAuth();
    const walletName = useWalletName();

    const [pageState, setPageState] = useState<PageState>('idle');
    const [error, setError] = useState<string | null>(null);

    // Refs to prevent duplicate calls and circular dependencies
    const hasAttemptedAuth = useRef(false);
    const currentToken = useRef<string>('');
    const isAuthInProgress = useRef(false);

    // URL params
    const token = searchParams.get('token') || '';
    const fromPage = searchParams.get('from');
    const sessionId = searchParams.get('sessionId');

    // Reset auth attempt latch when token changes
    useEffect(() => {
        if (token !== currentToken.current) {
            currentToken.current = token;
            hasAttemptedAuth.current = false;
            isAuthInProgress.current = false;
            setPageState('idle');
            setError(null);
        }
    }, [token]);

    /**
     * Perform wallet authentication and backend registration.
     * Uses ref-based guard to prevent circular dependency with pageState.
     */
    const performAuth = useCallback(async () => {
        // Guard using ref to avoid circular dependency with pageState
        if (isAuthInProgress.current) {
            return;
        }

        isAuthInProgress.current = true;
        
        try {
            setPageState('connecting');
            setError(null);

            const authData = await authenticateWallet();
            await sendAuthToBackend(authData, token);

            setPageState('success');
            isAuthInProgress.current = false;

            // Redirect after success
            setTimeout(() => {
                if (fromPage === 'transaction' && sessionId) {
                    navigate(`/wallet/transaction?sessionId=${sessionId}`);
                } else {
                    navigate('/');
                }
            }, 2000);
        } catch (err) {
            console.error('Authentication failed:', err);
            const message = err instanceof Error ? err.message : 'Unknown error occurred';
            setError(message);
            setPageState('error');
            isAuthInProgress.current = false;
            hasAttemptedAuth.current = false; // Allow retry
        }
    }, [authenticateWallet, sendAuthToBackend, token, navigate, fromPage, sessionId]);

    // Auto-open connect modal if not connected
    useEffect(() => {
        if (token && !isConnected && !isReconnecting && openConnectModal) {
            console.log('[ConnectPage] Auto-opening connect modal');
            openConnectModal();
        }
    }, [token, isConnected, isReconnecting, openConnectModal]);

    // Auto-authenticate when wallet becomes ready
    useEffect(() => {
        if (
            token &&
            isReady &&
            !hasAttemptedAuth.current &&
            pageState !== 'success' &&
            pageState !== 'connecting'
        ) {
            console.log('[ConnectPage] Starting auto-authentication');
            hasAttemptedAuth.current = true;
            void performAuth();
        }
    }, [token, isReady, pageState, performAuth]);

    /**
     * Handle manual retry from error state.
     */
    const handleRetry = useCallback(() => {
        setError(null);
        setPageState('idle');
        resetRateLimiting();
        hasAttemptedAuth.current = false;
        isAuthInProgress.current = false;

        if (isConnected && isReady) {
            void performAuth();
        } else {
            openConnectModal?.();
        }
    }, [isConnected, isReady, performAuth, openConnectModal, resetRateLimiting]);

    /**
     * Render content based on current state.
     */
    const renderStateContent = () => {
        // No token provided
        if (!token) {
            return (
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center">
                        <Shield className="w-8 h-8 text-red-400" />
                    </div>
                    <h3 className="text-xl font-medium text-text-primary mb-2 font-system">
                        Authentication Required
                    </h3>
                    <p className="text-text-secondary">
                        No connection token provided. Please initiate connection from the Clones Desktop app.
                    </p>
                </div>
            );
        }

        // Success state
        if (pageState === 'success') {
            return (
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-8 h-8 text-green-400" />
                    </div>
                    <h3 className="text-xl font-medium text-text-primary mb-2 font-system">
                        Authentication Successful
                    </h3>
                    <p className="text-text-secondary">
                        You can go back to the Clones Desktop app now.
                    </p>
                </div>
            );
        }

        // Error state
        if (pageState === 'error' && error) {
            return (
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center">
                        <AlertTriangle className="w-8 h-8 text-red-400" />
                    </div>
                    <h3 className="text-xl font-medium text-text-primary mb-2 font-system">
                        Authentication Failed
                    </h3>
                    <p className="text-text-secondary text-sm mb-6">{error}</p>
                    <AnimatedButton
                        onClick={handleRetry}
                        variant="secondary"
                        size="lg"
                    >
                        Try Again
                    </AnimatedButton>
                </div>
            );
        }

        // Connected state - show sign button
        if (isConnected) {
            const isWorking = pageState === 'connecting' || isLoading;
            const statusColor = isReady ? 'border-green-500/30' : 'border-yellow-500/30';
            const dotColor = isReady ? 'bg-green-400' : 'bg-yellow-400';
            const dotAnimation = isReady ? 'animate-pulse' : 'animate-spin';

            const getStatusText = () => {
                if (isReconnecting) return 'Reconnecting Wallet...';
                if (isLoading) return 'Preparing Wallet...';
                if (isReady) return `${walletName} Connected`;
                return 'Initializing...';
            };

            const getButtonText = () => {
                if (isReconnecting) return 'Reconnecting...';
                if (pageState === 'connecting') return 'Check Wallet...';
                return 'Sign & Authenticate';
            };

            return (
                <div className="space-y-6 text-center">
                    <div className={`inline-flex items-center justify-center gap-3 px-6 py-3 ultra-premium-glass-card border rounded-full ${statusColor}`}>
                        <div className={`w-2 h-2 rounded-full ${dotColor} ${dotAnimation}`} />
                        <span className="text-text-primary font-medium font-system">
                            {getStatusText()}
                        </span>
                    </div>

                    {isReconnecting && (
                        <p className="text-text-secondary text-sm">
                            Please wait while we establish a connection with your wallet...
                        </p>
                    )}

                    <AnimatedButton
                        onClick={performAuth}
                        disabled={!isReady || isWorking}
                        variant="primary"
                        icon={Shield}
                        loading={isWorking}
                        className="w-full font-system"
                        size="lg"
                    >
                        {getButtonText()}
                    </AnimatedButton>
                </div>
            );
        }

        // Disconnected state - show connect button
        return (
            <div className="space-y-6 text-center">
                <div className="inline-flex items-center justify-center gap-3 px-6 py-3 ultra-premium-glass-card border border-text-muted/30 rounded-full">
                    <Zap className="w-5 h-5 text-text-muted" />
                    <span className="text-text-muted font-medium font-system">
                        Wallet Not Connected
                    </span>
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
            {/* Background */}
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
                        background: 'radial-gradient(circle at center, transparent 0%, rgba(12, 5, 21, 0.8) 70%, rgba(12, 5, 21, 1) 100%)',
                    }}
                />
            </div>

            {/* Content */}
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
                            <a
                                href="https://metamask.io/download"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 ultra-premium-glass-card border border-primary-500/30 rounded-full text-text-secondary hover:text-text-primary hover:border-primary-500/60 transition-all duration-200 text-sm hover:shadow-ultra-premium-hover"
                            >
                                MetaMask
                            </a>
                            <a
                                href="https://coinbase.com/wallet"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 ultra-premium-glass-card border border-blue-500/30 rounded-full text-text-secondary hover:text-text-primary hover:border-blue-500/60 transition-all duration-200 text-sm hover:shadow-ultra-premium-hover"
                            >
                                Coinbase Wallet
                            </a>
                            <a
                                href="https://rabby.io/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 ultra-premium-glass-card border border-pink-500/30 rounded-full text-text-secondary hover:text-text-primary hover:border-pink-500/60 transition-all duration-200 text-sm hover:shadow-ultra-premium-hover"
                            >
                                Rabby
                            </a>
                        </div>
                    </div>
                </RevealUp>
            </div>
        </section>
    );
}
