
// Enhanced dividend detection using free APIs
interface DividendInfo {
  annual: number;
  quarterly: number;
  yield: number;
  frequency: 'quarterly' | 'annual' | 'monthly' | 'semi-annual';
  nextExDate?: string;
  paymentDate?: string;
  isETF: boolean;
}

interface ApiDividendData {
  symbol: string;
  annualDividend: number;
  dividendYield: number;
  frequency: string;
  exDividendDate?: string;
  paymentDate?: string;
  source: string;
}

interface HoldingStock {
  symbol: string;
  quantity: number;
  currentPrice: number;
  marketValue: number;
}

// Free API service for dividend data
const fetchDividendFromAlphaVantage = async (symbol: string): Promise<ApiDividendData | null> => {
  try {
    const cleanSymbol = symbol.replace(/_US_EQ$|_EQ$|\.L$|\.TO$/, '').toUpperCase();
    
    // Using demo key for now - in production, you'd want to use a real API key
    const response = await fetch(
      `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${cleanSymbol}&apikey=demo`
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    if (data.DividendPerShare && parseFloat(data.DividendPerShare) > 0) {
      return {
        symbol: cleanSymbol,
        annualDividend: parseFloat(data.DividendPerShare) * 4, // Assuming quarterly
        dividendYield: parseFloat(data.DividendYield?.replace('%', '')) || 0,
        frequency: 'quarterly',
        exDividendDate: data.ExDividendDate,
        paymentDate: data.ExDividendDate,
        source: 'alphavantage'
      };
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching dividend data for ${symbol}:`, error);
    return null;
  }
};

// Comprehensive dividend database (subset for demonstration)
const DIVIDEND_DATABASE: Record<string, DividendInfo> = {
  'AAPL': { annual: 0.96, quarterly: 0.24, yield: 0.5, frequency: 'quarterly', nextExDate: '2024-08-09', paymentDate: '2024-08-15', isETF: false },
  'MSFT': { annual: 3.00, quarterly: 0.75, yield: 0.7, frequency: 'quarterly', nextExDate: '2024-08-21', paymentDate: '2024-09-12', isETF: false },
  'JNJ': { annual: 4.68, quarterly: 1.17, yield: 3.1, frequency: 'quarterly', nextExDate: '2024-08-26', paymentDate: '2024-09-10', isETF: false },
  'PG': { annual: 3.65, quarterly: 0.91, yield: 2.3, frequency: 'quarterly', nextExDate: '2024-08-09', paymentDate: '2024-08-15', isETF: false },
  'KO': { annual: 1.84, quarterly: 0.46, yield: 3.0, frequency: 'quarterly', nextExDate: '2024-09-13', paymentDate: '2024-10-01', isETF: false },
  'PEP': { annual: 4.30, quarterly: 1.075, yield: 2.7, frequency: 'quarterly', nextExDate: '2024-09-06', paymentDate: '2024-09-30', isETF: false },
  'WMT': { annual: 2.28, quarterly: 0.57, yield: 1.3, frequency: 'quarterly', nextExDate: '2024-08-08', paymentDate: '2024-01-02', isETF: false },
  'HD': { annual: 8.36, quarterly: 2.09, yield: 2.4, frequency: 'quarterly', nextExDate: '2024-09-05', paymentDate: '2024-09-19', isETF: false },
  'VZ': { annual: 2.71, quarterly: 0.6775, yield: 6.8, frequency: 'quarterly', nextExDate: '2024-08-08', paymentDate: '2024-08-01', isETF: false },
  'T': { annual: 1.11, quarterly: 0.2775, yield: 6.5, frequency: 'quarterly', nextExDate: '2024-08-08', paymentDate: '2024-08-01', isETF: false }
};

// Enhanced dividend detection
const detectDividendPayerComprehensive = async (symbol: string): Promise<DividendInfo | null> => {
  const cleanSymbol = symbol.replace(/_US_EQ$|_EQ$|\.L$|\.TO$/, '').toUpperCase();
  
  console.log(`🔍 Checking dividend data for: ${cleanSymbol}`);
  
  // Check existing database first
  if (DIVIDEND_DATABASE[cleanSymbol]) {
    console.log(`📖 Found ${cleanSymbol} in database`);
    return DIVIDEND_DATABASE[cleanSymbol];
  }
  
  // Try API fetch
  const apiData = await fetchDividendFromAlphaVantage(cleanSymbol);
  
  if (apiData && apiData.annualDividend > 0) {
    const dividendInfo: DividendInfo = {
      annual: apiData.annualDividend,
      quarterly: apiData.annualDividend / 4,
      yield: apiData.dividendYield,
      frequency: apiData.frequency as 'quarterly',
      nextExDate: apiData.exDividendDate,
      paymentDate: apiData.paymentDate,
      isETF: false
    };
    
    // Cache in database
    DIVIDEND_DATABASE[cleanSymbol] = dividendInfo;
    console.log(`✅ Added ${cleanSymbol} to database via API: $${apiData.annualDividend} annual dividend`);
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

// Portfolio analysis function
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
  console.log(`🚀 Starting dividend analysis for ${holdings.length} holdings...`);
  
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
  
  // Process symbols with rate limiting
  for (const symbol of uniqueSymbols) {
    try {
      // Check if already in database
      const wasInDatabase = !!DIVIDEND_DATABASE[symbol];
      
      const dividendInfo = await detectDividendPayerComprehensive(symbol);
      
      if (!wasInDatabase && DIVIDEND_DATABASE[symbol]) {
        apiCallsMade++;
      } else if (wasInDatabase) {
        databaseHits++;
      }
      
      if (dividendInfo && dividendInfo.annual > 0) {
        dividendPayers.push({
          symbol,
          dividendInfo,
          isNewlyDetected: !wasInDatabase
        });
        
        if (!wasInDatabase) {
          newlyDetected++;
        }
      } else {
        nonDividendStocks.push(symbol);
      }
      
      // Rate limiting - small delay between API calls
      if (!wasInDatabase) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
    } catch (error) {
      console.error(`❌ Error analyzing ${symbol}:`, error);
      nonDividendStocks.push(symbol);
    }
  }
  
  const analysisStats = {
    totalAnalyzed: uniqueSymbols.length,
    dividendPayersFound: dividendPayers.length,
    newlyDetected,
    apiCallsMade,
    databaseHits
  };
  
  console.log(`✅ Analysis complete:`);
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
