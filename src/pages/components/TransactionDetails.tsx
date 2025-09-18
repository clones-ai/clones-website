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

interface TransactionDetailsProps {
  sessionData: TransactionSession;
  address?: `0x${string}`;
}

export function TransactionDetails({ sessionData, address }: TransactionDetailsProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-light text-text-primary font-system">Transaction Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 ultra-premium-glass-card rounded-lg">
          <p className="text-sm text-text-secondary mb-2 font-system">Type</p>
          <p className="text-text-primary font-medium font-system capitalize">
            {sessionData.transactionType.replace(/([A-Z])/g, ' $1').toLowerCase()}
          </p>
        </div>
        
        {sessionData.transactionParams.token && (
          <div className="p-4 ultra-premium-glass-card rounded-lg">
            <p className="text-sm text-text-secondary mb-2 font-system">Token</p>
            <p className="text-text-primary font-medium font-system">
              {sessionData.transactionParams.token}
            </p>
          </div>
        )}
        
        {sessionData.transactionParams.amount && (
          <div className="p-4 ultra-premium-glass-card rounded-lg">
            <p className="text-sm text-text-secondary mb-2 font-system">Amount</p>
            <p className="text-text-primary font-medium font-system">
              {sessionData.transactionParams.amount} {sessionData.transactionParams.token}
            </p>
          </div>
        )}
        
        <div className="p-4 ultra-premium-glass-card rounded-lg">
          <p className="text-sm text-text-secondary mb-2 font-system">Your Address</p>
          <p className="text-text-primary font-mono text-sm">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
        </div>
      </div>
    </div>
  );
}