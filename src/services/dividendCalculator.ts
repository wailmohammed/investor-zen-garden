
// Main calculator function with dynamic dividend data fetching
import { DIVIDEND_DATABASE, DividendInfo } from './dividend/dividendData';
import { findDividendSymbol } from './dividend/symbolMatcher';
import { getCompanyName } from './dividend/companyNames';
import { getNextExDate, getNextPaymentDate } from './dividend/dateUtils';
import { ensureDividendDataForHoldings, addStockToDividendDatabase, getDatabaseStats } from './dividend/dynamicDividendManager';

interface Position {
  symbol: string;
  quantity: number;
  currentPrice: number;
  marketValue: number;
}

export const calculateDividendIncome = async (positions: Position[]): Promise<{
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
    newStocksAdded: number;
    processingErrors: number;
  };
}> => {
  console.log('Starting enhanced dividend calculation for positions:', positions.length);
  
  // First, ensure all holdings have dividend data
  const holdingsProcessing = await ensureDividendDataForHoldings(
    positions.map(p => ({
      symbol: p.symbol,
      quantity: p.quantity,
      currentPrice: p.currentPrice,
      marketValue: p.marketValue
    }))
  );
  
  const dividendPayingStocks = [];
  const allStocksWithData = [];
  let totalAnnualIncome = 0;
  let totalQuarterlyIncome = 0;
  let totalPortfolioValue = 0;
  let dividendPayingStocksCount = 0;
  let symbolsProcessed = 0;
  let symbolsMatched = 0;
  let zeroPayerCount = 0;

  for (const position of positions) {
    symbolsProcessed++;
    
    try {
      // Enhanced symbol matching with dynamic data
      let matchedSymbol = findDividendSymbol(position.symbol, DIVIDEND_DATABASE);
      let dividendInfo = matchedSymbol ? DIVIDEND_DATABASE[matchedSymbol] : null;
      
      // If not found, try to add it dynamically
      if (!dividendInfo) {
        const cleanSymbol = position.symbol.replace(/_US_EQ$|_EQ$|\.L$|\.TO$/, '').toUpperCase();
        try {
          dividendInfo = await addStockToDividendDatabase(cleanSymbol);
          matchedSymbol = cleanSymbol;
        } catch (error) {
          console.error(`Failed to add ${cleanSymbol} to database:`, error);
        }
      }
      
      // Calculate portfolio value for all positions
      const positionValue = position.marketValue || (position.quantity * position.currentPrice);
      totalPortfolioValue += positionValue;
      
      if (dividendInfo && position.quantity > 0) {
        symbolsMatched++;
        const annualDividendForPosition = dividendInfo.annual * position.quantity;
        const quarterlyDividendForPosition = dividendInfo.quarterly * position.quantity;
        
        // Check if this stock actually pays dividends
        const actuallyPaysDividends = dividendInfo.annual > 0;
        
        if (actuallyPaysDividends) {
          totalAnnualIncome += annualDividendForPosition;
          totalQuarterlyIncome += quarterlyDividendForPosition;
          dividendPayingStocksCount++;
          
          console.log(`✓ DIVIDEND PAYER: ${matchedSymbol}: ${position.quantity} shares × $${dividendInfo.annual} = $${annualDividendForPosition.toFixed(2)} annual`);
        } else {
          zeroPayerCount++;
          console.log(`✗ NON-DIVIDEND: ${matchedSymbol}: $${dividendInfo.annual} annual dividend`);
        }
        
        // Add all stocks with data to the comprehensive list
        allStocksWithData.push({
          symbol: matchedSymbol || position.symbol,
          originalSymbol: position.symbol,
          company: getCompanyName(matchedSymbol || position.symbol),
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
          hasDiv: actuallyPaysDividends,
          isNewlyAdded: !findDividendSymbol(position.symbol, DIVIDEND_DATABASE)
        });
        
        // Only add to dividend paying stocks if it actually pays dividends
        if (actuallyPaysDividends) {
          dividendPayingStocks.push(allStocksWithData[allStocksWithData.length - 1]);
        }
      } else {
        console.log(`⚠️ NO DATA: ${position.symbol} - could not find or fetch dividend data`);
      }
    } catch (error) {
      console.error(`Error processing position ${position.symbol}:`, error);
    }
  }

  const portfolioYield = totalPortfolioValue > 0 ? (totalAnnualIncome / totalPortfolioValue) * 100 : 0;
  const coveragePercentage = symbolsProcessed > 0 ? (symbolsMatched / symbolsProcessed) * 100 : 0;
  const dbStats = getDatabaseStats();

  const stats = {
    totalPositions: symbolsProcessed,
    symbolsMatched: symbolsMatched,
    dividendPayingStocks: dividendPayingStocksCount,
    databaseSize: dbStats.totalStocks,
    coveragePercentage: Math.round(coveragePercentage * 100) / 100,
    newStocksAdded: holdingsProcessing.newStocksAdded,
    processingErrors: holdingsProcessing.errors
  };

  console.log('📊 ENHANCED DIVIDEND ANALYSIS RESULTS:');
  console.log(`   Total positions: ${symbolsProcessed}`);
  console.log(`   Symbols matched: ${symbolsMatched}`);
  console.log(`   Dividend payers: ${dividendPayingStocksCount}`);
  console.log(`   Zero dividend stocks: ${zeroPayerCount}`);
  console.log(`   No data found: ${symbolsProcessed - symbolsMatched}`);
  console.log(`   Total annual income: $${totalAnnualIncome.toFixed(2)}`);
  console.log(`   Portfolio yield: ${portfolioYield.toFixed(2)}%`);
  console.log(`   Database size: ${dbStats.totalStocks} stocks`);

  return {
    totalAnnualIncome,
    totalQuarterlyIncome,
    dividendPayingStocks: dividendPayingStocks,
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
