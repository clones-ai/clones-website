import { useState, useEffect, useCallback } from 'react';
import { Droplets, Clock, Shield, AlertCircle, CheckCircle, Copy, ExternalLink } from 'lucide-react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseEther } from 'viem';
import { RevealUp } from '../../components/motion/Reveal';
import { AnimatedButton } from '../../components/motion/AnimatedButton';

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
  const { address, isConnected } = useAccount();

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
    if (!isConnected || !address || !faucetStatus?.canClaim) return;

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
  }, [isConnected, address, faucetStatus, writeContract]);

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

  if (!isConnected || !address) {
    return (
      <div className="min-h-screen flex flex-col justify-center py-24 px-4 sm:px-6 relative overflow-hidden">
        <div className="max-w-2xl mx-auto text-center">
          <RevealUp distance={8}>
            <div className="w-16 h-16 mx-auto mb-6 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-2xl font-light text-text-primary mb-4 font-system">Wallet Not Connected</h2>
            <p className="text-text-secondary leading-relaxed">Please connect your wallet to access the CLONES faucet</p>
          </RevealUp>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-screen flex flex-col justify-center py-24 px-4 sm:px-6 relative overflow-hidden">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <RevealUp distance={8}>
          <div className="text-center mb-16">
            <div className="w-20 h-20 mx-auto mb-6 ultra-premium-glass-card rounded-full flex items-center justify-center">
              <Droplets className="w-10 h-10 text-primary-500" />
            </div>
            <h1 className="text-4xl md:text-5xl font-light text-text-primary mb-6 tracking-wide font-system">
              CLONES Faucet
            </h1>
            <p className="text-text-secondary text-lg leading-relaxed max-w-2xl mx-auto">
              Get free CLONES tokens on Base Sepolia testnet for development and testing
            </p>
          </div>
        </RevealUp>

        {/* Faucet Card */}
        <RevealUp distance={6}>
          <div className="ultra-premium-glass-card rounded-2xl p-8">
            {success && txHash ? (
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 ultra-premium-glass-card rounded-full flex items-center justify-center border border-green-500/40">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-2xl font-light text-text-primary mb-4 font-system">Tokens Claimed Successfully!</h3>
                <p className="text-text-secondary mb-8 leading-relaxed">Your CLONES tokens have been transferred to your wallet</p>

                <div className="mb-8 p-6 ultra-premium-glass-card rounded-xl border border-green-500/30">
                  <p className="text-sm text-text-secondary mb-3 font-system">Transaction Hash:</p>
                  <p className="text-sm font-mono text-text-primary break-all mb-4">{txHash}</p>
                  <a
                    href={`${BASESCAN_BASE_URL}/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 ultra-premium-glass-card border border-primary-500/30 hover:border-primary-500/60 text-primary-400 rounded-full text-sm transition-all duration-200 hover:shadow-ultra-premium-hover"
                  >
                    View on BaseScan
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                <AnimatedButton
                  onClick={() => {
                    setSuccess(false);
                    setTxHash(null);
                    setError(null);
                  }}
                  variant="secondary"
                  className="font-system"
                >
                  Claim More Tokens
                </AnimatedButton>
              </div>
            ) : error ? (
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 ultra-premium-glass-card rounded-full flex items-center justify-center border border-red-500/40">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-2xl font-light text-text-primary mb-4 font-system">Claim Failed</h3>
                <p className="text-text-secondary text-base mb-8 leading-relaxed">{error}</p>
                <AnimatedButton
                  onClick={() => setError(null)}
                  variant="secondary"
                  className="font-system"
                >
                  Try Again
                </AnimatedButton>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Faucet Status */}
                {faucetStatus && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-light text-text-primary font-system">Faucet Status</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 ultra-premium-glass-card rounded-lg">
                        <p className="text-sm text-text-secondary mb-2 font-system">Claim Amount</p>
                        <p className="text-text-primary font-medium font-system">
                          {claimAmount ? (parseEther(claimAmount.toString()) / BigInt(10 ** 18)).toString() : '1000'} CLONES
                        </p>
                      </div>
                      <div className="p-4 ultra-premium-glass-card rounded-lg">
                        <p className="text-sm text-text-secondary mb-2 font-system">Daily Remaining</p>
                        <p className="text-text-primary font-medium font-system">
                          {dailyStatus ? (dailyStatus[1] / BigInt(10 ** 18)).toString() : '0'} CLONES
                        </p>
                      </div>
                      <div className="p-4 ultra-premium-glass-card rounded-lg md:col-span-2">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-text-secondary" />
                          <p className="text-sm text-text-secondary font-system">Next Claim</p>
                        </div>
                        <p className="text-text-primary font-medium font-system">
                          {formatTimeRemaining(faucetStatus.timeUntilNextClaim)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Claim Section */}
                <div className="space-y-6">
                  <h3 className="text-xl font-light text-text-primary font-system">Claim Tokens</h3>
                  <div className="p-4 ultra-premium-glass-card rounded-lg">
                    <p className="text-sm text-text-secondary mb-3 font-system">Your Address</p>
                    <p className="text-text-primary font-mono text-sm break-all">{address}</p>
                  </div>

                  <AnimatedButton
                    onClick={claimTokens}
                    disabled={loading || isWritePending || isConfirming || !faucetStatus?.canClaim}
                    variant="primary"
                    size="lg"
                    loading={loading || isWritePending || isConfirming}
                    icon={Droplets}
                    className="w-full font-system"
                  >
                    {loading || isWritePending || isConfirming
                      ? (isConfirming ? 'Confirming...' : 'Claiming...')
                      : (faucetStatus?.canClaim ? 'Claim CLONES Tokens' : 'Not Available')
                    }
                  </AnimatedButton>

                  {faucetStatus && !faucetStatus.canClaim && (
                    <p className="text-center text-sm text-text-secondary leading-relaxed">
                      {faucetStatus.timeUntilNextClaim > 0
                        ? `Please wait ${formatTimeRemaining(faucetStatus.timeUntilNextClaim)} before claiming again`
                        : 'Daily limit reached or faucet empty'
                      }
                    </p>
                  )}
                </div>

                {/* Contract Info */}
                <div className="space-y-6">
                  <h3 className="text-xl font-light text-text-primary font-system">Contract Information</h3>
                  <div className="p-6 ultra-premium-glass-card rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm text-text-secondary font-system">Faucet Contract</p>
                      <button
                        onClick={copyAddress}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs text-primary-400 hover:text-primary-300 transition-colors"
                      >
                        <Copy className="w-3 h-3" />
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <p className="text-text-primary font-mono text-sm break-all mb-4">{FAUCET_CONTRACT_ADDRESS}</p>
                    <a
                      href={`${BASESCAN_BASE_URL}/address/${FAUCET_CONTRACT_ADDRESS}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 ultra-premium-glass-card border border-primary-500/30 hover:border-primary-500/60 text-primary-400 rounded-full text-sm transition-all duration-200 hover:shadow-ultra-premium-hover"
                    >
                      View on BaseScan
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

        </RevealUp>

        {/* Info Section */}
        <RevealUp distance={4}>
          <div className="mt-12 text-center space-y-4">
            <p className="text-text-secondary">Need Base Sepolia ETH for gas?</p>
            <div className="flex flex-wrap justify-center gap-3">
              <a
                href="https://docs.base.org/base-chain/tools/network-faucets"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 ultra-premium-glass-card border border-primary-500/30 rounded-full text-text-secondary hover:text-text-primary hover:border-primary-500/60 transition-all duration-200 text-sm hover:shadow-ultra-premium-hover"
              >
                <span>Base Faucets</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </RevealUp>
      </div>
    </section>
  );
}