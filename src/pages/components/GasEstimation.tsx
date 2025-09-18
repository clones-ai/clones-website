import { AlertCircle } from 'lucide-react';

interface GasEstimate {
  gasPrice: string;
  gasLimit: string;
  totalCost: string;
  isExpensive: boolean;
}

interface GasEstimationProps {
  gasEstimate: GasEstimate;
}

export function GasEstimation({ gasEstimate }: GasEstimationProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-light text-text-primary font-system">Gas Estimate</h3>
      <div className={`p-6 ultra-premium-glass-card rounded-xl ${
        gasEstimate.isExpensive ? 'border border-yellow-500/30' : ''
      }`}>
        <div className="flex items-center gap-3 mb-4">
          {gasEstimate.isExpensive && <AlertCircle className="w-5 h-5 text-yellow-400" />}
          <span className="text-text-primary font-medium font-system">
            Estimated Cost: {parseFloat(gasEstimate.totalCost).toFixed(8)} ETH
          </span>
        </div>
        
        {gasEstimate.isExpensive && (
          <p className="text-yellow-400 text-sm mb-4 leading-relaxed">
            High gas cost detected. Consider waiting for lower network congestion.
          </p>
        )}
        
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-text-secondary/10">
          <div>
            <p className="text-xs text-text-secondary mb-1 font-system">Gas Price</p>
            <p className="text-sm text-text-primary font-system">
              {parseFloat(gasEstimate.gasPrice).toFixed(4)} Gwei
            </p>
          </div>
          <div>
            <p className="text-xs text-text-secondary mb-1 font-system">Gas Limit</p>
            <p className="text-sm text-text-primary font-system">
              {parseInt(gasEstimate.gasLimit).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}