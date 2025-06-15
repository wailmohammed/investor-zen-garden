
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

// Comprehensive dividend data for major dividend-paying stocks
const DIVIDEND_DATA_SOURCES = {
  DIVIDEND_CHAMPIONS: {
    // Technology
    'AAPL': { annual: 0.96, quarterly: 0.24, yield: 0.49, frequency: 'quarterly' as const },
    'MSFT': { annual: 3.00, quarterly: 0.75, yield: 0.72, frequency: 'quarterly' as const },
    'INTC': { annual: 0.50, quarterly: 0.125, yield: 2.1, frequency: 'quarterly' as const },
    'IBM': { annual: 6.63, quarterly: 1.6575, yield: 3.5, frequency: 'quarterly' as const },
    'ORCL': { annual: 1.60, quarterly: 0.40, yield: 1.2, frequency: 'quarterly' as const },
    'CSCO': { annual: 1.60, quarterly: 0.40, yield: 3.0, frequency: 'quarterly' as const },
    
    // Healthcare & Consumer
    'JNJ': { annual: 4.76, quarterly: 1.19, yield: 3.1, frequency: 'quarterly' as const },
    'PG': { annual: 3.76, quarterly: 0.94, yield: 2.4, frequency: 'quarterly' as const },
    'KO': { annual: 1.84, quarterly: 0.46, yield: 3.0, frequency: 'quarterly' as const },
    'PEP': { annual: 4.42, quarterly: 1.105, yield: 2.8, frequency: 'quarterly' as const },
    'MCD': { annual: 6.08, quarterly: 1.52, yield: 2.2, frequency: 'quarterly' as const },
    'WMT': { annual: 2.28, quarterly: 0.57, yield: 3.0, frequency: 'quarterly' as const },
    'COST': { annual: 4.48, quarterly: 1.12, yield: 0.45, frequency: 'quarterly' as const },
    
    // Financial
    'JPM': { annual: 4.80, quarterly: 1.20, yield: 2.4, frequency: 'quarterly' as const },
    'BAC': { annual: 0.96, quarterly: 0.24, yield: 2.8, frequency: 'quarterly' as const },
    'WFC': { annual: 1.20, quarterly: 0.30, yield: 2.9, frequency: 'quarterly' as const },
    'C': { annual: 2.04, quarterly: 0.51, yield: 3.2, frequency: 'quarterly' as const },
    
    // Utilities & REITs
    'VZ': { annual: 2.56, quarterly: 0.64, yield: 6.8, frequency: 'quarterly' as const },
    'T': { annual: 1.11, quarterly: 0.2775, yield: 7.4, frequency: 'quarterly' as const },
    'SO': { annual: 2.80, quarterly: 0.70, yield: 3.8, frequency: 'quarterly' as const },
    'D': { annual: 4.32, quarterly: 1.08, yield: 4.1, frequency: 'quarterly' as const },
    
    // Energy
    'XOM': { annual: 3.64, quarterly: 0.91, yield: 5.8, frequency: 'quarterly' as const },
    'CVX': { annual: 6.04, quarterly: 1.51, yield: 3.4, frequency: 'quarterly' as const },
    'COP': { annual: 2.04, quarterly: 0.51, yield: 1.8, frequency: 'quarterly' as const },
    
    // Industrial
    'MMM': { annual: 6.00, quarterly: 1.50, yield: 4.8, frequency: 'quarterly' as const },
    'CAT': { annual: 4.80, quarterly: 1.20, yield: 1.8, frequency: 'quarterly' as const },
    'HON': { annual: 4.04, quarterly: 1.01, yield: 1.9, frequency: 'quarterly' as const },
    'GE': { annual: 0.16, quarterly: 0.04, yield: 0.1, frequency: 'quarterly' as const },
    
    // Consumer Discretionary
    'HD': { annual: 8.36, quarterly: 2.09, yield: 2.3, frequency: 'quarterly' as const },
    'LOW': { annual: 4.20, quarterly: 1.05, yield: 1.7, frequency: 'quarterly' as const },
    'NKE': { annual: 1.48, quarterly: 0.37, yield: 1.8, frequency: 'quarterly' as const },
    
    // Materials
    'DD': { annual: 1.28, quarterly: 0.32, yield: 1.6, frequency: 'quarterly' as const },
    'DOW': { annual: 2.80, quarterly: 0.70, yield: 5.1, frequency: 'quarterly' as const },
    
    // Additional Dividend Stocks
    'BRK.B': { annual: 0, quarterly: 0, yield: 0, frequency: 'quarterly' as const }, // Berkshire doesn't pay dividends
    'GOOGL': { annual: 0, quarterly: 0, yield: 0, frequency: 'quarterly' as const }, // Google doesn't pay dividends
    'GOOG': { annual: 0, quarterly: 0, yield: 0, frequency: 'quarterly' as const },
    'AMZN': { annual: 0, quarterly: 0, yield: 0, frequency: 'quarterly' as const }, // Amazon doesn't pay dividends
    'TSLA': { annual: 0, quarterly: 0, yield: 0, frequency: 'quarterly' as const }, // Tesla doesn't pay dividends
    'META': { annual: 2.00, quarterly: 0.50, yield: 0.4, frequency: 'quarterly' as const },
    'NVDA': { annual: 0.16, quarterly: 0.04, yield: 0.02, frequency: 'quarterly' as const },
    
    // REITs and High Dividend Stocks
    'ARCC': { annual: 2.64, quarterly: 0.66, yield: 12.0, frequency: 'quarterly' as const },
    'O': { annual: 3.06, quarterly: 0.765, yield: 5.1, frequency: 'monthly' as const },
    'MAIN': { annual: 2.64, quarterly: 0.66, yield: 5.4, frequency: 'quarterly' as const },
    'STAG': { annual: 1.68, quarterly: 0.42, yield: 4.2, frequency: 'quarterly' as const },
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
  let dividendPayingStocksCount = 0;

  for (const position of positions) {
    // Clean symbol to remove Trading212 suffixes and handle various formats
    const cleanSymbol = position.symbol.replace(/_US_EQ$|_EQ$|\.L$|\.TO$/, '').toUpperCase();
    const dividendInfo = DIVIDEND_DATA_SOURCES.DIVIDEND_CHAMPIONS[cleanSymbol];
    
    // Calculate portfolio value for all positions
    const positionValue = position.marketValue || (position.quantity * position.currentPrice);
    totalPortfolioValue += positionValue;
    
    if (dividendInfo && position.quantity > 0) {
      const annualDividendForPosition = dividendInfo.annual * position.quantity;
      const quarterlyDividendForPosition = dividendInfo.quarterly * position.quantity;
      
      // Only count if there are actual dividends
      if (dividendInfo.annual > 0) {
        totalAnnualIncome += annualDividendForPosition;
        totalQuarterlyIncome += quarterlyDividendForPosition;
        dividendPayingStocksCount++;
      }
      
      dividendPayingStocks.push({
        symbol: cleanSymbol,
        company: getCompanyName(cleanSymbol),
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
        currentValue: positionValue,
        hasDiv: dividendInfo.annual > 0
      });
      
      console.log(`${cleanSymbol}: ${position.quantity} shares × $${dividendInfo.annual} = $${annualDividendForPosition.toFixed(2)} annual`);
    }
  }

  const portfolioYield = totalPortfolioValue > 0 ? (totalAnnualIncome / totalPortfolioValue) * 100 : 0;

  console.log('Dividend calculation results:', {
    totalAnnualIncome: totalAnnualIncome.toFixed(2),
    totalQuarterlyIncome: totalQuarterlyIncome.toFixed(2),
    dividendPayingStocks: dividendPayingStocksCount,
    totalStocksAnalyzed: dividendPayingStocks.length,
    portfolioValue: totalPortfolioValue.toFixed(2),
    portfolioYield: portfolioYield.toFixed(2) + '%'
  });

  return {
    totalAnnualIncome,
    totalQuarterlyIncome,
    dividendPayingStocks: dividendPayingStocks.filter(stock => stock.hasDiv), // Only return actual dividend payers
    portfolioYield
  };
};

const getCompanyName = (symbol: string): string => {
  const companyNames: Record<string, string> = {
    'AAPL': 'Apple Inc.',
    'MSFT': 'Microsoft Corporation',
    'JNJ': 'Johnson & Johnson',
    'PG': 'Procter & Gamble',
    'KO': 'Coca-Cola Company',
    'PEP': 'PepsiCo Inc.',
    'WMT': 'Walmart Inc.',
    'MCD': "McDonald's Corporation",
    'VZ': 'Verizon Communications',
    'T': 'AT&T Inc.',
    'XOM': 'Exxon Mobil Corporation',
    'CVX': 'Chevron Corporation',
    'IBM': 'International Business Machines',
    'INTC': 'Intel Corporation',
    'COST': 'Costco Wholesale',
    'JPM': 'JPMorgan Chase & Co.',
    'BAC': 'Bank of America',
    'HD': 'Home Depot Inc.',
    'ARCC': 'Ares Capital Corporation',
    'O': 'Realty Income Corporation',
    'META': 'Meta Platforms Inc.',
    'NVDA': 'NVIDIA Corporation'
  };
  
  return companyNames[symbol] || symbol;
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

// Get stocks that actually pay dividends (exclude zero dividend stocks)
export const getActualDividendPayingStocks = (): string[] => {
  return Object.entries(DIVIDEND_DATA_SOURCES.DIVIDEND_CHAMPIONS)
    .filter(([_, info]) => info.annual > 0)
    .map(([symbol, _]) => symbol);
};
