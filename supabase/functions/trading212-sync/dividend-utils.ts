
interface DividendData {
  symbol: string;
  amount: number;
  exDate: string;
  payDate: string;
  frequency: string;
  yield: number;
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

// Function to fetch dividend data from Alpha Vantage (free tier)
export async function fetchDividendData(symbol: string): Promise<DividendData | null> {
  try {
    // Clean symbol to remove Trading212 suffixes
    const cleanSymbol = symbol.replace(/_US_EQ$|_EQ$/, '');
    
    // Using Alpha Vantage free API for dividend data
    const response = await fetch(
      `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${cleanSymbol}&apikey=demo`
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    if (data.DividendPerShare && data.ExDividendDate) {
      return {
        symbol: cleanSymbol,
        amount: parseFloat(data.DividendPerShare) || 0,
        exDate: data.ExDividendDate || '',
        payDate: data.ExDividendDate || '',
        frequency: 'quarterly', // Default assumption
        yield: parseFloat(data.DividendYield?.replace('%', '')) || 0
      };
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching dividend data for ${symbol}:`, error);
    return null;
  }
}

// Function to calculate dividend income
export function calculateDividendIncome(position: Trading212Position, dividendData: DividendData | null) {
  if (!dividendData || !dividendData.amount || !position.quantity) {
    return {
      annualDividend: 0,
      quarterlyDividend: 0,
      nextPayment: 0,
      yield: 0
    };
  }

  const quarterlyDividend = dividendData.amount * position.quantity;
  const annualDividend = quarterlyDividend * 4; // Assuming quarterly payments
  const currentValue = position.currentPrice * position.quantity;
  const yieldOnCost = currentValue > 0 ? (annualDividend / currentValue) * 100 : 0;

  return {
    annualDividend,
    quarterlyDividend,
    nextPayment: quarterlyDividend,
    yield: yieldOnCost
  };
}

// Function to calculate portfolio metrics
export function calculatePortfolioMetrics(accountData: any, positions: Trading212Position[]) {
  const totalInvested = accountData?.cash?.invested || 0;
  const cashFree = accountData?.cash?.free || 0;
  const totalValue = totalInvested + cashFree;
  const totalReturn = accountData?.cash?.result || 0;
  const totalReturnPercentage = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

  // Calculate today's change (using ppl from positions as approximation)
  const todaysChange = positions.reduce((sum, pos) => sum + (pos.ppl || 0), 0);
  const todaysChangePercentage = totalInvested > 0 ? (todaysChange / totalInvested) * 100 : 0;

  return {
    totalValue,
    todayChange: todaysChange,
    todayPercentage: todaysChangePercentage,
    totalReturn,
    totalReturnPercentage,
    holdingsCount: positions.length,
    netDeposits: totalInvested,
    cashBalance: cashFree
  };
}

// Function to calculate dividend metrics
export function calculateDividendMetrics(positionsWithDividends: any[]) {
  const totalAnnualDividends = positionsWithDividends.reduce((sum, pos) => sum + pos.dividendInfo.annualDividend, 0);
  const totalQuarterlyDividends = positionsWithDividends.reduce((sum, pos) => sum + pos.dividendInfo.quarterlyDividend, 0);
  const totalPortfolioValue = positionsWithDividends.reduce((sum, pos) => sum + (pos.marketValue || 0), 0);
  const portfolioYield = totalPortfolioValue > 0 ? (totalAnnualDividends / totalPortfolioValue) * 100 : 0;

  return {
    annualIncome: totalAnnualDividends,
    quarterlyIncome: totalQuarterlyDividends,
    monthlyAverage: totalAnnualDividends / 12,
    portfolioYield: portfolioYield,
    dividendPayingStocks: positionsWithDividends.filter(p => p.dividendInfo.annualDividend > 0).length
  };
}
