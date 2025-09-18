import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { RevealUp } from '../components/motion/Reveal';

import { AuthenticationView } from './components/AuthenticationView';
import { TransactionHeader } from './components/TransactionHeader';
import { ErrorView } from './components/ErrorView';
import { ApprovalView } from './components/ApprovalView';
import { SuccessView } from './components/SuccessView';
import { TransactionContent } from './components/TransactionContent';
import { useTransactionProcessor } from '../hooks/useTransactionProcessor';

const BASESCAN_BASE_URL = import.meta.env.VITE_BASESCAN_BASE_URL || 'https://basescan.org';

export default function TransactionPage() {
  const navigate = useNavigate();
  const { address } = useAccount();
  const [searchParams] = useSearchParams();

  const {
    userError,
    sessionData,
    gasEstimate,
    needsApproval,
    isConfirmed,
    txHash,
    isSimulating,
    isApprovalPending,
    isApprovalConfirming,
    isWritePending,
    isConfirming,
    canExecute,
    executeApproval,
    executeTransaction,
    updateSessionStatus,
    retryFromError,
    isAutoAuthenticating,
    isAuthenticated
  } = useTransactionProcessor();

  const { isConnected } = useAccount();
  const hasValidAuth = isAuthenticated || (isConnected && address);

  if (isAutoAuthenticating || !hasValidAuth) {
    return (
      <AuthenticationView
        isAutoAuthenticating={isAutoAuthenticating}
        isAuthenticated={isAuthenticated}
        onNavigate={navigate}
        sessionId={searchParams.get('sessionId') || undefined}
      />
    );
  }

  return (
    <section className="min-h-screen flex flex-col justify-center py-24 px-4 sm:px-6 relative overflow-hidden">
      <div className="max-w-4xl mx-auto">
        <TransactionHeader
          transactionType={sessionData?.transactionType}
          token={sessionData?.transactionParams.token}
          amount={sessionData?.transactionParams.amount}
          poolAddress={sessionData?.transactionParams.poolAddress}
        />
        <RevealUp distance={6}>
          <div className="ultra-premium-glass-card rounded-2xl p-8">
            {userError ? (
              <ErrorView error={userError} onRetry={retryFromError} />
            ) : isApprovalPending || isApprovalConfirming ? (
              <ApprovalView
                isApprovalPending={isApprovalPending}
                isApprovalConfirming={isApprovalConfirming}
              />
            ) : isConfirmed ? (
              <SuccessView
                txHash={txHash || undefined}
                basescanBaseUrl={BASESCAN_BASE_URL}
              />
            ) : (
              <TransactionContent
                isSimulating={isSimulating}
                sessionData={sessionData}
                validated={!!sessionData} // Simplified validation
                gasEstimate={gasEstimate}
                address={address}
                needsApproval={needsApproval}
                isApprovalPending={isApprovalPending}
                isApprovalConfirming={isApprovalConfirming}
                isWritePending={isWritePending}
                isConfirming={isConfirming}
                onCancel={async () => {
                  try {
                    await updateSessionStatus('cancelled');
                  } finally {
                    navigate('/');
                  }
                }}
                onExecuteApproval={executeApproval}
                onExecuteTransaction={executeTransaction}
                canExecute={canExecute}
              />
            )}
          </div>
        </RevealUp>
      </div>
    </section>
  );
}
