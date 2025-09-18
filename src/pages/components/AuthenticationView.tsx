import { Shield, ArrowRight } from 'lucide-react';
import { RevealUp } from '../../components/motion/Reveal';
import { AnimatedButton } from '../../components/motion/AnimatedButton';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { SimpleSpline } from '../../components/shared/SimpleSpline';

interface AuthenticationViewProps {
  isAutoAuthenticating: boolean;
  isAuthenticated: boolean;
  onNavigate: (path: string) => void;
  sessionId?: string;
}

export function AuthenticationView({
  isAutoAuthenticating,
  isAuthenticated,
  onNavigate,
  sessionId
}: AuthenticationViewProps) {
  if (isAutoAuthenticating) {
    return (
      <div className="min-h-screen flex flex-col justify-center relative py-12 px-4 sm:px-6 overflow-hidden">
        {/* Background Animation */}
        <div className="absolute inset-0 z-0">
          <SimpleSpline
            url="/data-transfer.splinecode"
            className="absolute inset-0"
            style={{
              opacity: '0.15',
              minHeight: '100vh',
              height: '100vh',
            }}
            loading="lazy"
          />
          <div
            className="absolute inset-0 pointer-events-none z-10"
            style={{
              background: 'radial-gradient(circle at center, transparent 0%, rgba(12, 5, 21, 0.8) 70%, rgba(12, 5, 21, 1) 100%)'
            }}
          />
        </div>

        <div className="relative max-w-2xl mx-auto text-center z-10">
          <RevealUp>
            <div className="w-20 h-20 mx-auto mb-8 ultra-premium-glass-card rounded-full flex items-center justify-center border border-primary-500/40">
              <Shield className="w-10 h-10 text-primary-400" />
            </div>
          </RevealUp>
          <RevealUp>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-light text-text-primary mb-6 font-system tracking-wide">
              Authenticating...
            </h2>
          </RevealUp>
          <RevealUp>
            <p className="text-lg text-text-muted leading-relaxed mb-12 max-w-xl mx-auto">
              Setting up your secure session for the transaction
            </p>
          </RevealUp>
          <RevealUp>
            <LoadingSpinner />
          </RevealUp>
        </div>
      </div>
    );
  }

  const redirectUrl = sessionId ? `/connect?from=transaction&sessionId=${sessionId}` : '/connect';

  return (
    <div className="min-h-screen flex flex-col justify-center relative py-12 px-4 sm:px-6 overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0 z-0">
        <SimpleSpline
          url="/data-transfer.splinecode"
          className="absolute inset-0"
          style={{
            opacity: '0.15',
            minHeight: '100vh',
            height: '100vh',
          }}
          loading="lazy"
        />
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: 'radial-gradient(circle at center, transparent 0%, rgba(12, 5, 21, 0.8) 70%, rgba(12, 5, 21, 1) 100%)'
          }}
        />
      </div>

      <div className="relative max-w-2xl mx-auto text-center z-10">
        <RevealUp>
          <div className="w-20 h-20 mx-auto mb-8 ultra-premium-glass-card rounded-full flex items-center justify-center border border-red-500/40">
            <Shield className="w-10 h-10 text-red-400" />
          </div>
        </RevealUp>
        <RevealUp>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light text-text-primary mb-6 font-system tracking-wide">
            {isAuthenticated ? 'Wallet Connection Required' : 'Authentication Required'}
          </h2>
        </RevealUp>
        <RevealUp>
          <p className="text-lg text-text-muted leading-relaxed mb-12 max-w-xl mx-auto">
            {isAuthenticated
              ? 'Please connect your wallet to sign the transaction'
              : 'Please authenticate to proceed with the transaction'
            }
          </p>
        </RevealUp>
        <RevealUp>
          <AnimatedButton
            onClick={() => onNavigate(redirectUrl)}
            variant="primary"
            icon={ArrowRight}
            className="font-system"
            size="lg"
          >
            {isAuthenticated ? 'Connect Wallet' : 'Authenticate'}
          </AnimatedButton>
        </RevealUp>
      </div>
    </div>
  );
}