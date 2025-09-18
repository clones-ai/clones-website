import { Shield, Zap } from 'lucide-react';
import { AnimatedButton } from '../../components/motion/AnimatedButton';

interface TransactionActionsProps {
  needsApproval: boolean;
  isApprovalPending: boolean;
  isApprovalConfirming: boolean;
  isSimulating: boolean;
  isWritePending: boolean;
  isConfirming: boolean;
  canExecute: boolean;
  onCancel: () => void;
  onExecuteApproval: () => void;
  onExecuteTransaction: () => void;
}

export function TransactionActions({
  needsApproval,
  isApprovalPending,
  isApprovalConfirming,
  isSimulating,
  isWritePending,
  isConfirming,
  canExecute,
  onCancel,
  onExecuteApproval,
  onExecuteTransaction
}: TransactionActionsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
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
  );
}