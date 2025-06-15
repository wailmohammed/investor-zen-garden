
// Free API service for dividend data using multiple sources
export interface ApiDividendData {
  symbol: string;
  annualDividend: number;
  dividendYield: number;
  exDividendDate: string;
  paymentDate: string;
  frequency: string;
  lastDividendAmount: number;
  isDividendPayer: boolean;
  source: string;
}

// Yahoo Finance API (free, no key required)
export const fetchYahooFinanceDividend = async (symbol: string): Promise<ApiDividendData | null> => {
  try {
    console.log(`🔍 Fetching from Yahoo Finance: ${symbol}`);
    
    // Yahoo Finance API endpoint (free)
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d&includePrePost=false&events=div%2Csplit`
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    // Try to get dividend data from events
    const events = data?.chart?.result?.[0]?.events;
    if (events?.dividends) {
      const dividends = Object.values(events.dividends) as any[];
      const lastDividend = dividends[dividends.length - 1];
      
      if (lastDividend && lastDividend.amount > 0) {
        return {
          symbol,
          annualDividend: lastDividend.amount * 4, // Estimate annual from last dividend
          dividendYield: 0, // Would need additional call for yield
          exDividendDate: new Date(lastDividend.date * 1000).toISOString().split('T')[0],
          paymentDate: '',
          frequency: 'quarterly',
          lastDividendAmount: lastDividend.amount,
          isDividendPayer: true,
          source: 'yahoo'
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error(`❌ Yahoo Finance error for ${symbol}:`, error);
    return null;
  }
};

// Alpha Vantage API (free tier)
export const fetchAlphaVantageDividend = async (symbol: string): Promise<ApiDividendData | null> => {
  try {
    console.log(`🔍 Fetching from Alpha Vantage: ${symbol}`);
    
    const response = await fetch(
      `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=demo`
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    if (data.DividendPerShare && parseFloat(data.DividendPerShare) > 0) {
      return {
        symbol,
        annualDividend: parseFloat(data.DividendPerShare) || 0,
        dividendYield: parseFloat(data.DividendYield?.replace('%', '')) || 0,
        exDividendDate: data.ExDividendDate || '',
        paymentDate: data.DividendDate || '',
        frequency: 'quarterly',
        lastDividendAmount: parseFloat(data.DividendPerShare) / 4 || 0,
        isDividendPayer: parseFloat(data.DividendPerShare) > 0,
        source: 'alphavantage'
      };
    }
    
    return null;
  } catch (error) {
    console.error(`❌ Alpha Vantage error for ${symbol}:`, error);
    return null;
  }
};

// Financial Modeling Prep API (free tier)
export const fetchFMPDividend = async (symbol: string): Promise<ApiDividendData | null> => {
  try {
    console.log(`🔍 Fetching from FMP: ${symbol}`);
    
    // Free endpoint - no API key required for basic data
    const response = await fetch(
      `https://financialmodelingprep.com/api/v3/profile/${symbol}`
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    if (data && data[0] && data[0].lastDiv > 0) {
      return {
        symbol,
        annualDividend: data[0].lastDiv * 4, // Estimate annual
        dividendYield: data[0].lastDiv / data[0].price * 100 * 4,
        exDividendDate: '',
        paymentDate: '',
        frequency: 'quarterly',
        lastDividendAmount: data[0].lastDiv,
        isDividendPayer: data[0].lastDiv > 0,
        source: 'fmp'
      };
    }
    
    return null;
  } catch (error) {
    console.error(`❌ FMP error for ${symbol}:`, error);
    return null;
  }
};

// Polygon.io API (free tier)
export const fetchPolygonDividend = async (symbol: string): Promise<ApiDividendData | null> => {
  try {
    console.log(`🔍 Fetching from Polygon: ${symbol}`);
    
    // Get dividends from last year
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const fromDate = oneYearAgo.toISOString().split('T')[0];
    const toDate = new Date().toISOString().split('T')[0];
    
    const response = await fetch(
      `https://api.polygon.io/v3/reference/dividends?ticker=${symbol}&ex_dividend_date.gte=${fromDate}&ex_dividend_date.lte=${toDate}&limit=10`
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const dividends = data.results;
      const totalDividends = dividends.reduce((sum: number, div: any) => sum + (div.cash_amount || 0), 0);
      const lastDividend = dividends[0];
      
      if (totalDividends > 0) {
        return {
          symbol,
          annualDividend: totalDividends,
          dividendYield: 0, // Would need stock price
          exDividendDate: lastDividend.ex_dividend_date || '',
          paymentDate: lastDividend.pay_date || '',
          frequency: dividends.length > 3 ? 'quarterly' : dividends.length > 1 ? 'semi-annual' : 'annual',
          lastDividendAmount: lastDividend.cash_amount || 0,
          isDividendPayer: true,
          source: 'polygon'
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error(`❌ Polygon error for ${symbol}:`, error);
    return null;
  }
};

// Combined API fetcher with fallbacks
export const fetchComprehensiveDividendData = async (symbol: string): Promise<ApiDividendData | null> => {
  const cleanSymbol = symbol.replace(/_US_EQ$|_EQ$|\.L$|\.TO$/, '').toUpperCase();
  
  console.log(`🚀 Comprehensive dividend search for: ${cleanSymbol}`);
  
  // Try multiple APIs in sequence
  const apis = [
    () => fetchYahooFinanceDividend(cleanSymbol),
    () => fetchAlphaVantageDividend(cleanSymbol),
    () => fetchFMPDividend(cleanSymbol),
    () => fetchPolygonDividend(cleanSymbol)
  ];
  
  for (const apiCall of apis) {
    try {
      const result = await apiCall();
      if (result && result.isDividendPayer) {
        console.log(`✅ Found dividend data for ${cleanSymbol} via ${result.source}: $${result.annualDividend}`);
        return result;
      }
    } catch (error) {
      console.log(`⚠️ API call failed for ${cleanSymbol}, trying next...`);
    }
    
    // Small delay between API calls
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`❌ No dividend data found for ${cleanSymbol} across all APIs`);
  return null;
};

// Batch process multiple symbols with rate limiting
export const batchFetchDividendData = async (symbols: string[]): Promise<Map<string, ApiDividendData>> => {
  const results = new Map<string, ApiDividendData>();
  const batchSize = 3; // Conservative rate limiting
  
  console.log(`🔄 Batch processing ${symbols.length} symbols for dividend data...`);
  
  for (let i = 0; i < symbols.length; i += batchSize) {
    const batch = symbols.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (symbol) => {
      const data = await fetchComprehensiveDividendData(symbol);
      if (data) {
        results.set(symbol, data);
      }
    });
    
    await Promise.allSettled(batchPromises);
    
    // Rate limiting delay between batches
    if (i + batchSize < symbols.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`📊 Processed batch ${Math.ceil((i + batchSize) / batchSize)}/${Math.ceil(symbols.length / batchSize)}`);
  }
  
  console.log(`✅ Batch processing complete: ${results.size}/${symbols.length} symbols found with dividend data`);
  return results;
};
