
export interface Dividend {
  id: string;
  symbol: string;
  company: string;
  amount: number;
  currency: string;
  exDate: string;
  paymentDate: string;
  yield: number;
  frequency: 'monthly' | 'quarterly' | 'semi-annual' | 'annual' | 'special';
  growth: number; // YoY growth as a percentage
  isSafe: boolean; // Based on payout ratio and other factors
  status?: 'pending' | 'paid' | 'cancelled';
}

export interface DividendMetric {
  name: string;
  value: number | string;
  changePercent?: number;
  changeValue?: number | string;
  isPositive?: boolean;
}

export interface DividendPortfolio {
  id: string;
  name: string;
  userId: string;
  annualIncome: number;
  monthlyAverage: number;
  totalHoldings: number;
  yieldOnCost: number;
  metrics: DividendMetric[];
  dividends: Dividend[];
}
