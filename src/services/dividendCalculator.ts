
// Main calculator function
import { DIVIDEND_DATABASE, DividendInfo } from './dividend/dividendData';
import { findDividendSymbol } from './dividend/symbolMatcher';
import { getCompanyName } from './dividend/companyNames';
import { getNextExDate, getNextPaymentDate } from './dividend/dateUtils';

interface Position {
  symbol: string;
  quantity: number;
  currentPrice: number;
  marketValue: number;
}

export const calculateDividendIncome = (positions: Position[]): {
  totalAnnualIncome: number;
  totalQuarterlyIncome: number;
  dividendPayingStocks: any[];
  portfolioYield: number;
  stats: {
    totalPositions: number;
    symbolsMatched: number;
    dividendPayingStocks: number;
    databaseSize: number;
    coveragePercentage: number;
  };
} => {
  console.log('Calculating dividend income for positions:', positions.length);
  
  const dividendPayingStocks = [];
  let totalAnnualIncome = 0;
  let totalQuarterlyIncome = 0;
  let totalPortfolioValue = 0;
  let dividendPayingStocksCount = 0;
  let symbolsProcessed = 0;
  let symbolsMatched = 0;

  for (const position of positions) {
    symbolsProcessed++;
    
    try {
      // Enhanced symbol matching with error handling
      const matchedSymbol = findDividendSymbol(position.symbol, DIVIDEND_DATABASE);
      const dividendInfo = matchedSymbol ? DIVIDEND_DATABASE[matchedSymbol] : null;
      
      // Calculate portfolio value for all positions
      const positionValue = position.marketValue || (position.quantity * position.currentPrice);
      totalPortfolioValue += positionValue;
      
      if (dividendInfo && position.quantity > 0) {
        symbolsMatched++;
        const annualDividendForPosition = dividendInfo.annual * position.quantity;
        const quarterlyDividendForPosition = dividendInfo.quarterly * position.quantity;
        
        // Only count if there are actual dividends
        if (dividendInfo.annual > 0) {
          totalAnnualIncome += annualDividendForPosition;
          totalQuarterlyIncome += quarterlyDividendForPosition;
          dividendPayingStocksCount++;
          
          console.log(`${matchedSymbol}: ${position.quantity} shares × $${dividendInfo.annual} = $${annualDividendForPosition.toFixed(2)} annual`);
        }
        
        dividendPayingStocks.push({
          symbol: matchedSymbol,
          originalSymbol: position.symbol,
          company: getCompanyName(matchedSymbol),
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
      } else {
        // Log symbols that couldn't be matched for debugging
        if (!dividendInfo && symbolsProcessed <= 50) { // Limit logging to first 50 for performance
          console.log(`No dividend data found for: ${position.symbol}`);
        }
      }
    } catch (error) {
      console.error(`Error processing position ${position.symbol}:`, error);
      // Continue processing other positions even if one fails
    }
  }

  const portfolioYield = totalPortfolioValue > 0 ? (totalAnnualIncome / totalPortfolioValue) * 100 : 0;
  const coveragePercentage = symbolsProcessed > 0 ? (symbolsMatched / symbolsProcessed) * 100 : 0;

  const stats = {
    totalPositions: symbolsProcessed,
    symbolsMatched: symbolsMatched,
    dividendPayingStocks: dividendPayingStocksCount,
    databaseSize: Object.keys(DIVIDEND_DATABASE).length,
    coveragePercentage: Math.round(coveragePercentage * 100) / 100
  };

  console.log('Enhanced dividend calculation results:', {
    ...stats,
    totalAnnualIncome: totalAnnualIncome.toFixed(2),
    totalQuarterlyIncome: totalQuarterlyIncome.toFixed(2),
    portfolioValue: totalPortfolioValue.toFixed(2),
    portfolioYield: portfolioYield.toFixed(2) + '%'
  });

  return {
    totalAnnualIncome,
    totalQuarterlyIncome,
    dividendPayingStocks: dividendPayingStocks.filter(stock => stock.hasDiv),
    portfolioYield,
    stats
  };
};

// Function to expand dividend database with more stocks
export const addDividendData = (symbol: string, dividendInfo: DividendInfo) => {
  DIVIDEND_DATABASE[symbol] = dividendInfo;
};

// Get all supported dividend-paying stocks
export const getSupportedDividendStocks = (): string[] => {
  return Object.keys(DIVIDEND_DATABASE);
};

// Get stocks that actually pay dividends (exclude zero dividend stocks)
export const getActualDividendPayingStocks = (): string[] => {
  return Object.entries(DIVIDEND_DATABASE)
    .filter(([_, info]) => info.annual > 0)
    .map(([symbol, _]) => symbol);
};

// Get dividend database statistics
export const getDividendDatabaseStats = () => {
  const totalStocks = Object.keys(DIVIDEND_DATABASE).length;
  const dividendPayingStocks = getActualDividendPayingStocks().length;
  const nonDividendStocks = totalStocks - dividendPayingStocks;
  
  return {
    totalStocks,
    dividendPayingStocks,
    nonDividendStocks,
    coverageRate: Math.round((dividendPayingStocks / totalStocks) * 100)
  };
};
