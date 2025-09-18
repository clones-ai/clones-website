import { Shield } from 'lucide-react';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { RevealUp } from '../../components/motion/Reveal';

interface ApprovalViewProps {
  isApprovalPending: boolean;
  isApprovalConfirming: boolean;
}

export function ApprovalView({ isApprovalPending }: ApprovalViewProps) {
  return (
    <div className="text-center space-y-8">
      <RevealUp>
        <div className="w-20 h-20 mx-auto mb-8 ultra-premium-glass-card rounded-full flex items-center justify-center border border-yellow-500/40">
          <Shield className="w-10 h-10 text-yellow-400" />
        </div>
      </RevealUp>

      <RevealUp>
        <h3 className="text-3xl sm:text-4xl font-light text-text-primary mb-6 font-system tracking-wide">
          {isApprovalPending ? 'Approve in Wallet' : 'Confirming Approval'}
        </h3>
      </RevealUp>

      <RevealUp>
        <p className="text-lg text-text-muted mb-12 leading-relaxed max-w-xl mx-auto">
          {isApprovalPending
            ? 'Please approve the token spending in your wallet to continue'
            : 'Waiting for approval confirmation on the blockchain'
          }
        </p>
      </RevealUp>

      <RevealUp>
        <LoadingSpinner />
      </RevealUp>
    </div>
  );
}