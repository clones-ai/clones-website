import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Wallet, Shield, Zap, ArrowRight, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import { useAuth } from '../features/auth';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useSimulateContract, useReadContract } from 'wagmi';
import { parseEther, type Abi } from 'viem';
import { RevealUp } from '../components/motion/Reveal';
import { AnimatedButton } from '../components/motion/AnimatedButton';

import { toUserError, type UserFacingError } from '../features/wallet/evmErrorDecoder';
import RewardPoolFactoryAbi from '../contracts/abis/RewardPoolFactory.json';
import RewardPoolImplementationAbi from '../contracts/abis/RewardPoolImplementation.json';
import ClaimRouterAbi from '../contracts/abis/ClaimRouter.json';

const BASESCAN_BASE_URL = import.meta.env.VITE_BASESCAN_BASE_URL || 'https://basescan.org';

interface TransactionSession {
  sessionId: string;
  transactionType: 'createFactory' | 'fundPool' | 'claimRewards' | 'createAndFundFactory' | 'withdrawPool';
  transactionParams: {
    type: string;
    creator?: string;
    token?: string;
    tokenAddress?: string;
    amount?: string;
    poolAddress?: string;
  };
  sessionToken: string;
  expiresAt: string;
  isExpired: boolean;
  timeRemaining: number;
}

interface GasEstimate {
  gasPrice: string;
  gasLimit: string;
  totalCost: string;
  isExpensive: boolean;
}

interface PreparedTransaction {
  contractAddress: `0x${string}`;
  functionName: string;
  args: unknown[];
  value?: string;
  abi: Abi;
}

