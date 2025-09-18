import { AlertTriangle, RotateCw } from 'lucide-react';
import { useSwitchChain } from 'wagmi';
import type { UserFacingError } from '../../features/wallet/evmErrorDecoder';
import { AnimatedButton } from '../../components/motion/AnimatedButton';
import { RevealUp } from '../../components/motion/Reveal';

interface ErrorViewProps {
  error: UserFacingError;
  onRetry: () => void;
}

export function ErrorView({ error, onRetry }: ErrorViewProps) {
  const { switchChain, isPending: isSwitching } = useSwitchChain({
    mutation: {
      onSuccess: () => {
        // After successful switch, trigger the retry logic from the parent
        onRetry();
      },
    }
  });

  const expectedChainId = error.context?.expectedChainId as number | undefined;
  const isWrongChainError = error.code === 'E_WRONG_CHAIN' && expectedChainId;
  const isUserRejection = error.code === 'E_USER_REJECTED';

  const handleRetry = () => {
    if (isWrongChainError && expectedChainId) {
      switchChain({ chainId: expectedChainId });
    } else {
      onRetry();
    }
  };

  return (
    <RevealUp>
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-6 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>
        <h3 className="text-2xl font-light text-text-primary mb-2 font-system">{error.title}</h3>
        <p className="text-text-secondary max-w-sm mx-auto mb-8">{error.message}</p>

        {(isUserRejection || isWrongChainError) && (
          <AnimatedButton
            onClick={handleRetry}
            variant="secondary"
            size="lg"
            icon={RotateCw}
            loading={isSwitching}
          >
            {isWrongChainError ? (isSwitching ? 'Check Wallet...' : 'Switch Network') : 'Try Again'}
          </AnimatedButton>
        )}
      </div>
    </RevealUp>
  );
}