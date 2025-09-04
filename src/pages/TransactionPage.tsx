import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Wallet, Shield, Zap, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { useWalletAuth } from '../features/wallet';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useSimulateContract, useReadContract } from 'wagmi';
import { parseEther, type Abi } from 'viem';

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
  const { connected } = useWalletAuth();

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

  const { writeContract, data: writeData, isPending: isWritePending, error: writeError } = useWriteContract();

  // Hook for approval write
  const { writeContract: writeApproval, data: approvalData, isPending: isApprovalPending } = useWriteContract();

  // Wait for approval confirmation
  const { isSuccess: isApprovalConfirmed, isLoading: isApprovalConfirming } = useWaitForTransactionReceipt({
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
      await fetch(`${import.meta.env.VITE_API_URL}/api/v1/transaction/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: sessionData.sessionId,
          status,
          txHash,
          error
        })
      });
    } catch (err) {
      console.error('Failed to update session status:', err);
    }
  }, [sessionData]);


  // Load transaction session from URL, then prepare transaction for simulation
  useEffect(() => {
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      setUserError({ title: 'Missing Session ID', message: 'Transaction session ID is missing from URL.', code: 'E_NO_SESSION', category: 'unknown' });
      setLoading(false);
      return;
    }

    // 1. Fetch session details from backend
    const fetchSessionAndPrepareTx = async () => {
      setLoading(true);
      setUserError(null);

      try {
        const sessionResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/transaction/session?sessionId=${sessionId}`);
        const sessionJson = await sessionResponse.json();

        if (!sessionResponse.ok) {
          throw new Error(sessionJson.message || 'Failed to load transaction session');
        }

        const session: TransactionSession = sessionJson.data;

        if (session.isExpired) {
          setUserError({ title: 'Session Expired', message: 'Transaction session has expired. Please try again from the desktop app.', code: 'E_SESSION_EXPIRED', category: 'unknown' });
          setLoading(false);
          return;
        }

        setSessionData(session);

        // 2. Get contract call data from backend
        const prepareResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/transaction/prepare-tx`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: session.transactionType,
            sessionToken: session.sessionToken,
            creator: session.transactionParams.creator,
            token: session.transactionParams.token,
            amount: session.transactionParams.amount,
            poolAddress: session.transactionParams.poolAddress,
          }),
        });
        const prepareData = await prepareResponse.json();
        if (!prepareResponse.ok) {
          throw new Error(prepareData.message || 'Transaction preparation failed');
        }

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
  }, [searchParams]);

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

  // Check if approval is needed for fund operations
  useEffect(() => {
    if ((sessionData?.transactionType === 'fundPool' || sessionData?.transactionType === 'createAndFundFactory') && !isAllowanceLoading && allowance !== undefined && sessionData.transactionParams.amount) {
      const requiredAmount = parseEther(sessionData.transactionParams.amount);
      const currentAllowance = allowance as bigint;
      const needsApprovalValue = currentAllowance < requiredAmount;

      // Debug logging
      console.log('Allowance Debug:', {
        token: sessionData.transactionParams.token,
        spender: preparedTx?.contractAddress,
        currentAllowance: currentAllowance.toString(),
        requiredAmount: requiredAmount.toString(),
        needsApproval: needsApprovalValue,
        owner: address
      });

      setNeedsApproval(needsApprovalValue);
      setAllowanceChecked(true);
    } else {
      console.log('Skipping allowance check:', {
        transactionType: sessionData?.transactionType,
        allowanceLoaded: allowance !== undefined,
        isAllowanceLoading,
        hasAmount: !!sessionData?.transactionParams.amount
      });

      // Only mark as checked if we're not loading allowance
      if (!isAllowanceLoading || (sessionData?.transactionType !== 'fundPool' && sessionData?.transactionType !== 'createAndFundFactory')) {
        setNeedsApproval(false);
        setAllowanceChecked(true);
      }
    }
  }, [allowance, sessionData, preparedTx?.contractAddress, address, isAllowanceLoading]);

  // 4. Centralized error handling from all wagmi hooks
  useEffect(() => {
    const errorSource = simulationError || writeError || receiptError;

    // Don't show simulation errors during approval process
    if (errorSource && !(isApprovalPending || isApprovalConfirming || needsApproval)) {
      const allAbis = [RewardPoolFactoryAbi, RewardPoolImplementationAbi, ClaimRouterAbi];
      const decodedError = toUserError(errorSource, { abis: allAbis as Abi[] });
      setUserError(decodedError);
      setLoading(false);

      // Update backend about the failure
      if (txHash || !simulationError) { // Avoid reporting simulation errors before a tx is even sent
        updateSessionStatus('failed', txHash ?? undefined, decodedError.message);
      }
    }
  }, [simulationError, writeError, receiptError, updateSessionStatus, txHash, isApprovalPending, isApprovalConfirming, needsApproval]);

  // Estimate gas for the transaction
  const estimateGas = useCallback(async () => {
    if (!sessionData) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/transaction/estimate-gas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: sessionData.transactionType,
          creator: sessionData.transactionParams.creator,
          token: sessionData.transactionParams.token,
          amount: sessionData.transactionParams.amount,
          poolAddress: sessionData.transactionParams.poolAddress,
        })
      });

      const data = await response.json();

      if (response.ok) {
        const totalCost = parseFloat(data.data.totalCost);
        setGasEstimate({
          ...data.data,
          isExpensive: totalCost > 0.001 // Flag if > 0.001 ETH
        });
      }
    } catch (err) {
      console.warn('Gas estimation failed:', err);
    }
  }, [sessionData]);

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

  // Handle approval success - refresh allowance
  useEffect(() => {
    if (isApprovalConfirmed) {
      setIsApproving(false);
      setAllowanceChecked(false); // Reset to trigger a new allowance check and simulation
      // Force refetch the allowance immediately
      refetchAllowance();
      console.log('Approval transaction confirmed - refetching allowance');
    }
  }, [isApprovalConfirmed, refetchAllowance]);

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
            <p className="text-[#94A3B8]">Please connect your wallet to proceed with the transaction</p>
            <button
              onClick={() => navigate('/connect')}
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-full transition-all duration-200"
            >
              Connect Wallet
              <ArrowRight className="w-4 h-4" />
            </button>
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
                <Wallet className="w-8 h-8 text-[#8B5CF6]" />
              </div>
            </div>

            <h1 className="text-3xl font-light text-[#F8FAFC] mb-4 tracking-wide">
              {getTransactionTitle()}
            </h1>
            <p className="text-[#94A3B8] text-lg font-light leading-relaxed">
              {getTransactionDescription()}
            </p>
          </div>

          {/* Transaction Card */}
          <div className="bg-[#1A1A1A]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-[0_0_40px_rgba(139,92,246,0.1)]">
            {userError ? (
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-xl font-medium text-[#F8FAFC] mb-2">{userError.title}</h3>
                <p className="text-[#94A3B8] text-sm mb-6">{userError.message}</p>
                <p className="text-[#94A3B8] text-sm">Please return to the desktop app to continue.</p>
              </div>
            ) : (isApprovalPending || isApprovalConfirming) ? (
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-yellow-500/10 border border-yellow-500/20 rounded-full flex items-center justify-center">
                  <Shield className="w-8 h-8 text-yellow-400" />
                </div>
                <h3 className="text-xl font-medium text-[#F8FAFC] mb-2">
                  {isApprovalPending ? 'Approve in Wallet' : 'Confirming Approval'}
                </h3>
                <p className="text-[#94A3B8] mb-6">
                  {isApprovalPending
                    ? 'Please approve the token spending in your wallet to continue'
                    : 'Waiting for approval confirmation on the blockchain'
                  }
                </p>
                <div className="relative w-8 h-8 mx-auto animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
              </div>
            ) : isConfirmed ? (
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-xl font-medium text-[#F8FAFC] mb-2">Transaction Confirmed</h3>
                <p className="text-[#94A3B8] mb-6">Your transaction has been successfully confirmed on the blockchain</p>
                {txHash && (
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
                    </a>
                  </div>
                )}
                <p className="text-[#94A3B8] text-sm">Please return to the desktop app to continue.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Transaction Details */}
                {(loading || isSimulating) ? (
                  <div className="text-center p-8">
                    <div className="relative w-8 h-8 mx-auto animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                    <p className="text-[#94A3B8] mt-4">Preparing transaction...</p>
                  </div>
                ) : sessionData && validated && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-[#F8FAFC]">Transaction Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-[#1A1A1A]/60 border border-white/10 rounded-lg">
                        <p className="text-sm text-[#94A3B8] mb-1">Type</p>
                        <p className="text-[#F8FAFC] capitalize">{sessionData.transactionType.replace(/([A-Z])/g, ' $1').toLowerCase()}</p>
                      </div>
                      {sessionData.transactionParams.token && (
                        <div className="p-4 bg-[#1A1A1A]/60 border border-white/10 rounded-lg">
                          <p className="text-sm text-[#94A3B8] mb-1">Token</p>
                          <p className="text-[#F8FAFC]">{sessionData.transactionParams.token}</p>
                        </div>
                      )}
                      {sessionData.transactionParams.amount && (
                        <div className="p-4 bg-[#1A1A1A]/60 border border-white/10 rounded-lg">
                          <p className="text-sm text-[#94A3B8] mb-1">Amount</p>
                          <p className="text-[#F8FAFC]">{sessionData.transactionParams.amount} {sessionData.transactionParams.token}</p>
                        </div>
                      )}
                      <div className="p-4 bg-[#1A1A1A]/60 border border-white/10 rounded-lg">
                        <p className="text-sm text-[#94A3B8] mb-1">Your Address</p>
                        <p className="text-[#F8FAFC] font-mono text-sm">{address?.slice(0, 6)}...{address?.slice(-4)}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Gas Estimate */}
                {gasEstimate && !loading && !isSimulating && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-[#F8FAFC]">Gas Estimate</h3>
                    <div className={`p-4 border rounded-lg ${gasEstimate.isExpensive
                      ? 'bg-yellow-500/10 border-yellow-500/30'
                      : 'bg-[#1A1A1A]/60 border-white/10'
                      }`}>
                      <div className="flex items-center gap-3 mb-3">
                        {gasEstimate.isExpensive && <AlertCircle className="w-5 h-5 text-yellow-400" />}
                        <span className="text-[#F8FAFC] font-medium">
                          Estimated Cost: {parseFloat(gasEstimate.totalCost).toFixed(8)} ETH
                        </span>
                      </div>
                      {gasEstimate.isExpensive && (
                        <p className="text-yellow-400 text-sm">
                          ⚠️ High gas cost detected. Consider waiting for lower network congestion.
                        </p>
                      )}
                      <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-white/10">
                        <div>
                          <p className="text-xs text-[#94A3B8]">Gas Price</p>
                          <p className="text-sm text-[#F8FAFC]">{parseFloat(gasEstimate.gasPrice).toFixed(4)} Gwei</p>
                        </div>
                        <div>
                          <p className="text-xs text-[#94A3B8]">Gas Limit</p>
                          <p className="text-sm text-[#F8FAFC]">{parseInt(gasEstimate.gasLimit).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={async () => {
                      try {
                        await updateSessionStatus('cancelled');
                      } catch (error) {
                        console.warn('Failed to update session status on cancel:', error);
                      } finally {
                        navigate('/');
                      }
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-3 px-6 py-4 bg-[#1A1A1A] border border-white/20 hover:border-white/30 text-[#F8FAFC] rounded-full transition-all duration-300"
                  >
                    Cancel
                  </button>

                  {needsApproval ? (
                    <button
                      onClick={executeApproval}
                      disabled={isApproving || isApprovalPending || isApprovalConfirming}
                      className="flex-1 group relative inline-flex items-center justify-center gap-3 px-6 py-4 bg-[#1A1A1A] border border-[#F59E0B]/30 hover:border-[#F59E0B]/60 text-[#F8FAFC] rounded-full transition-all duration-300 hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#F59E0B]/10 to-[#EAB308]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                      {isApprovalPending ? (
                        <>
                          <div className="relative w-5 h-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                          <span className="relative font-medium">Signing...</span>
                        </>
                      ) : isApprovalConfirming ? (
                        <>
                          <div className="relative w-5 h-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                          <span className="relative font-medium">Confirming...</span>
                        </>
                      ) : (
                        <>
                          <Shield className="relative w-5 h-5" />
                          <span className="relative font-medium">Approve Token</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={executeTransaction}
                      disabled={loading || !validated || isSimulating || !simulationRequest?.request || isWritePending || isConfirming || needsApproval}
                      className="flex-1 group relative inline-flex items-center justify-center gap-3 px-6 py-4 bg-[#1A1A1A] border border-[#8B5CF6]/30 hover:border-[#8B5CF6]/60 text-[#F8FAFC] rounded-full transition-all duration-300 hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#8B5CF6]/10 to-[#3B82F6]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                      {isSimulating ? (
                        <>
                          <div className="relative w-5 h-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                          <span className="relative font-medium">Simulating...</span>
                        </>
                      ) : isWritePending || isConfirming ? (
                        <>
                          <div className="relative w-5 h-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                          <span className="relative font-medium">
                            {isConfirming ? 'Confirming...' : 'Executing...'}
                          </span>
                        </>
                      ) : (
                        <>
                          <Zap className="relative w-5 h-5" />
                          <span className="relative font-medium">Execute Transaction</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}