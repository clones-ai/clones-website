export interface GasEstimate {
  gasPrice: string;
  gasLimit: string;
  totalCost: string;
  isExpensive: boolean;
}

export interface TransactionParams {
  type: string;
  creator?: string;
  token?: string;
  amount?: string;
  poolAddress?: string;
}

export class GasEstimationService {
  constructor(private secureCall: (endpoint: string, options?: RequestInit) => Promise<Response>) {}

  async estimateGas(transactionType: string, params: TransactionParams): Promise<GasEstimate> {
    const response = await this.secureCall('/api/v1/transaction/estimate-gas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: transactionType,
        creator: params.creator,
        token: params.token,
        amount: params.amount,
        poolAddress: params.poolAddress,
      })
    });

    if (!response.ok) {
      throw new Error('Failed to estimate gas');
    }

    const gasData = await response.json();
    const totalCost = parseFloat(gasData.data.totalCost);
    
    return {
      ...gasData.data,
      isExpensive: totalCost > 0.001
    };
  }
}