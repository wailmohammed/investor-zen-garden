
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
    // Generate more realistic mock data based on current market conditions
    const mockPositions = [
      {
        symbol: 'AAPL',
        quantity: 25,
        averagePrice: 175.20,
        currentPrice: 187.53,
        marketValue: 25 * 187.53, // 4688.25
        unrealizedPnL: (187.53 - 175.20) * 25, // 308.25
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
        marketValue: 12 * 404.87, // 4858.44
        unrealizedPnL: (404.87 - 395.40) * 12, // 113.64
        dividendInfo: {
          annualDividend: 36.00,
          quarterlyDividend: 9.00,
          nextPayment: 9.00,
          yield: 0.82
        }
      },
      {
        symbol: 'GOOGL',
        quantity: 8,
        averagePrice: 142.30,
        currentPrice: 145.85,
        marketValue: 8 * 145.85, // 1166.8
        unrealizedPnL: (145.85 - 142.30) * 8, // 28.4
        dividendInfo: {
          annualDividend: 0,
          quarterlyDividend: 0,
          nextPayment: 0,
          yield: 0
        }
      },
      {
        symbol: 'TSLA',
        quantity: 5,
        averagePrice: 248.50,
        currentPrice: 242.15,
        marketValue: 5 * 242.15, // 1210.75
        unrealizedPnL: (242.15 - 248.50) * 5, // -31.75
        dividendInfo: {
          annualDividend: 0,
          quarterlyDividend: 0,
          nextPayment: 0,
          yield: 0
        }
      }
    ];

    const totalMarketValue = mockPositions.reduce((sum, pos) => sum + pos.marketValue, 0);
    const totalUnrealizedPnL = mockPositions.reduce((sum, pos) => sum + pos.unrealizedPnL, 0);
    const totalInvested = totalMarketValue - totalUnrealizedPnL;
    const cashBalance = 1000;
    const totalValue = totalMarketValue + cashBalance;

    return {
      totalValue: totalValue,
      todayChange: totalUnrealizedPnL * 0.3, // Simulate today's change as portion of total PnL
      todayPercentage: (totalUnrealizedPnL * 0.3 / totalInvested) * 100,
      totalReturn: totalUnrealizedPnL,
      totalReturnPercentage: (totalUnrealizedPnL / totalInvested) * 100,
      holdingsCount: mockPositions.length,
      netDeposits: totalInvested,
      cashBalance: cashBalance,
      positions: mockPositions
    };
  }
}
