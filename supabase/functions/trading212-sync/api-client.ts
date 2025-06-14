
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
}
