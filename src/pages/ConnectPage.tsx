import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Wallet, Shield, Zap } from 'lucide-react';
import { useWalletAuth } from '../features/wallet';
import { useWalletName } from '../features/wallet/useWalletName';
import { useConnectModal } from '@rainbow-me/rainbowkit';

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
        <div className="min-h-screen bg-black relative">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A1A] via-[#0F0F0F] to-[#1A1A1A] pointer-events-none"></div>

            {/* Animated background elements */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#8B5CF6]/5 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#3B82F6]/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div className="relative z-0 flex min-h-screen flex-col items-center justify-start pt-32 px-4">
                <div className="w-full max-w-md">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6">
                            <div className="absolute inset-0 bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] rounded-full blur-lg opacity-30 animate-pulse"></div>
                            <div className="relative flex items-center justify-center w-16 h-16 bg-[#1A1A1A]/80 backdrop-blur-xl border border-white/10 rounded-full">
                                <Wallet className="w-8 h-8 text-[#8B5CF6]" />
                            </div>
                        </div>

                        <h1 className="text-3xl font-light text-[#F8FAFC] mb-4 tracking-wide">
                            {connected ? 'Authenticate Wallet' : 'Connect Your Wallet'}
                        </h1>
                        <p className="text-[#94A3B8] text-lg font-light leading-relaxed">
                            {connected
                                ? `Sign a message with your ${walletName} to authenticate with Clones Desktop`
                                : 'Connect your Ethereum wallet (MetaMask, Coinbase Wallet, Rabby, etc.) to access Clones Desktop'}
                        </p>
                    </div>

                    {/* Connection Card */}
                    <div className="bg-[#1A1A1A]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-[0_0_40px_rgba(139,92,246,0.1)]">
                        {!token ? (
                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto mb-4 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center">
                                    <Shield className="w-8 h-8 text-red-400" />
                                </div>
                                <h3 className="text-xl font-medium text-[#F8FAFC] mb-2">Authentication Required</h3>
                                <p className="text-[#94A3B8]">No connection token provided</p>
                            </div>
                        ) : success ? (
                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto mb-4 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center">
                                    <Shield className="w-8 h-8 text-green-400" />
                                </div>
                                <h3 className="text-xl font-medium text-[#F8FAFC] mb-2">Authentication Successful</h3>
                                <p className="text-[#94A3B8] mb-6">Your wallet has been authenticated with Clones Desktop</p>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-center gap-3 px-6 py-3 bg-[#1A1A1A]/60 border border-green-500/30 rounded-full">
                                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                        <span className="text-[#F8FAFC] font-medium">Wallet Authenticated</span>
                                    </div>

                                    <button
                                        onClick={() => setSuccess(false)}
                                        className="group relative w-full inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#1A1A1A] border border-[#8B5CF6]/30 hover:border-[#8B5CF6]/60 text-[#F8FAFC] rounded-full transition-all duration-300 hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:-translate-y-0.5"
                                    >
                                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#8B5CF6]/10 to-[#3B82F6]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        <span className="relative font-medium">Authenticate Again</span>
                                    </button>
                                </div>
                            </div>
                        ) : error ? (
                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto mb-4 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center">
                                    <Shield className="w-8 h-8 text-red-400" />
                                </div>
                                <h3 className="text-xl font-medium text-[#F8FAFC] mb-2">Connection Failed</h3>
                                <p className="text-[#94A3B8] text-sm">{error}</p>
                            </div>
                        ) : (
                            <div className="text-center">
                                {connected ? (
                                    <div className="space-y-4">
                                        <div className={`flex items-center justify-center gap-3 px-6 py-3 bg-[#1A1A1A]/60 border rounded-full ${
                                            ready ? 'border-green-500/30' : 'border-yellow-500/30'
                                        }`}>
                                            <div className={`w-2 h-2 rounded-full ${
                                                ready ? 'bg-green-400 animate-pulse' : 'bg-yellow-400 animate-spin'
                                            }`}></div>
                                            <span className="text-[#F8FAFC] font-medium">
                                                {status === 'reconnecting' ? 'Reconnecting Wallet…' :
                                                 status === 'connecting' ? 'Preparing Wallet…' : 
                                                 status === 'ready' ? 'Wallet Connected' : 'Wallet Connected'}
                                            </span>
                                        </div>

                                        <button
                                            onClick={connectWallet}
                                            disabled={connecting || !ready}
                                            className="group relative w-full inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#1A1A1A] border border-[#8B5CF6]/30 hover:border-[#8B5CF6]/60 text-[#F8FAFC] rounded-full transition-all duration-300 hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#8B5CF6]/10 to-[#3B82F6]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                            {connecting || loading ? (
                                                <>
                                                    <div className="relative w-5 h-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                                                    <span className="relative font-medium">
                                                        {connecting ? 'Authenticating…' : 'Preparing Wallet…'}
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    <Shield className="relative w-5 h-5" />
                                                    <span className="relative font-medium">Sign Message & Authenticate</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-center gap-3 px-6 py-3 bg-[#1A1A1A]/60 border border-[#94A3B8]/30 rounded-full">
                                            <Zap className="w-5 h-5 text-[#94A3B8]" />
                                            <span className="text-[#94A3B8] font-medium">Wallet Not Connected</span>
                                        </div>

                                        <p className="text-[#94A3B8] text-sm">
                                            Please connect your wallet using the button in the top-right corner
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Help section */}
                        <div className="mt-8 text-center space-y-3">
                            <p className="text-[#94A3B8] text-sm">Don't have an EVM wallet?</p>
                            <div className="flex flex-wrap justify-center gap-3">
                                <a
                                    href="https://metamask.io/download"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#1A1A1A]/60 border border-[#8B5CF6]/30 rounded-full text-[#94A3B8] hover:text-[#F8FAFC] hover:border-[#8B5CF6]/60 transition-all duration-200 text-sm"
                                >
                                    <span>MetaMask</span>
                                </a>
                                <a
                                    href="https://coinbase.com/wallet"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#1A1A1A]/60 border border-[#3B82F6]/30 rounded-full text-[#94A3B8] hover:text-[#F8FAFC] hover:border-[#3B82F6]/60 transition-all duration-200 text-sm"
                                >
                                    <span>Coinbase Wallet</span>
                                </a>
                                <a
                                    href="https://rabby.io/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#1A1A1A]/60 border border-[#EC4899]/30 rounded-full text-[#94A3B8] hover:text-[#F8FAFC] hover:border-[#EC4899]/60 transition-all duration-200 text-sm"
                                >
                                    <span>Rabby</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
