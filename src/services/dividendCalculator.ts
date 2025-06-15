// Main calculator function with enhanced comprehensive dividend data fetching
import { DIVIDEND_DATABASE, DividendInfo } from './dividend/dividendData';
import { findDividendSymbol } from './dividend/symbolMatcher';
import { getCompanyName } from './dividend/companyNames';
import { getNextExDate, getNextPaymentDate } from './dividend/dateUtils';
import { analyzePortfolioForDividends, getComprehensiveStats } from './dividend/enhancedDividendManager';

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
    apiCallsMade: number;
    databaseHits: number;
  };
}> => {
  console.log('🚀 Starting ENHANCED dividend calculation with comprehensive API detection...');
  
  // Use the enhanced portfolio analysis
  const analysisResults = await analyzePortfolioForDividends(
    positions.map(p => ({
      symbol: p.symbol,
      quantity: p.quantity,
      currentPrice: p.currentPrice,
      marketValue: p.marketValue
    }))
  );
  
  const dividendPayingStocks = [];
  let totalAnnualIncome = 0;
  let totalQuarterlyIncome = 0;
  let totalPortfolioValue = 0;
  let processingErrors = 0;

  // Process each position with the enhanced dividend data
  for (const position of positions) {
    try {
      const cleanSymbol = position.symbol.replace(/_US_EQ$|_EQ$|\.L$|\.TO$/, '').toUpperCase();
      const positionValue = position.marketValue || (position.quantity * position.currentPrice);
      totalPortfolioValue += positionValue;
      
      // Find dividend info from enhanced analysis
      const dividendPayer = analysisResults.dividendPayers.find(dp => dp.symbol === cleanSymbol);
      
      if (dividendPayer && dividendPayer.dividendInfo.annual > 0 && position.quantity > 0) {
        const dividendInfo = dividendPayer.dividendInfo;
        const annualDividendForPosition = dividendInfo.annual * position.quantity;
        const quarterlyDividendForPosition = dividendInfo.quarterly * position.quantity;
        
        totalAnnualIncome += annualDividendForPosition;
        totalQuarterlyIncome += quarterlyDividendForPosition;
        
        console.log(`✅ ENHANCED DIVIDEND PAYER: ${cleanSymbol}: ${position.quantity} shares × $${dividendInfo.annual} = $${annualDividendForPosition.toFixed(2)} annual ${dividendPayer.isNewlyDetected ? '(NEW!)' : '(KNOWN)'}`);
        
        dividendPayingStocks.push({
          symbol: cleanSymbol,
          originalSymbol: position.symbol,
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
          hasDiv: true,
          isNewlyAdded: dividendPayer.isNewlyDetected,
          apiSource: dividendPayer.apiSource
        });
      } else if (analysisResults.nonDividendStocks.includes(cleanSymbol)) {
        console.log(`❌ CONFIRMED NON-DIVIDEND: ${cleanSymbol}`);
      }
    } catch (error) {
      console.error(`❌ Error processing position ${position.symbol}:`, error);
      processingErrors++;
    }
  }

  const portfolioYield = totalPortfolioValue > 0 ? (totalAnnualIncome / totalPortfolioValue) * 100 : 0;
  const coveragePercentage = positions.length > 0 ? (analysisResults.analysisStats.totalAnalyzed / positions.length) * 100 : 0;
  const comprehensiveStats = getComprehensiveStats();

  const stats = {
    totalPositions: positions.length,
    symbolsMatched: analysisResults.analysisStats.totalAnalyzed,
    dividendPayingStocks: analysisResults.analysisStats.dividendPayersFound,
    databaseSize: comprehensiveStats.totalStocks,
    coveragePercentage: Math.round(coveragePercentage * 100) / 100,
    newStocksAdded: analysisResults.analysisStats.newlyDetected,
    processingErrors: processingErrors,
    apiCallsMade: analysisResults.analysisStats.apiCallsMade,
    databaseHits: analysisResults.analysisStats.databaseHits
  };

  console.log('📊 ENHANCED DIVIDEND ANALYSIS RESULTS:');
  console.log(`   📈 Total positions: ${stats.totalPositions}`);
  console.log(`   🎯 Symbols analyzed: ${stats.symbolsMatched}`);
  console.log(`   💰 Dividend payers: ${stats.dividendPayingStocks}`);
  console.log(`   🆕 Newly detected: ${stats.newStocksAdded}`);
  console.log(`   🌐 API calls made: ${stats.apiCallsMade}`);
  console.log(`   💾 Database hits: ${stats.databaseHits}`);
  console.log(`   💵 Total annual income: $${totalAnnualIncome.toFixed(2)}`);
  console.log(`   📊 Portfolio yield: ${portfolioYield.toFixed(2)}%`);
  console.log(`   🗄️ Database size: ${stats.databaseSize} stocks`);

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
