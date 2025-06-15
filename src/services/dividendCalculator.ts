
interface StockDividendInfo {
  symbol: string;
  annualDividend: number;
  quarterlyDividend: number;
  exDate: string;
  paymentDate: string;
  yield: number;
  frequency: 'quarterly' | 'annual' | 'monthly' | 'semi-annual';
}

interface Position {
  symbol: string;
  quantity: number;
  currentPrice: number;
  marketValue: number;
}

// Free dividend data sources
const DIVIDEND_DATA_SOURCES = {
  // Using free APIs and known dividend data
  DIVIDEND_CHAMPIONS: {
    'AAPL': { annual: 0.96, quarterly: 0.24, yield: 0.51, frequency: 'quarterly' as const },
    'MSFT': { annual: 3.00, quarterly: 0.75, yield: 0.82, frequency: 'quarterly' as const },
    'JNJ': { annual: 4.76, quarterly: 1.19, yield: 3.1, frequency: 'quarterly' as const },
    'PG': { annual: 3.76, quarterly: 0.94, yield: 2.4, frequency: 'quarterly' as const },
    'KO': { annual: 1.84, quarterly: 0.46, yield: 3.0, frequency: 'quarterly' as const },
    'PEP': { annual: 4.42, quarterly: 1.105, yield: 2.8, frequency: 'quarterly' as const },
    'WMT': { annual: 2.28, quarterly: 0.57, yield: 3.0, frequency: 'quarterly' as const },
    'MCD': { annual: 6.08, quarterly: 1.52, yield: 2.2, frequency: 'quarterly' as const },
    'VZ': { annual: 2.56, quarterly: 0.64, yield: 6.8, frequency: 'quarterly' as const },
    'T': { annual: 1.11, quarterly: 0.2775, yield: 7.4, frequency: 'quarterly' as const },
    'XOM': { annual: 3.64, quarterly: 0.91, yield: 5.8, frequency: 'quarterly' as const },
    'CVX': { annual: 6.04, quarterly: 1.51, yield: 3.4, frequency: 'quarterly' as const },
    'IBM': { annual: 6.63, quarterly: 1.6575, yield: 3.5, frequency: 'quarterly' as const },
    'INTC': { annual: 0.50, quarterly: 0.125, yield: 2.1, frequency: 'quarterly' as const },
  }
};

export const calculateDividendIncome = (positions: Position[]): {
  totalAnnualIncome: number;
  totalQuarterlyIncome: number;
  dividendPayingStocks: any[];
  portfolioYield: number;
} => {
  console.log('Calculating dividend income for positions:', positions.length);
  
  const dividendPayingStocks = [];
  let totalAnnualIncome = 0;
  let totalQuarterlyIncome = 0;
  let totalPortfolioValue = 0;

  for (const position of positions) {
    const cleanSymbol = position.symbol.replace(/_US_EQ$|_EQ$/, '');
    const dividendInfo = DIVIDEND_DATA_SOURCES.DIVIDEND_CHAMPIONS[cleanSymbol];
    
    if (dividendInfo && position.quantity > 0) {
      const annualDividendForPosition = dividendInfo.annual * position.quantity;
      const quarterlyDividendForPosition = dividendInfo.quarterly * position.quantity;
      
      totalAnnualIncome += annualDividendForPosition;
      totalQuarterlyIncome += quarterlyDividendForPosition;
      
      dividendPayingStocks.push({
        symbol: cleanSymbol,
        company: cleanSymbol, // We'll improve this with company names later
        shares: position.quantity,
        annualDividend: dividendInfo.annual,
        quarterlyDividend: dividendInfo.quarterly,
        totalAnnualIncome: annualDividendForPosition,
        totalQuarterlyIncome: quarterlyDividendForPosition,
        yield: dividendInfo.yield,
        frequency: dividendInfo.frequency,
        nextPayment: quarterlyDividendForPosition,
        exDate: getNextExDate(),
        paymentDate: getNextPaymentDate(),
        currentValue: position.marketValue || (position.quantity * position.currentPrice)
      });
    }
    
    totalPortfolioValue += position.marketValue || (position.quantity * position.currentPrice);
  }

  const portfolioYield = totalPortfolioValue > 0 ? (totalAnnualIncome / totalPortfolioValue) * 100 : 0;

  console.log('Dividend calculation results:', {
    totalAnnualIncome,
    totalQuarterlyIncome,
    dividendPayingStocks: dividendPayingStocks.length,
    portfolioYield
  });

  return {
    totalAnnualIncome,
    totalQuarterlyIncome,
    dividendPayingStocks,
    portfolioYield
  };
};

const getNextExDate = (): string => {
  const date = new Date();
  date.setDate(date.getDate() + 30); // Approximate next ex-dividend date
  return date.toISOString().split('T')[0];
};

const getNextPaymentDate = (): string => {
  const date = new Date();
  date.setDate(date.getDate() + 45); // Approximate next payment date
  return date.toISOString().split('T')[0];
};

// Function to expand dividend database with more stocks
export const addDividendData = (symbol: string, dividendInfo: any) => {
  DIVIDEND_DATA_SOURCES.DIVIDEND_CHAMPIONS[symbol] = dividendInfo;
};

// Get all supported dividend-paying stocks
export const getSupportedDividendStocks = (): string[] => {
  return Object.keys(DIVIDEND_DATA_SOURCES.DIVIDEND_CHAMPIONS);
};
