import { Wallet } from 'lucide-react';
import { RevealUp } from '../../components/motion/Reveal';

interface TransactionHeaderProps {
  transactionType?: 'createFactory' | 'fundPool' | 'claimRewards' | 'createAndFundPool' | 'withdrawPool';
  token?: string;
  amount?: string;
  poolAddress?: string;
}

export function TransactionHeader({ transactionType, token, amount, poolAddress }: TransactionHeaderProps) {
  const getTransactionTitle = () => {
    switch (transactionType) {
      case 'createFactory':
        return 'Create Factory';
      case 'createAndFundPool':
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
    switch (transactionType) {
      case 'createFactory':
        return `Create a new factory for ${token || 'token'}`;
      case 'createAndFundPool':
        return `Create factory for ${token || 'token'} and fund with ${amount || ''} ${token || ''}`;
      case 'fundPool':
        return `Fund factory with ${amount || ''} ${token || ''}`;
      case 'withdrawPool':
        return `Withdraw ${amount || ''} ${token || ''} from factory`;
      case 'claimRewards':
        return `Claim pending rewards from pool ${poolAddress?.slice(0, 6)}...${poolAddress?.slice(-4)}`;
      default:
        return 'Execute blockchain transaction';
    }
  };

  return (
    <div className="text-center mb-16">
      <RevealUp>
        <div className="w-20 h-20 mx-auto mb-8 ultra-premium-glass-card rounded-full flex items-center justify-center">
          <Wallet className="w-10 h-10 text-primary-500" />
        </div>
      </RevealUp>

      <RevealUp>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-text-primary tracking-wide mb-6 leading-tight font-system">
          {getTransactionTitle()}
        </h1>
      </RevealUp>

      <RevealUp>
        <p className="text-lg text-text-muted max-w-2xl mx-auto leading-relaxed">
          {getTransactionDescription()}
        </p>
      </RevealUp>
    </div>
  );
}