export default function TransactionPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { address } = useAccount();
  const { isConnected } = useAccount();
  const { isAuthenticated, authManager } = useAuth();

  const [loading, setLoading] = useState(true);
  const [userError, setUserError] = useState<UserFacingError | null>(null);
  const [sessionData, setSessionData] = useState<TransactionSession | null>(null);
  const [preparedTx, setPreparedTx] = useState<PreparedTransaction | null>(null);
  const [gasEstimate, setGasEstimate] = useState<GasEstimate | null>(null);
  const [validated, setValidated] = useState(false);
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const [needsApproval, setNeedsApproval] = useState(false);
  const [allowanceChecked, setAllowanceChecked] = useState(false); // Track if allowance check is done
  const [isApproving, setIsApproving] = useState(false);
  const [isAutoAuthenticating, setIsAutoAuthenticating] = useState(false); // Track auto-authentication

  const { writeContract, data: writeData, isPending: isWritePending, error: writeError } = useWriteContract();

  // Hook for approval write
  const { writeContract: writeApproval, data: approvalData, isPending: isApprovalPending } = useWriteContract();

  const {
    isSuccess: isApprovalConfirmed,
    isLoading: isApprovalConfirming,
    isError: isApprovalError,
    error: approvalReceiptError
  } = useWaitForTransactionReceipt({
    hash: approvalData,
  });

  // Check token allowance for fund operations
  const { data: allowance, isLoading: isAllowanceLoading, refetch: refetchAllowance } = useReadContract({
    address: sessionData?.transactionParams?.tokenAddress as `0x${string}` | undefined,
    abi: [
      {
        name: 'allowance',
        type: 'function',
        stateMutability: 'view',
        inputs: [
          { name: 'owner', type: 'address' },
          { name: 'spender', type: 'address' }
        ],
        outputs: [{ name: '', type: 'uint256' }]
      }
    ],
    functionName: 'allowance',
    args: address && preparedTx?.contractAddress ? [address, preparedTx.contractAddress] : undefined,
    query: {
      enabled: !!((sessionData?.transactionType === 'fundPool' || sessionData?.transactionType === 'createAndFundFactory') && address && preparedTx?.contractAddress && sessionData.transactionParams.tokenAddress),
    },
  });

  // Debug allowance hook conditions
  useEffect(() => {
    console.log('Allowance Hook Debug:', {
      transactionType: sessionData?.transactionType,
      hasAddress: !!address,
      hasContractAddress: !!preparedTx?.contractAddress,
      hasToken: !!sessionData?.transactionParams?.token,
      token: sessionData?.transactionParams?.token,
      tokenAddress: sessionData?.transactionParams?.tokenAddress,
      tokenAsAddress: sessionData?.transactionParams?.tokenAddress as `0x${string}`,
      contractAddress: preparedTx?.contractAddress,
      userAddress: address,
      enabled: !!(sessionData?.transactionType === 'fundPool' && address && preparedTx?.contractAddress && sessionData.transactionParams.tokenAddress),
      allowance: allowance?.toString(),
      isAllowanceLoading,
      // Check if token address looks like an address
      tokenLooksLikeAddress: sessionData?.transactionParams?.tokenAddress?.startsWith('0x')
    });
  }, [sessionData, address, preparedTx, allowance, isAllowanceLoading]);

  const {
    data: receipt,
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: receiptError
  } = useWaitForTransactionReceipt({
    hash: writeData,
  });

  // Update session status on backend
  const updateSessionStatus = useCallback(async (
    status: 'completed' | 'failed' | 'cancelled',
    txHash?: string,
    error?: string
  ) => {
    if (!sessionData) return;

    try {
      const response = await authManager.secureCall('/api/v1/transaction/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionData.sessionId,
          status,
          txHash,
          error
        })
      });

      if (!response.ok) {
        throw new Error('Failed to complete transaction');
      }
    } catch (err) {
      console.error('Failed to update session status:', err);
    }
  }, [sessionData, authManager]);


  // Auto-authenticate with sessionId if present and not authenticated
  useEffect(() => {
    const sessionId = searchParams.get('sessionId');

    if (sessionId && !isAuthenticated && !isAutoAuthenticating) {
      const autoAuth = async () => {
        console.log('🔐 Auto-authenticating with sessionId:', sessionId);
        setIsAutoAuthenticating(true);
        try {
          const response = await fetch('/api/v1/wallet/establish-session-from-transaction', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Requested-With': 'XMLHttpRequest'
            },
            credentials: 'include', // Important for cookies/sessions
            body: JSON.stringify({ sessionId })
          });
          const data = await response.json();
          if (data.success) {
            console.log('✅ Auto-authentication successful:', data.data);
            // Force auth manager to refresh state and wait for it
            // Only call initialize if not already authenticated
            if (!authManager.getState().isAuthenticated) {
              await authManager.initialize();
            } else {
              console.log('🔄 AuthManager already authenticated, skipping initialize()');
            }
          } else {
            console.error('❌ Auto-authentication failed:', data.error);
          }
        } catch (error) {
          console.error('❌ Auto-authentication error:', error);
        } finally {
          setIsAutoAuthenticating(false);
        }
      };
      autoAuth();
    }
  }, [searchParams, authManager, isAutoAuthenticating, isAuthenticated]);

  // Load transaction session from URL, then prepare transaction for simulation
  useEffect(() => {
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      setUserError({ title: 'Missing Session ID', message: 'Transaction session ID is missing from URL.', code: 'E_NO_SESSION', category: 'unknown' });
      setLoading(false);
      return;
    }

    if (!isAuthenticated) {
      // Still waiting for authentication to complete
      setLoading(true);
      return;
    }

    // 1. Fetch session details from backend
    const fetchSessionAndPrepareTx = async () => {
      setLoading(true);
      setUserError(null);

      try {
        const { secureGet } = await import('../utils/secureApi');
        const sessionJson = await secureGet(`/api/v1/transaction/session?sessionId=${sessionId}`);

        const session: TransactionSession = (sessionJson as { data: TransactionSession }).data;

        if (session.isExpired) {
          setUserError({ title: 'Session Expired', message: 'Transaction session has expired. Please try again from the desktop app.', code: 'E_SESSION_EXPIRED', category: 'unknown' });
          setLoading(false);
          return;
        }

        setSessionData(session);

        // 2. Get contract call data from backend
        const response = await authManager.secureCall('/api/v1/transaction/prepare-tx', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: session.transactionType,
            sessionToken: session.sessionToken,
            creator: session.transactionParams.creator,
            token: session.transactionParams.token,
            amount: session.transactionParams.amount,
            poolAddress: session.transactionParams.poolAddress,
          })
        });

        if (!response.ok) {
          throw new Error('Failed to prepare transaction');
        }

        const prepareData = await response.json();
        setPreparedTx(prepareData.data);
        setValidated(true);

      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load transaction session';
        setUserError({ title: 'Initialization Failed', message, code: 'E_INIT_FAILED', category: 'unknown' });
      } finally {
        // setLoading(false) is handled by the simulation hook
      }
    };

    fetchSessionAndPrepareTx();
  }, [searchParams, authManager, isAuthenticated]);

  // 3. Simulate the transaction to catch errors before sending
  const {
    data: simulationRequest,
    error: simulationError,
    isLoading: isSimulating,
    isSuccess: isSimulationSuccess,
  } = useSimulateContract(preparedTx ? {
    address: preparedTx.contractAddress,
    abi: preparedTx.abi,
    functionName: preparedTx.functionName,
    args: preparedTx.args,
    ...(preparedTx.value ? { value: parseEther(preparedTx.value) } : {}),
    query: {
      enabled: allowanceChecked && !needsApproval && !isApprovalPending && !isApprovalConfirming, // Don't simulate during approval process
    },
  } : {
    query: {
      enabled: false,
    },
  });

  useEffect(() => {
    if (!isSimulating && (simulationError || isSimulationSuccess || preparedTx)) {
      setLoading(false);
    }
  }, [isSimulating, simulationError, isSimulationSuccess, preparedTx]);

  useEffect(() => {
    const requiresApprovalCheck = sessionData?.transactionType === 'fundPool' || sessionData?.transactionType === 'createAndFundFactory';

    if (!requiresApprovalCheck) {
      setNeedsApproval(false);
      setAllowanceChecked(true);
      return;
    }

    if (isAllowanceLoading || allowance === undefined || !sessionData.transactionParams.amount) {
      // Still loading or missing data
      return;
    }

    try {
      const requiredAmount = parseEther(sessionData.transactionParams.amount);
      const currentAllowance = allowance as bigint;
      const needsApprovalValue = currentAllowance < requiredAmount;


      setNeedsApproval(needsApprovalValue);
      setAllowanceChecked(true);
    } catch (error) {
      console.error('Error checking allowance:', error);
      setUserError({
        title: 'Allowance Check Failed',
        message: 'Failed to check token allowance. Please try again.',
        code: 'E_ALLOWANCE_CHECK',
        category: 'contract'
      });
    }
  }, [allowance, sessionData, preparedTx?.contractAddress, address, isAllowanceLoading]);

  useEffect(() => {
    const errorSource = simulationError || writeError || receiptError || (isApprovalError && approvalReceiptError);

    if (errorSource && !(isApprovalPending || isApprovalConfirming)) {
      const allAbis = [RewardPoolFactoryAbi, RewardPoolImplementationAbi, ClaimRouterAbi];
      const decodedError = toUserError(errorSource, { abis: allAbis as Abi[] });
      if (isApprovalError) {
        decodedError.title = 'Token Approval Failed';
        decodedError.message = `Token approval was rejected: ${decodedError.message}`;
      }
      setUserError(decodedError);
      setLoading(false);

      // Update backend about the failure
      if (txHash || approvalData || !simulationError) {
        updateSessionStatus('failed', txHash || approvalData || undefined, decodedError.message);
      }
    }
  }, [simulationError, writeError, receiptError, isApprovalError, approvalReceiptError, updateSessionStatus, txHash, approvalData, isApprovalPending, isApprovalConfirming]);

  // Estimate gas for the transaction
  const estimateGas = useCallback(async () => {
    if (!sessionData) return;

    try {
      const response = await authManager.secureCall('/api/v1/transaction/estimate-gas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: sessionData.transactionType,
          creator: sessionData.transactionParams.creator,
          token: sessionData.transactionParams.token,
          amount: sessionData.transactionParams.amount,
          poolAddress: sessionData.transactionParams.poolAddress,
        })
      });

      if (!response.ok) {
        throw new Error('Failed to estimate gas');
      }

      const gasData = await response.json();
      const totalCost = parseFloat(gasData.data.totalCost);
      setGasEstimate({
        ...gasData.data,
        isExpensive: totalCost > 0.001 // Flag if > 0.001 ETH
      });
    } catch (err) {
      console.warn('Gas estimation failed:', err);
    }
  }, [sessionData, authManager]);

  // Execute token approval
  const executeApproval = useCallback(async () => {
    if (!sessionData?.transactionParams?.tokenAddress || !preparedTx?.contractAddress) {
      console.warn('executeApproval called without required data.');
      return;
    }

    setIsApproving(true);
    writeApproval({
      address: sessionData.transactionParams.tokenAddress as `0x${string}`,
      abi: [
        {
          name: 'approve',
          type: 'function',
          stateMutability: 'nonpayable',
          inputs: [
            { name: 'spender', type: 'address' },
            { name: 'amount', type: 'uint256' }
          ],
          outputs: [{ name: '', type: 'bool' }]
        }
      ],
      functionName: 'approve',
      args: [preparedTx.contractAddress, parseEther(sessionData.transactionParams.amount || '0')], // Approve exact amount needed
    });
  }, [sessionData, preparedTx, writeApproval]);

  // Execute the transaction
  const executeTransaction = useCallback(async () => {
    if (!simulationRequest?.request) {
      console.warn('executeTransaction called before simulation is ready.');
      return;
    }
    writeContract(simulationRequest.request);
  }, [simulationRequest, writeContract]);

  useEffect(() => {
    if (isApprovalConfirmed) {
      setIsApproving(false);

      const recheckAllowance = async () => {
        try {
          // Poll for allowance update with exponential backoff
          for (let i = 0; i < 6; i++) { // Poll for ~32 seconds
            const { data: newAllowance } = await refetchAllowance();
            if (newAllowance !== undefined && sessionData?.transactionParams.amount) {
              const requiredAmount = parseEther(sessionData.transactionParams.amount);
              if ((newAllowance as bigint) >= requiredAmount) {
                // Allowance is sufficient, wagmi's state is updated,
                // the other useEffect will handle setting needsApproval.
                return;
              }
            }
            // Wait before next poll
            await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, i)));
          }
          throw new Error('Allowance did not update in time.');
        } catch (error) {
          console.error('Failed to recheck allowance after approval:', error);
          setUserError({
            title: 'Approval Verification Failed',
            message: 'Could not verify token approval. The network may be congested. Please refresh and try again.',
            code: 'E_APPROVAL_VERIFICATION',
            category: 'contract'
          });
        }
      };

      recheckAllowance();
    }
  }, [isApprovalConfirmed, refetchAllowance, sessionData]);

  // Handle transaction submission success
  useEffect(() => {
    if (writeData) {
      setTxHash(writeData);
      // still loading until confirmed
    }
  }, [writeData]);

  // Handle transaction confirmation or final failure
  useEffect(() => {
    if (sessionData && txHash && isConfirmed && receipt) {
      if (receipt.status === 'success') {
        // Success
        updateSessionStatus('completed', txHash);
        setLoading(false);
      } else if (receipt.status === 'reverted') {
        // Transaction reverted - need to parse the revert reason
        const allAbis = [RewardPoolFactoryAbi, RewardPoolImplementationAbi, ClaimRouterAbi];

        // Try to decode the revert reason from receipt
        let decodedError;
        try {
          // Create a synthetic error object that toUserError can parse
          const syntheticError: Error & { cause?: { data?: string; code?: number; details?: string } } = {
            name: 'ContractExecutionError',
            message: 'Transaction reverted',
            cause: {
              data: receipt.logs?.[0]?.data || '0x',
              details: 'Transaction reverted'
            }
          };
          decodedError = toUserError(syntheticError, { abis: allAbis as Abi[] });
        } catch {
          // Fallback to generic error
          decodedError = {
            title: 'Transaction Failed',
            message: 'Transaction was reverted by the smart contract',
            code: 'E_TX_REVERTED',
            category: 'contract' as const
          };
        }

        setUserError(decodedError);
        setLoading(false);
        updateSessionStatus('failed', txHash, decodedError.message);
      }
    }
  }, [isConfirmed, receipt, txHash, sessionData, updateSessionStatus]);

  // Start gas estimation when session is loaded
  useEffect(() => {
    if (sessionData && validated) {
      estimateGas();
    }
  }, [sessionData, validated, estimateGas]);

  const getTransactionTitle = () => {
    switch (sessionData?.transactionType) {
      case 'createFactory':
        return 'Create Factory';
      case 'createAndFundFactory':
        return 'Create & Fund Factory';
      case 'fundPool':
        return 'Fund Factory';
      case 'withdrawPool':
        return 'Withdraw from Factory';
      case 'claimRewards':
        return 'Claim Rewards';
      default:
        return 'Execute Transaction';
    }
  };

  const getTransactionDescription = () => {
    const params = sessionData?.transactionParams;
    switch (sessionData?.transactionType) {
      case 'createFactory':
        return `Create a new factory for ${params?.token || 'token'}`;
      case 'createAndFundFactory':
        return `Create factory for ${params?.token || 'token'} and fund with ${params?.amount || ''} ${params?.token || ''}`;
      case 'fundPool':
        return `Fund factory with ${params?.amount || ''} ${params?.token || ''}`;
      case 'withdrawPool':
        return `Withdraw ${params?.amount || ''} ${params?.token || ''} from factory`;
      case 'claimRewards':
        return `Claim pending rewards from pool ${params?.poolAddress?.slice(0, 6)}...${params?.poolAddress?.slice(-4)}`;
      default:
        return 'Execute blockchain transaction';
    }
  };

  // Check session auth first, fallback to wallet connection
  const hasValidAuth = isAuthenticated || (isConnected && address);

  // Show loading during auto-authentication
  if (isAutoAuthenticating) {
    return (
      <div className="min-h-screen flex flex-col justify-center py-24 px-4 sm:px-6 relative overflow-hidden">
        <div className="max-w-2xl mx-auto text-center">
          <RevealUp distance={8}>
            <div className="w-16 h-16 mx-auto mb-6 ultra-premium-glass-card rounded-full flex items-center justify-center border border-primary-500/40">
              <Shield className="w-8 h-8 text-primary-400" />
            </div>
            <h2 className="text-2xl font-light text-text-primary mb-4 font-system">
              Authenticating...
            </h2>
            <p className="text-text-secondary leading-relaxed mb-8">
              Setting up your secure session for the transaction
            </p>
            <div className="relative w-8 h-8 mx-auto animate-spin rounded-full border-2 border-primary-500/30 border-t-primary-500"></div>
          </RevealUp>
        </div>
      </div>
    );
  }

  if (!hasValidAuth) {
    const sessionId = searchParams.get('sessionId');
    const redirectUrl = sessionId ? `/connect?from=transaction&sessionId=${sessionId}` : '/connect';

    return (
      <div className="min-h-screen flex flex-col justify-center py-24 px-4 sm:px-6 relative overflow-hidden">
        <div className="max-w-2xl mx-auto text-center">
          <RevealUp distance={8}>
            <div className="w-16 h-16 mx-auto mb-6 ultra-premium-glass-card rounded-full flex items-center justify-center border border-red-500/40">
              <Shield className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-2xl font-light text-text-primary mb-4 font-system">
              {isAuthenticated ? 'Wallet Connection Required' : 'Authentication Required'}
            </h2>
            <p className="text-text-secondary leading-relaxed mb-8">
              {isAuthenticated
                ? 'Please connect your wallet to sign the transaction'
                : 'Please authenticate to proceed with the transaction'
              }
            </p>
            <AnimatedButton
              onClick={() => navigate(redirectUrl)}
              variant="primary"
              icon={ArrowRight}
              className="font-system"
            >
              {isAuthenticated ? 'Connect Wallet' : 'Authenticate'}
            </AnimatedButton>
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
              <Wallet className="w-10 h-10 text-primary-500" />
            </div>
            <h1 className="text-4xl md:text-5xl font-light text-text-primary mb-6 tracking-wide font-system">
              {getTransactionTitle()}
            </h1>
            <p className="text-text-secondary text-lg leading-relaxed max-w-2xl mx-auto">
              {getTransactionDescription()}
            </p>
          </div>
        </RevealUp>

        {/* Transaction Card */}
        <RevealUp distance={6}>
          <div className="ultra-premium-glass-card rounded-2xl p-8">
            {userError ? (
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 ultra-premium-glass-card rounded-full flex items-center justify-center border border-red-500/40">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-2xl font-light text-text-primary mb-4 font-system">{userError.title}</h3>
                <p className="text-text-secondary text-base mb-8 leading-relaxed">{userError.message}</p>
                <p className="text-text-secondary leading-relaxed">Please return to the desktop app to continue.</p>
              </div>
            ) : (isApprovalPending || isApprovalConfirming) ? (
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 ultra-premium-glass-card rounded-full flex items-center justify-center border border-yellow-500/40">
                  <Shield className="w-8 h-8 text-yellow-400" />
                </div>
                <h3 className="text-2xl font-light text-text-primary mb-4 font-system">
                  {isApprovalPending ? 'Approve in Wallet' : 'Confirming Approval'}
                </h3>
                <p className="text-text-secondary mb-8 leading-relaxed">
                  {isApprovalPending
                    ? 'Please approve the token spending in your wallet to continue'
                    : 'Waiting for approval confirmation on the blockchain'
                  }
                </p>
                <div className="relative w-8 h-8 mx-auto animate-spin rounded-full border-2 border-primary-500/30 border-t-primary-500"></div>
              </div>
            ) : isConfirmed ? (
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 ultra-premium-glass-card rounded-full flex items-center justify-center border border-green-500/40">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-2xl font-light text-text-primary mb-4 font-system">Transaction Confirmed!</h3>
                <p className="text-text-secondary mb-8 leading-relaxed">Your transaction has been successfully confirmed on the blockchain</p>
                {txHash && (
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
                )}
                <p className="text-text-secondary leading-relaxed">Please return to the desktop app to continue.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Transaction Details */}
                {(loading || isSimulating) ? (
                  <div className="text-center p-8">
                    <div className="relative w-8 h-8 mx-auto animate-spin rounded-full border-2 border-primary-500/30 border-t-primary-500"></div>
                    <p className="text-text-secondary mt-4 font-system">Preparing transaction...</p>
                  </div>
                ) : sessionData && validated && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-light text-text-primary font-system">Transaction Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 ultra-premium-glass-card rounded-lg">
                        <p className="text-sm text-text-secondary mb-2 font-system">Type</p>
                        <p className="text-text-primary font-medium font-system capitalize">{sessionData.transactionType.replace(/([A-Z])/g, ' $1').toLowerCase()}</p>
                      </div>
                      {sessionData.transactionParams.token && (
                        <div className="p-4 ultra-premium-glass-card rounded-lg">
                          <p className="text-sm text-text-secondary mb-2 font-system">Token</p>
                          <p className="text-text-primary font-medium font-system">{sessionData.transactionParams.token}</p>
                        </div>
                      )}
                      {sessionData.transactionParams.amount && (
                        <div className="p-4 ultra-premium-glass-card rounded-lg">
                          <p className="text-sm text-text-secondary mb-2 font-system">Amount</p>
                          <p className="text-text-primary font-medium font-system">{sessionData.transactionParams.amount} {sessionData.transactionParams.token}</p>
                        </div>
                      )}
                      <div className="p-4 ultra-premium-glass-card rounded-lg">
                        <p className="text-sm text-text-secondary mb-2 font-system">Your Address</p>
                        <p className="text-text-primary font-mono text-sm">{address?.slice(0, 6)}...{address?.slice(-4)}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Gas Estimate */}
                {gasEstimate && !loading && !isSimulating && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-light text-text-primary font-system">Gas Estimate</h3>
                    <div className={`p-6 ultra-premium-glass-card rounded-xl ${gasEstimate.isExpensive
                      ? 'border border-yellow-500/30'
                      : ''
                      }`}>
                      <div className="flex items-center gap-3 mb-4">
                        {gasEstimate.isExpensive && <AlertCircle className="w-5 h-5 text-yellow-400" />}
                        <span className="text-text-primary font-medium font-system">
                          Estimated Cost: {parseFloat(gasEstimate.totalCost).toFixed(8)} ETH
                        </span>
                      </div>
                      {gasEstimate.isExpensive && (
                        <p className="text-yellow-400 text-sm mb-4 leading-relaxed">
                          High gas cost detected. Consider waiting for lower network congestion.
                        </p>
                      )}
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-text-secondary/10">
                        <div>
                          <p className="text-xs text-text-secondary mb-1 font-system">Gas Price</p>
                          <p className="text-sm text-text-primary font-system">{parseFloat(gasEstimate.gasPrice).toFixed(4)} Gwei</p>
                        </div>
                        <div>
                          <p className="text-xs text-text-secondary mb-1 font-system">Gas Limit</p>
                          <p className="text-sm text-text-primary font-system">{parseInt(gasEstimate.gasLimit).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <AnimatedButton
                    onClick={async () => {
                      try {
                        await updateSessionStatus('cancelled');
                      } catch (error) {
                        console.warn('Failed to update session status on cancel:', error);
                      } finally {
                        navigate('/');
                      }
                    }}
                    variant="secondary"
                    size="lg"
                    className="flex-1 font-system"
                  >
                    Cancel
                  </AnimatedButton>

                  {needsApproval ? (
                    <AnimatedButton
                      onClick={executeApproval}
                      disabled={isApproving || isApprovalPending || isApprovalConfirming}
                      variant="primary"
                      size="lg"
                      loading={isApprovalPending || isApprovalConfirming}
                      icon={Shield}
                      className="flex-1 font-system"
                    >
                      {isApprovalPending ? 'Signing...' : isApprovalConfirming ? 'Confirming...' : 'Approve Token'}
                    </AnimatedButton>
                  ) : (
                    <AnimatedButton
                      onClick={executeTransaction}
                      disabled={loading || !validated || isSimulating || !simulationRequest?.request || isWritePending || isConfirming || needsApproval}
                      variant="primary"
                      size="lg"
                      loading={isSimulating || isWritePending || isConfirming}
                      icon={Zap}
                      className="flex-1 font-system"
                    >
                      {isSimulating ? 'Simulating...' : (isWritePending || isConfirming) ? (isConfirming ? 'Confirming...' : 'Executing...') : 'Execute Transaction'}
                    </AnimatedButton>
                  )}
                </div>
              </div>
            )}
          </div>
        </RevealUp>
      </div>
    </section>
  );
}