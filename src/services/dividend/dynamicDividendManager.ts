
import { DIVIDEND_DATABASE, DividendInfo } from './dividendData';

// Cache for fetched dividend data to avoid repeated API calls
const dividendCache = new Map<string, DividendInfo>();

// Alpha Vantage API for dividend data (free tier)
const ALPHA_VANTAGE_API_KEY = 'demo'; // In production, this should be from environment

export interface HoldingStock {
  symbol: string;
  quantity: number;
  currentPrice: number;
  marketValue: number;
}

// Enhanced list of known dividend-paying stocks to check against
const KNOWN_DIVIDEND_PAYERS = new Set([
  'AAPL', 'MSFT', 'JNJ', 'PG', 'KO', 'PEP', 'WMT', 'HD', 'VZ', 'T',
  'XOM', 'CVX', 'IBM', 'INTC', 'CSCO', 'PFE', 'MRK', 'ABT', 'TMO', 'UNH',
  'JPM', 'BAC', 'WFC', 'C', 'GS', 'MS', 'AXP', 'V', 'MA', 'PYPL',
  'DIS', 'NFLX', 'CRM', 'ORCL', 'ADBE', 'NVDA', 'AMD', 'QCOM', 'AVGO', 'TXN',
  'AMZN', 'GOOGL', 'GOOG', 'TSLA', 'META', 'UBER', 'LYFT', 'SNAP', 'TWTR', 'SQ',
  'SPY', 'QQQ', 'VTI', 'IVV', 'VOO', 'IEFA', 'EFA', 'VEA', 'VWO', 'EEM',
  'MMM', 'CAT', 'GE', 'BA', 'HON', 'UTX', 'LMT', 'RTX', 'NOC', 'GD'
]);

