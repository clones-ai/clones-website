import { useParams } from 'react-router-dom';
import { DownloadButtons } from '.';
import { Gift } from 'lucide-react';

export function ReferralPage() {
    const { referralCode } = useParams<{ referralCode?: string }>();

    return (
        <div className="min-h-screen bg-black relative overflow-hidden">
            {/* Background gradient & elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A1A] via-[#0F0F0F] to-[#1A1A1A] pointer-events-none"></div>
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#8B5CF6]/5 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#3B82F6]/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div className="relative z-10 flex min-h-screen flex-col items-center justify-start pt-32 px-4">
                <div className="w-full max-w-md">

                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6">
                            <div className="absolute inset-0 bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] rounded-full blur-lg opacity-30 animate-pulse"></div>
                            <div className="relative flex items-center justify-center w-16 h-16 bg-[#1A1A1A]/80 backdrop-blur-xl border border-white/10 rounded-full">
                                <Gift className="w-8 h-8 text-[#8B5CF6]" />
                            </div>
                        </div>

                        {referralCode ? (
                            <>
                                <h1 className="text-3xl font-light text-[#F8FAFC] mb-4 tracking-wide">You've been invited! 👋</h1>
                                <p className="text-[#94A3B8] text-lg font-light leading-relaxed">
                                    Referral code <span className="font-mono text-purple-400">{referralCode}</span> will be applied when you connect your wallet.
                                </p>
                            </>
                        ) : (
                            <>
                                <h1 className="text-3xl font-light text-[#F8FAFC] mb-4 tracking-wide">Download the App</h1>
                                <p className="text-[#94A3B8] text-lg font-light leading-relaxed">
                                    Get the latest version of our application for your OS.
                                </p>
                            </>
                        )}
                    </div>

                    {/* Download Card */}
                    <div className="bg-[#1A1A1A]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-[0_0_40px_rgba(139,92,246,0.1)]">
                        <DownloadButtons referralCode={referralCode} />
                        <div className="mt-8 text-center">
                            <a
                                href={referralCode ? `/connect?ref=${referralCode}` : '/connect'}
                                className="text-sm text-[#94A3B8] hover:text-white transition-colors"
                            >
                                Already have the app? Connect your wallet
                            </a>
                        </div>
                    </div>

                    <footer className="mt-12 text-center text-sm text-gray-500">
                        <p>If you have any questions, please check our <a href="https://clones.gitbook.io/clones.docs" target="_blank" rel="noopener noreferrer" className="text-purple-400">docs</a></p>

                    </footer>
                </div>
            </div>
        </div>
    );
}
