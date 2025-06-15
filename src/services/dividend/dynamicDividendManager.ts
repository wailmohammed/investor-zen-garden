
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

// Fetch dividend data from external API
const fetchDividendFromAPI = async (symbol: string): Promise<DividendInfo | null> => {
  try {
    console.log(`Fetching dividend data for new stock: ${symbol}`);
    
    // Clean symbol for API call
    const cleanSymbol = symbol.replace(/_US_EQ$|_EQ$|\.L$|\.TO$/, '');
    
    // Try Alpha Vantage first (free tier)
    const response = await fetch(
      `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${cleanSymbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
    );
    
    if (!response.ok) {
      console.warn(`API request failed for ${symbol}`);
      return null;
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
      
      console.log(`Successfully fetched dividend data for ${symbol}:`, dividendInfo);
      return dividendInfo;
    }
    
    // If no dividend data, return zero dividend info
    return {
      annual: 0,
      quarterly: 0,
      yield: 0,
      frequency: 'quarterly',
      nextExDate: '',
      paymentDate: '',
      isETF: false
    };
    
  } catch (error) {
    console.error(`Error fetching dividend data for ${symbol}:`, error);
    return null;
  }
};

// Add new stock to dividend database
export const addStockToDividendDatabase = async (symbol: string): Promise<DividendInfo> => {
  const cleanSymbol = symbol.toUpperCase();
  
  // Check cache first
  if (dividendCache.has(cleanSymbol)) {
    return dividendCache.get(cleanSymbol)!;
  }
  
  // Check if already in database
  if (DIVIDEND_DATABASE[cleanSymbol]) {
    dividendCache.set(cleanSymbol, DIVIDEND_DATABASE[cleanSymbol]);
    return DIVIDEND_DATABASE[cleanSymbol];
  }
  
  // Fetch from API
  const dividendInfo = await fetchDividendFromAPI(cleanSymbol);
  
  if (dividendInfo) {
    // Add to database and cache
    DIVIDEND_DATABASE[cleanSymbol] = dividendInfo;
    dividendCache.set(cleanSymbol, dividendInfo);
    console.log(`Added ${cleanSymbol} to dividend database`);
    return dividendInfo;
  }
  
  // Default to zero dividend stock
  const defaultInfo: DividendInfo = {
    annual: 0,
    quarterly: 0,
    yield: 0,
    frequency: 'quarterly',
    nextExDate: '',
    paymentDate: '',
    isETF: false
  };
  
  DIVIDEND_DATABASE[cleanSymbol] = defaultInfo;
  dividendCache.set(cleanSymbol, defaultInfo);
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
  
  console.log(`Processing ${holdings.length} holdings for dividend data`);
  
  // Process in batches to avoid overwhelming APIs
  const batchSize = 10;
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
          console.error(`Error processing ${holding.symbol}:`, error);
          errors++;
        }
      })
    );
    
    // Small delay between batches to be respectful to APIs
    if (i + batchSize < holdings.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  console.log(`Dividend data processing complete: ${processed} processed, ${newStocksAdded} new stocks added, ${errors} errors`);
  
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
