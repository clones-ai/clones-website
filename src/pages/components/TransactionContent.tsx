import { Shield, Zap, AlertCircle } from 'lucide-react';
import { AnimatedButton } from '../../components/motion/AnimatedButton';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { RevealUp } from '../../components/motion/Reveal';

interface TransactionSession {
  sessionId: string;
  transactionType: 'createFactory' | 'fundPool' | 'claimRewards' | 'createAndFundPool' | 'withdrawPool';
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

interface TransactionContentProps {
  isSimulating: boolean;
  sessionData: TransactionSession | null;
  validated: boolean;
  gasEstimate: GasEstimate | null;
  address?: `0x${string}`;
  needsApproval: boolean;
  isApprovalPending: boolean;
  isApprovalConfirming: boolean;
  isWritePending: boolean;
  isConfirming: boolean;
  onCancel: () => void;
  onExecuteApproval: () => void;
  onExecuteTransaction: () => void;
  canExecute: boolean;
}

export function TransactionContent({
  isSimulating,
  sessionData,
  validated,
  gasEstimate,
  address,
  needsApproval,
  isApprovalPending,
  isApprovalConfirming,
  isWritePending,
  isConfirming,
  onCancel,
  onExecuteApproval,
  onExecuteTransaction,
  canExecute
}: TransactionContentProps) {
  const isLoading = !sessionData || !validated;

  return (
    <div className="space-y-8">
      {/* Transaction Details */}
      {isLoading ? (
        <RevealUp>
          <div className="text-center p-12">
            <LoadingSpinner />
            <p className="text-text-muted mt-6 text-lg font-system">Preparing transaction...</p>
          </div>
        </RevealUp>
      ) : sessionData && validated && (
        <RevealUp>
          <div className="space-y-8">
            <h3 className="text-2xl font-light text-text-primary font-system tracking-wide">Transaction Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 ultra-premium-glass-card rounded-xl border border-primary-500/20">
                <p className="text-sm text-text-muted mb-3 font-system uppercase tracking-wider">Type</p>
                <p className="text-text-primary font-medium font-system text-lg capitalize">{sessionData.transactionType.replace(/([A-Z])/g, ' $1').toLowerCase()}</p>
              </div>
              {sessionData.transactionParams.token && (
                <div className="p-6 ultra-premium-glass-card rounded-xl border border-primary-500/20">
                  <p className="text-sm text-text-muted mb-3 font-system uppercase tracking-wider">Token</p>
                  <p className="text-text-primary font-medium font-system text-lg">{sessionData.transactionParams.token}</p>
                </div>
              )}
              {sessionData.transactionParams.amount && (
                <div className="p-6 ultra-premium-glass-card rounded-xl border border-primary-500/20">
                  <p className="text-sm text-text-muted mb-3 font-system uppercase tracking-wider">Amount</p>
                  <p className="text-text-primary font-medium font-system text-lg">{sessionData.transactionParams.amount} {sessionData.transactionParams.token}</p>
                </div>
              )}
              <div className="p-6 ultra-premium-glass-card rounded-xl border border-primary-500/20">
                <p className="text-sm text-text-muted mb-3 font-system uppercase tracking-wider">Your Address</p>
                <p className="text-text-primary font-mono text-base">{address?.slice(0, 6)}...{address?.slice(-4)}</p>
              </div>
            </div>
          </div>
        </RevealUp>
      )}

      {/* Gas Estimate */}
      {gasEstimate && !isLoading && (
        <RevealUp>
          <div className="space-y-6">
            <h3 className="text-2xl font-light text-text-primary font-system tracking-wide">Gas Estimate</h3>
            <div className={`p-8 ultra-premium-glass-card rounded-xl border ${gasEstimate.isExpensive
              ? 'border-yellow-500/40 bg-yellow-500/5'
              : 'border-green-500/20 bg-green-500/5'
              }`}>
              <div className="flex items-center gap-4 mb-6">
                {gasEstimate.isExpensive && <AlertCircle className="w-6 h-6 text-yellow-400" />}
                <span className="text-text-primary font-medium font-system text-xl">
                  Estimated Cost: {parseFloat(gasEstimate.totalCost).toFixed(8)} ETH
                </span>
              </div>
              {gasEstimate.isExpensive && (
                <p className="text-yellow-400 text-base mb-6 leading-relaxed">
                  High gas cost detected. Consider waiting for lower network congestion.
                </p>
              )}
              <div className="grid grid-cols-2 gap-6 pt-6 border-t border-text-secondary/20">
                <div>
                  <p className="text-sm text-text-muted mb-2 font-system uppercase tracking-wider">Gas Price</p>
                  <p className="text-base text-text-primary font-system">{parseFloat(gasEstimate.gasPrice).toFixed(4)} Gwei</p>
                </div>
                <div>
                  <p className="text-sm text-text-muted mb-2 font-system uppercase tracking-wider">Gas Limit</p>
                  <p className="text-base text-text-primary font-system">{parseInt(gasEstimate.gasLimit).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </RevealUp>
      )}

      {/* Actions */}
      <RevealUp>
        <div className="flex flex-col sm:flex-row gap-6 pt-4">
          <AnimatedButton
            onClick={onCancel}
            variant="secondary"
            size="lg"
            className="flex-1 font-system"
          >
            Cancel
          </AnimatedButton>

          {needsApproval ? (
            <AnimatedButton
              onClick={onExecuteApproval}
              disabled={isApprovalPending || isApprovalConfirming}
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
              onClick={onExecuteTransaction}
              disabled={!canExecute}
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
      </RevealUp>
    </div>
  );
}