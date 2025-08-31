import { useState, useEffect, useCallback } from 'react';
import { Droplets, Clock, Shield, AlertCircle, CheckCircle, Copy, ExternalLink } from 'lucide-react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { useWalletAuth } from '../wallet';
import { parseEther } from 'viem';

const FAUCET_CONTRACT_ADDRESS = import.meta.env.VITE_FAUCET_CONTRACT_ADDRESS as `0x${string}`;
const BASESCAN_BASE_URL = import.meta.env.VITE_BASESCAN_BASE_URL || 'https://sepolia.basescan.org';

// Faucet ABI - only the functions we need
const FAUCET_ABI = [
  {
    name: 'claimTokens',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: []
  },
  {
    name: 'canClaim',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'claimer', type: 'address' }],
    outputs: [
      { name: 'canClaimTokens', type: 'bool' },
      { name: 'timeUntilNextClaim', type: 'uint256' }
    ]
  },
  {
    name: 'claimAmount',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'getDailyDistributionStatus',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      { name: 'currentDistribution', type: 'uint256' },
      { name: 'remainingDistribution', type: 'uint256' },
      { name: 'dayIdentifier', type: 'uint256' }
    ]
  }
] as const;

interface FaucetStatus {
  canClaim: boolean;
  timeUntilNextClaim: number;
  claimAmount: string;
  dailyRemaining: string;
}

