import { CheckCircle, ExternalLink } from 'lucide-react';
import { RevealUp } from '../../components/motion/Reveal';

interface SuccessViewProps {
  txHash?: `0x${string}`;
  basescanBaseUrl: string;
}

export function SuccessView({ txHash, basescanBaseUrl }: SuccessViewProps) {
  return (
    <div className="text-center space-y-8">
      <RevealUp>
        <div className="w-20 h-20 mx-auto mb-8 ultra-premium-glass-card rounded-full flex items-center justify-center border border-green-500/40">
          <CheckCircle className="w-10 h-10 text-green-400" />
        </div>
      </RevealUp>

      <RevealUp>
        <h3 className="text-3xl sm:text-4xl font-light text-text-primary mb-6 font-system tracking-wide">Transaction Confirmed!</h3>
      </RevealUp>

      <RevealUp>
        <p className="text-lg text-text-muted mb-12 leading-relaxed max-w-xl mx-auto">Your transaction has been successfully confirmed on the blockchain</p>
      </RevealUp>

      {txHash && (
        <RevealUp>
          <div className="mb-12 p-8 ultra-premium-glass-card rounded-xl border border-green-500/30 bg-green-500/5">
            <p className="text-sm text-text-muted mb-4 font-system uppercase tracking-wider">Transaction Hash</p>
            <p className="text-base font-mono text-text-primary break-all mb-6 leading-relaxed">{txHash}</p>
            <a
              href={`${basescanBaseUrl}/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-6 py-3 ultra-premium-glass-card border border-primary-500/30 hover:border-primary-500/60 text-primary-400 rounded-full text-base transition-all duration-200 hover:shadow-ultra-premium-hover font-system"
            >
              View on BaseScan
              <ExternalLink className="w-5 h-5" />
            </a>
          </div>
        </RevealUp>
      )}

      <RevealUp>
        <p className="text-text-muted leading-relaxed text-lg">Please return to the desktop app to continue.</p>
      </RevealUp>
    </div>
  );
}