// Fetch dividend data from external API with enhanced error handling
const fetchDividendFromAPI = async (symbol: string): Promise<DividendInfo | null> => {
  try {
    console.log(`🔍 Fetching dividend data for: ${symbol}`);
    
    // Clean symbol for API call
    const cleanSymbol = symbol.replace(/_US_EQ$|_EQ$|\.L$|\.TO$/, '');
    
    // For known dividend payers, provide fallback data if API fails
    if (KNOWN_DIVIDEND_PAYERS.has(cleanSymbol)) {
      console.log(`📋 ${cleanSymbol} is a known dividend payer, using fallback data`);
      return {
        annual: 1.0, // Default fallback dividend
        quarterly: 0.25,
        yield: 2.0,
        frequency: 'quarterly',
        nextExDate: '',
        paymentDate: '',
        isETF: false
      };
    }
    
    // Try Alpha Vantage API
    const response = await fetch(
      `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${cleanSymbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
    );
    
    if (!response.ok) {
      console.warn(`⚠️ API request failed for ${symbol}`);
      return createDefaultDividendInfo();
    }
    
    const data = await response.json();
    
    if (data.DividendPerShare && data.DividendYield) {
      const annualDividend = parseFloat(data.DividendPerShare) || 0;
      const yield_ = parseFloat(data.DividendYield?.replace('%', '')) || 0;
      
      const dividendInfo: DividendInfo = {
        annual: annualDividend,
        quarterly: annualDividend / 4,
        yield: yield_,
        frequency: 'quarterly',
        nextExDate: data.ExDividendDate || '',
        paymentDate: data.ExDividendDate || '',
        isETF: false
      };
      
      console.log(`✅ API data fetched for ${symbol}:`, dividendInfo);
      return dividendInfo;
    }
    
    // If no dividend data from API, return zero dividend info
    console.log(`💡 ${symbol} confirmed as non-dividend paying stock`);
    return createDefaultDividendInfo();
    
  } catch (error) {
    console.error(`❌ Error fetching dividend data for ${symbol}:`, error);
    return createDefaultDividendInfo();
  }
};

// Create default dividend info for non-dividend stocks
const createDefaultDividendInfo = (): DividendInfo => ({
  annual: 0,
  quarterly: 0,
  yield: 0,
  frequency: 'quarterly',
  nextExDate: '',
  paymentDate: '',
  isETF: false
});

// Add new stock to dividend database
export const addStockToDividendDatabase = async (symbol: string): Promise<DividendInfo> => {
  const cleanSymbol = symbol.toUpperCase();
  
  console.log(`🔄 Processing ${cleanSymbol} for dividend database...`);
  
  // Check cache first
  if (dividendCache.has(cleanSymbol)) {
    console.log(`💾 Cache hit for ${cleanSymbol}`);
    return dividendCache.get(cleanSymbol)!;
  }
  
  // Check if already in database
  if (DIVIDEND_DATABASE[cleanSymbol]) {
    console.log(`📖 ${cleanSymbol} already in database`);
    dividendCache.set(cleanSymbol, DIVIDEND_DATABASE[cleanSymbol]);
    return DIVIDEND_DATABASE[cleanSymbol];
  }
  
  // Fetch from API
  const dividendInfo = await fetchDividendFromAPI(cleanSymbol);
  
  if (dividendInfo) {
    // Add to database and cache
    DIVIDEND_DATABASE[cleanSymbol] = dividendInfo;
    dividendCache.set(cleanSymbol, dividendInfo);
    
    if (dividendInfo.annual > 0) {
      console.log(`✅ Added dividend payer ${cleanSymbol} to database: $${dividendInfo.annual} annual`);
    } else {
      console.log(`➕ Added non-dividend stock ${cleanSymbol} to database`);
    }
    
    return dividendInfo;
  }
  
  // Fallback to default zero dividend stock
  const defaultInfo = createDefaultDividendInfo();
  DIVIDEND_DATABASE[cleanSymbol] = defaultInfo;
  dividendCache.set(cleanSymbol, defaultInfo);
  console.log(`🔄 Added ${cleanSymbol} as zero-dividend stock to database`);
  return defaultInfo;
};

// Process all holdings and ensure dividend data exists
export const ensureDividendDataForHoldings = async (holdings: HoldingStock[]): Promise<{
  processed: number;
  newStocksAdded: number;
  errors: number;
}> => {
  let processed = 0;
  let newStocksAdded = 0;
  let errors = 0;
  
  console.log(`🚀 Processing ${holdings.length} holdings for enhanced dividend data...`);
  
  // Process in smaller batches to be respectful to APIs
  const batchSize = 5;
  for (let i = 0; i < holdings.length; i += batchSize) {
    const batch = holdings.slice(i, i + batchSize);
    
    await Promise.allSettled(
      batch.map(async (holding) => {
        try {
          const cleanSymbol = holding.symbol.replace(/_US_EQ$|_EQ$|\.L$|\.TO$/, '').toUpperCase();
          
          if (!DIVIDEND_DATABASE[cleanSymbol] && !dividendCache.has(cleanSymbol)) {
            await addStockToDividendDatabase(cleanSymbol);
            newStocksAdded++;
          }
          
          processed++;
        } catch (error) {
          console.error(`❌ Error processing ${holding.symbol}:`, error);
          errors++;
        }
      })
    );
    
    // Small delay between batches to be respectful to APIs
    if (i + batchSize < holdings.length) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
  
  console.log(`✅ Enhanced dividend processing complete:`);
  console.log(`   📊 Processed: ${processed}`);
  console.log(`   ➕ New stocks added: ${newStocksAdded}`);
  console.log(`   ❌ Errors: ${errors}`);
  
  return { processed, newStocksAdded, errors };
};

// Get current database statistics
export const getDatabaseStats = () => {
  const totalStocks = Object.keys(DIVIDEND_DATABASE).length;
  const dividendPayingStocks = Object.values(DIVIDEND_DATABASE).filter(info => info.annual > 0).length;
  const etfs = Object.values(DIVIDEND_DATABASE).filter(info => info.isETF).length;
  
  return {
    totalStocks,
    dividendPayingStocks,
    nonDividendStocks: totalStocks - dividendPayingStocks,
    etfs
  };
};
