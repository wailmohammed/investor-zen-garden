
interface Trading212Account {
  cash: {
    free: number;
    total: number;
    invested: number;
    result: number;
  };
}

interface Trading212Position {
  ticker: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  marketValue: number;
  ppl: number;
  fxPpl: number;
}

export class Trading212ApiClient {
  private apiKey: string;
  private baseUrl = 'https://live.trading212.com/api/v0/equity';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async makeRequest(endpoint: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Authorization': this.apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 429) {
      throw new Error('RATE_LIMITED');
    }

    if (!response.ok) {
      throw new Error(`Trading212 API error: ${response.status}`);
    }

    return response.json();
  }

  async fetchAccountData(): Promise<Trading212Account | null> {
    try {
      return await this.makeRequest('/account/cash');
    } catch (error) {
      console.error('Error fetching account data:', error);
      if (error.message === 'RATE_LIMITED') {
        throw error;
      }
      return null;
    }
  }

  async fetchPositions(): Promise<Trading212Position[]> {
    try {
      return await this.makeRequest('/portfolio');
    } catch (error) {
      console.error('Error fetching positions:', error);
      return [];
    }
  }

  static getMockData() {
    return {
      totalValue: 15000,
      todayChange: 250,
      todayPercentage: 1.7,
      totalReturn: 1200,
      totalReturnPercentage: 8.7,
      holdingsCount: 4,
      netDeposits: 13800,
      cashBalance: 500,
      positions: [
        {
          symbol: 'AAPL',
          quantity: 25,
          averagePrice: 175.20,
          currentPrice: 187.53,
          marketValue: 4688.25,
          unrealizedPnL: 308.25,
          dividendInfo: {
            annualDividend: 24.00,
            quarterlyDividend: 6.00,
            nextPayment: 6.00,
            yield: 0.51
          }
        },
        {
          symbol: 'MSFT',
          quantity: 12,
          averagePrice: 395.40,
          currentPrice: 404.87,
          marketValue: 4858.44,
          unrealizedPnL: 113.64,
          dividendInfo: {
            annualDividend: 36.00,
            quarterlyDividend: 9.00,
            nextPayment: 9.00,
            yield: 0.82
          }
        }
      ]
    };
  }
}
