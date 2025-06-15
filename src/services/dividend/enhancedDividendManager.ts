
import { DIVIDEND_DATABASE, DividendInfo } from './dividendData';
import { fetchComprehensiveDividendData, batchFetchDividendData, ApiDividendData } from './freeApiService';

// Cache for API fetched data
const apiDividendCache = new Map<string, ApiDividendData>();

export interface HoldingStock {
  symbol: string;
  quantity: number;
  currentPrice: number;
  marketValue: number;
}

// Convert API data to DividendInfo format
const convertApiDataToDividendInfo = (apiData: ApiDividendData): DividendInfo => {
  return {
    annual: apiData.annualDividend,
    quarterly: apiData.annualDividend / 4,
    yield: apiData.dividendYield,
    frequency: apiData.frequency as 'quarterly' | 'annual' | 'monthly' | 'semi-annual',
    nextExDate: apiData.exDividendDate,
    paymentDate: apiData.paymentDate,
    isETF: false
  };
};

// Enhanced dividend detection using multiple free APIs
export const detectDividendPayerComprehensive = async (symbol: string): Promise<DividendInfo | null> => {
  const cleanSymbol = symbol.replace(/_US_EQ$|_EQ$|\.L$|\.TO$/, '').toUpperCase();
  
  console.log(`🔍 Enhanced dividend detection for: ${cleanSymbol}`);
  
  // Check cache first
  if (apiDividendCache.has(cleanSymbol)) {
    const cachedData = apiDividendCache.get(cleanSymbol)!;
    return convertApiDataToDividendInfo(cachedData);
  }
  
  // Check existing database
  if (DIVIDEND_DATABASE[cleanSymbol]) {
    console.log(`📖 Found ${cleanSymbol} in existing database`);
    return DIVIDEND_DATABASE[cleanSymbol];
  }
  
  // Fetch from comprehensive APIs
  const apiData = await fetchComprehensiveDividendData(cleanSymbol);
  
  if (apiData) {
    // Cache the API data
    apiDividendCache.set(cleanSymbol, apiData);
    
    // Convert and store in database
    const dividendInfo = convertApiDataToDividendInfo(apiData);
    DIVIDEND_DATABASE[cleanSymbol] = dividendInfo;
    
    console.log(`✅ Added ${cleanSymbol} to database via ${apiData.source}: $${apiData.annualDividend} annual dividend`);
    return dividendInfo;
  }
  
  // If no dividend found, mark as non-dividend stock
  const nonDividendInfo: DividendInfo = {
    annual: 0,
    quarterly: 0,
    yield: 0,
    frequency: 'quarterly',
    nextExDate: '',
    paymentDate: '',
    isETF: false
  };
  
  DIVIDEND_DATABASE[cleanSymbol] = nonDividendInfo;
  console.log(`➖ Confirmed ${cleanSymbol} as non-dividend stock`);
  return nonDividendInfo;
};

// Comprehensive portfolio analysis
export const analyzePortfolioForDividends = async (holdings: HoldingStock[]): Promise<{
  dividendPayers: Array<{
    symbol: string;
    dividendInfo: DividendInfo;
    apiSource?: string;
    isNewlyDetected: boolean;
  }>;
  nonDividendStocks: string[];
  analysisStats: {
    totalAnalyzed: number;
    dividendPayersFound: number;
    newlyDetected: number;
    apiCallsMade: number;
    databaseHits: number;
  };
}> => {
  console.log(`🚀 Starting comprehensive dividend analysis for ${holdings.length} holdings...`);
  
  const dividendPayers: Array<{
    symbol: string;
    dividendInfo: DividendInfo;
    apiSource?: string;
    isNewlyDetected: boolean;
  }> = [];
  
  const nonDividendStocks: string[] = [];
  let newlyDetected = 0;
  let apiCallsMade = 0;
  let databaseHits = 0;
  
  // Extract unique symbols
  const uniqueSymbols = [...new Set(holdings.map(h => h.symbol.replace(/_US_EQ$|_EQ$|\.L$|\.TO$/, '').toUpperCase()))];
  
  // Process symbols in batches for better performance
  const batchSize = 10;
  for (let i = 0; i < uniqueSymbols.length; i += batchSize) {
    const batch = uniqueSymbols.slice(i, i + batchSize);
    
    await Promise.allSettled(batch.map(async (symbol) => {
      try {
        // Check if already in database
        if (DIVIDEND_DATABASE[symbol]) {
          databaseHits++;
          const dividendInfo = DIVIDEND_DATABASE[symbol];
          
          if (dividendInfo.annual > 0) {
            dividendPayers.push({
              symbol,
              dividendInfo,
              isNewlyDetected: false
            });
          } else {
            nonDividendStocks.push(symbol);
          }
          return;
        }
        
        // Fetch from APIs
        apiCallsMade++;
        const dividendInfo = await detectDividendPayerComprehensive(symbol);
        
        if (dividendInfo) {
          if (dividendInfo.annual > 0) {
            dividendPayers.push({
              symbol,
              dividendInfo,
              isNewlyDetected: true
            });
            newlyDetected++;
          } else {
            nonDividendStocks.push(symbol);
          }
        } else {
          nonDividendStocks.push(symbol);
        }
      } catch (error) {
        console.error(`❌ Error analyzing ${symbol}:`, error);
        nonDividendStocks.push(symbol);
      }
    }));
    
    // Rate limiting between batches
    if (i + batchSize < uniqueSymbols.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log(`📊 Processed batch ${Math.ceil((i + batchSize) / batchSize)}/${Math.ceil(uniqueSymbols.length / batchSize)}`);
  }
  
  const analysisStats = {
    totalAnalyzed: uniqueSymbols.length,
    dividendPayersFound: dividendPayers.length,
    newlyDetected,
    apiCallsMade,
    databaseHits
  };
  
  console.log(`✅ Comprehensive analysis complete:`);
  console.log(`   📊 Total stocks analyzed: ${analysisStats.totalAnalyzed}`);
  console.log(`   💰 Dividend payers found: ${analysisStats.dividendPayersFound}`);
  console.log(`   🆕 Newly detected: ${analysisStats.newlyDetected}`);
  console.log(`   🌐 API calls made: ${analysisStats.apiCallsMade}`);
  console.log(`   💾 Database hits: ${analysisStats.databaseHits}`);
  
  return {
    dividendPayers,
    nonDividendStocks,
    analysisStats
  };
};

// Get comprehensive database statistics
export const getComprehensiveStats = () => {
  const totalStocks = Object.keys(DIVIDEND_DATABASE).length;
  const dividendPayingStocks = Object.values(DIVIDEND_DATABASE).filter(info => info.annual > 0).length;
  const nonDividendStocks = totalStocks - dividendPayingStocks;
  const cacheSize = apiDividendCache.size;
  
  return {
    totalStocks,
    dividendPayingStocks,
    nonDividendStocks,
    cacheSize,
    coverageRate: totalStocks > 0 ? Math.round((dividendPayingStocks / totalStocks) * 100) : 0
  };
};