export default function FaucetPage() {
  const { address } = useAccount();
  const { connected } = useWalletAuth();

  const [faucetStatus, setFaucetStatus] = useState<FaucetStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const [copied, setCopied] = useState(false);

  // Contract interactions
  const { writeContract, data: writeData, isPending: isWritePending, error: writeError } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: writeData,
  });

  // Read faucet data
  const { data: canClaimData } = useReadContract({
    address: FAUCET_CONTRACT_ADDRESS,
    abi: FAUCET_ABI,
    functionName: 'canClaim',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 30000, // Refetch every 30 seconds
    },
  });

  const { data: claimAmount } = useReadContract({
    address: FAUCET_CONTRACT_ADDRESS,
    abi: FAUCET_ABI,
    functionName: 'claimAmount',
    query: {
      refetchInterval: 60000, // Refetch every minute
    },
  });

  const { data: dailyStatus } = useReadContract({
    address: FAUCET_CONTRACT_ADDRESS,
    abi: FAUCET_ABI,
    functionName: 'getDailyDistributionStatus',
    query: {
      refetchInterval: 60000, // Refetch every minute
    },
  });

  // Update faucet status when data changes
  useEffect(() => {
    if (canClaimData && claimAmount && dailyStatus) {
      setFaucetStatus({
        canClaim: canClaimData[0],
        timeUntilNextClaim: Number(canClaimData[1]),
        claimAmount: parseEther(claimAmount.toString()).toString(),
        dailyRemaining: parseEther(dailyStatus[1].toString()).toString()
      });
    }
  }, [canClaimData, claimAmount, dailyStatus]);

  // Handle claim tokens
  const claimTokens = useCallback(async () => {
    if (!connected || !address || !faucetStatus?.canClaim) return;

    setLoading(true);
    setError(null);

    try {
      writeContract({
        address: FAUCET_CONTRACT_ADDRESS,
        abi: FAUCET_ABI,
        functionName: 'claimTokens',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to claim tokens');
      setLoading(false);
    }
  }, [connected, address, faucetStatus, writeContract]);

  // Handle transaction updates
  useEffect(() => {
    if (writeData) {
      setTxHash(writeData);
      setLoading(false);
    }
  }, [writeData]);

  useEffect(() => {
    if (isConfirmed) {
      setSuccess(true);
      setLoading(false);
    }
  }, [isConfirmed]);

  useEffect(() => {
    if (writeError) {
      setError(writeError.message || 'Transaction failed');
      setLoading(false);
    }
  }, [writeError]);

  // Copy address to clipboard
  const copyAddress = useCallback(async () => {
    if (FAUCET_CONTRACT_ADDRESS) {
      await navigator.clipboard.writeText(FAUCET_CONTRACT_ADDRESS);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, []);

  // Format time remaining
  const formatTimeRemaining = (seconds: number): string => {
    if (seconds <= 0) return 'Ready to claim';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    }
    return `${minutes}m remaining`;
  };

  if (!connected || !address) {
    return (
      <div className="min-h-screen bg-black relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A1A] via-[#0F0F0F] to-[#1A1A1A] pointer-events-none"></div>

        <div className="relative z-0 flex min-h-screen flex-col items-center justify-center px-4">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-xl font-medium text-[#F8FAFC] mb-2">Wallet Not Connected</h2>
            <p className="text-[#94A3B8]">Please connect your wallet to access the CLONES faucet</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A1A] via-[#0F0F0F] to-[#1A1A1A] pointer-events-none"></div>

      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#8B5CF6]/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#3B82F6]/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-0 flex min-h-screen flex-col items-center justify-start pt-20 px-4">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] rounded-full blur-lg opacity-30 animate-pulse"></div>
              <div className="relative flex items-center justify-center w-16 h-16 bg-[#1A1A1A]/80 backdrop-blur-xl border border-white/10 rounded-full">
                <Droplets className="w-8 h-8 text-[#8B5CF6]" />
              </div>
            </div>

            <h1 className="text-3xl font-light text-[#F8FAFC] mb-4 tracking-wide">
              CLONES Faucet
            </h1>
            <p className="text-[#94A3B8] text-lg font-light leading-relaxed">
              Get free CLONES tokens on Base Sepolia testnet for development and testing
            </p>
          </div>

          {/* Faucet Card */}
          <div className="bg-[#1A1A1A]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-[0_0_40px_rgba(139,92,246,0.1)]">
            {success && txHash ? (
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-xl font-medium text-[#F8FAFC] mb-2">Tokens Claimed Successfully!</h3>
                <p className="text-[#94A3B8] mb-6">Your CLONES tokens have been transferred to your wallet</p>

                <div className="mb-6 p-4 bg-[#1A1A1A]/60 border border-green-500/30 rounded-lg">
                  <p className="text-sm text-[#94A3B8] mb-2">Transaction Hash:</p>
                  <p className="text-sm font-mono text-[#F8FAFC] break-all">{txHash}</p>
                  <a
                    href={`${BASESCAN_BASE_URL}/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 hover:border-[#8B5CF6]/60 text-[#8B5CF6] rounded-full text-sm transition-all duration-200"
                  >
                    View on BaseScan
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                <button
                  onClick={() => {
                    setSuccess(false);
                    setTxHash(null);
                    setError(null);
                  }}
                  className="px-6 py-3 bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 hover:border-[#8B5CF6]/60 text-[#8B5CF6] rounded-full transition-all duration-200"
                >
                  Claim More Tokens
                </button>
              </div>
            ) : error ? (
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-xl font-medium text-[#F8FAFC] mb-2">Claim Failed</h3>
                <p className="text-[#94A3B8] text-sm mb-6">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="px-6 py-3 bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 hover:border-[#8B5CF6]/60 text-[#8B5CF6] rounded-full transition-all duration-200"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Faucet Status */}
                {faucetStatus && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-[#F8FAFC]">Faucet Status</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-[#1A1A1A]/60 border border-white/10 rounded-lg">
                        <p className="text-sm text-[#94A3B8] mb-1">Claim Amount</p>
                        <p className="text-[#F8FAFC] font-medium">
                          {claimAmount ? (parseEther(claimAmount.toString()) / BigInt(10 ** 18)).toString() : '1000'} CLONES
                        </p>
                      </div>
                      <div className="p-4 bg-[#1A1A1A]/60 border border-white/10 rounded-lg">
                        <p className="text-sm text-[#94A3B8] mb-1">Daily Remaining</p>
                        <p className="text-[#F8FAFC] font-medium">
                          {dailyStatus ? (dailyStatus[1] / BigInt(10 ** 18)).toString() : '0'} CLONES
                        </p>
                      </div>
                      <div className="p-4 bg-[#1A1A1A]/60 border border-white/10 rounded-lg md:col-span-2">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-[#94A3B8]" />
                          <p className="text-sm text-[#94A3B8]">Next Claim</p>
                        </div>
                        <p className="text-[#F8FAFC] font-medium">
                          {formatTimeRemaining(faucetStatus.timeUntilNextClaim)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Claim Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-[#F8FAFC]">Claim Tokens</h3>
                  <div className="p-4 bg-[#1A1A1A]/60 border border-white/10 rounded-lg">
                    <p className="text-sm text-[#94A3B8] mb-2">Your Address</p>
                    <p className="text-[#F8FAFC] font-mono text-sm break-all">{address}</p>
                  </div>

                  <button
                    onClick={claimTokens}
                    disabled={loading || isWritePending || isConfirming || !faucetStatus?.canClaim}
                    className="w-full group relative inline-flex items-center justify-center gap-3 px-6 py-4 bg-[#1A1A1A] border border-[#8B5CF6]/30 hover:border-[#8B5CF6]/60 text-[#F8FAFC] rounded-full transition-all duration-300 hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#8B5CF6]/10 to-[#3B82F6]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    {loading || isWritePending || isConfirming ? (
                      <>
                        <div className="relative w-5 h-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                        <span className="relative font-medium">
                          {isConfirming ? 'Confirming...' : 'Claiming...'}
                        </span>
                      </>
                    ) : (
                      <>
                        <Droplets className="relative w-5 h-5" />
                        <span className="relative font-medium">
                          {faucetStatus?.canClaim ? 'Claim CLONES Tokens' : 'Not Available'}
                        </span>
                      </>
                    )}
                  </button>

                  {faucetStatus && !faucetStatus.canClaim && (
                    <p className="text-center text-sm text-[#94A3B8]">
                      {faucetStatus.timeUntilNextClaim > 0
                        ? `Please wait ${formatTimeRemaining(faucetStatus.timeUntilNextClaim)} before claiming again`
                        : 'Daily limit reached or faucet empty'
                      }
                    </p>
                  )}
                </div>

                {/* Contract Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-[#F8FAFC]">Contract Information</h3>
                  <div className="p-4 bg-[#1A1A1A]/60 border border-white/10 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-[#94A3B8]">Faucet Contract</p>
                      <button
                        onClick={copyAddress}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs text-[#8B5CF6] hover:text-[#7C3AED] transition-colors"
                      >
                        <Copy className="w-3 h-3" />
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <p className="text-[#F8FAFC] font-mono text-sm break-all">{FAUCET_CONTRACT_ADDRESS}</p>
                    <a
                      href={`${BASESCAN_BASE_URL}/address/${FAUCET_CONTRACT_ADDRESS}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 hover:border-[#8B5CF6]/60 text-[#8B5CF6] rounded-full text-sm transition-all duration-200"
                    >
                      View on BaseScan
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="mt-8 text-center space-y-3">
            <p className="text-[#94A3B8] text-sm">Need Base Sepolia ETH for gas?</p>
            <div className="flex flex-wrap justify-center gap-3">
              <a
                href="https://docs.base.org/base-chain/tools/network-faucets"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#1A1A1A]/60 border border-[#8B5CF6]/30 rounded-full text-[#94A3B8] hover:text-[#F8FAFC] hover:border-[#8B5CF6]/60 transition-all duration-200 text-sm"
              >
                <span>Base Faucets</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}