
import { supabase } from "@/integrations/supabase/client";
import { Dividend, DividendPortfolio } from "@/models/dividend";
import { usingMockCredentials } from "@/utils/authUtils";

// Mock data for offline development
const mockDividends: Dividend[] = [
  {
    id: "div-1",
    symbol: "AAPL",
    company: "Apple Inc.",
    amount: 0.24,
    currency: "USD",
    exDate: "2025-05-09",
    paymentDate: "2025-05-18",
    yield: 0.51,
    frequency: "quarterly",
    growth: 4.3,
    isSafe: true,
    status: "pending"
  },
  {
    id: "div-2",
    symbol: "MSFT",
    company: "Microsoft Corporation",
    amount: 0.75,
    currency: "USD",
    exDate: "2025-05-15",
    paymentDate: "2025-06-10",
    yield: 0.82,
    frequency: "quarterly",
    growth: 10.2,
    isSafe: true,
    status: "pending"
  },
  {
    id: "div-3",
    symbol: "JNJ",
    company: "Johnson & Johnson",
    amount: 1.19,
    currency: "USD",
    exDate: "2025-04-22",
    paymentDate: "2025-05-25",
    yield: 3.1,
    frequency: "quarterly",
    growth: 6.1,
    isSafe: true,
    status: "paid"
  },
  {
    id: "div-4",
    symbol: "PG",
    company: "Procter & Gamble Co",
    amount: 0.9407,
    currency: "USD",
    exDate: "2025-04-18",
    paymentDate: "2025-05-20",
    yield: 2.4,
    frequency: "quarterly",
    growth: 5.0,
    isSafe: true,
    status: "paid"
  },
  {
    id: "div-5",
    symbol: "KO",
    company: "Coca-Cola Co",
    amount: 0.46,
    currency: "USD",
    exDate: "2025-05-28",
    paymentDate: "2025-06-15",
    yield: 3.0,
    frequency: "quarterly",
    growth: 4.8,
    isSafe: true,
    status: "pending"
  }
];

// Get upcoming dividends with real Trading212 data
export const getUpcomingDividends = async (userId: string): Promise<Dividend[]> => {
  console.log("Fetching upcoming dividends for user:", userId);
  
  try {
    // Check if this is a Trading212 connected portfolio
    const trading212PortfolioId = localStorage.getItem('trading212_portfolio_id');
    
    if (trading212PortfolioId) {
      console.log('Fetching real Trading212 dividend data');
      
      // Call the Trading212 sync function to get real dividend data
      const { data, error } = await supabase.functions.invoke('trading212-sync', {
        body: { portfolioId: trading212PortfolioId }
      });

      if (error) {
        console.error('Error fetching Trading212 dividends:', error);
        return mockDividends.filter(d => d.status === 'pending');
      }

      if (data?.success && data.data.positions) {
        // Convert Trading212 positions with dividend info to our dividend format
        const realDividends: Dividend[] = data.data.positions
          .filter((position: any) => position.dividendInfo && position.dividendInfo.annualDividend > 0)
          .map((position: any, index: number) => ({
            id: `trading212-div-${index}`,
            symbol: position.symbol,
            company: position.symbol, // Trading212 doesn't provide company names
            amount: position.dividendInfo.quarterlyDividend / (position.quantity || 1), // Dividend per share
            currency: "USD",
            exDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Next month
            paymentDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 45 days from now
            yield: position.dividendInfo.yield,
            frequency: "quarterly" as const,
            growth: 5.0, // Default growth assumption
            isSafe: true,
            status: "pending" as const
          }));
          
        console.log('Real Trading212 dividends loaded:', realDividends);
        return realDividends;
      }
    }
    
    // Fall back to mock data
    const upcomingDividends = mockDividends.filter(d => d.status === 'pending');
    console.log("Found upcoming dividends:", upcomingDividends);
    return upcomingDividends;
  } catch (error) {
    console.error('Error fetching dividends:', error);
    return mockDividends.filter(d => d.status === 'pending');
  }
};

// Get dividend portfolio summary with real Trading212 data
export const getDividendPortfolio = async (userId: string): Promise<DividendPortfolio | null> => {
  console.log("Fetching dividend portfolio for user:", userId);
  
  try {
    // Check if this is a Trading212 connected portfolio
    const trading212PortfolioId = localStorage.getItem('trading212_portfolio_id');
    
    if (trading212PortfolioId) {
      console.log('Fetching real Trading212 portfolio dividend data');
      
      // Call the Trading212 sync function to get real dividend data
      const { data, error } = await supabase.functions.invoke('trading212-sync', {
        body: { portfolioId: trading212PortfolioId }
      });

      if (error) {
        console.error('Error fetching Trading212 portfolio data:', error);
        const portfolio = {...mockDividendPortfolio, userId};
        return portfolio;
      }

      if (data?.success && data.data.dividendMetrics) {
        const metrics = data.data.dividendMetrics;
        
        const realPortfolio: DividendPortfolio = {
          id: trading212PortfolioId,
          name: "Trading212 Dividend Portfolio",
          userId: userId,
          annualIncome: metrics.annualIncome || 0,
          monthlyAverage: metrics.monthlyAverage || 0,
          totalHoldings: metrics.dividendPayingStocks || 0,
          yieldOnCost: metrics.portfolioYield || 0,
          metrics: [
            {
              name: "Annual Income",
              value: `$${(metrics.annualIncome || 0).toFixed(2)}`, 
              changePercent: 7.2,
              changeValue: `+$${((metrics.annualIncome || 0) * 0.072).toFixed(2)}`,
              isPositive: true
            },
            {
              name: "Monthly Average",
              value: `$${(metrics.monthlyAverage || 0).toFixed(2)}`,
              changePercent: 7.2,
              changeValue: `+$${((metrics.monthlyAverage || 0) * 0.072).toFixed(2)}`,
              isPositive: true
            },
            {
              name: "Dividend Stocks",
              value: `${metrics.dividendPayingStocks || 0}`,
              changePercent: 0,
              changeValue: "0",
              isPositive: true
            },
            {
              name: "Portfolio Yield",
              value: `${(metrics.portfolioYield || 0).toFixed(2)}%`,
              changePercent: 0.3,
              changeValue: "+0.3%",
              isPositive: true
            }
          ],
          dividends: await getUpcomingDividends(userId)
        };
        
        console.log("Returning real Trading212 portfolio data:", realPortfolio);
        return realPortfolio;
      }
    }
    
    // Fall back to mock portfolio data
    const portfolio = {...mockDividendPortfolio, userId};
    console.log("Returning mock portfolio data:", portfolio);
    return portfolio;
  } catch (error) {
    console.error('Error fetching dividend portfolio:', error);
    const portfolio = {...mockDividendPortfolio, userId};
    return portfolio;
  }
};

const mockDividendPortfolio: DividendPortfolio = {
  id: "port-1",
  name: "Dividend Growth Portfolio",
  userId: "mock-user",
  annualIncome: 3249.86,
  monthlyAverage: 270.82,
  totalHoldings: 22,
  yieldOnCost: 3.1,
  metrics: [
    {
      name: "Annual Income",
      value: "$3,249.86", 
      changePercent: 7.2,
      changeValue: "+$218.45",
      isPositive: true
    },
    {
      name: "Monthly Average",
      value: "$270.82",
      changePercent: 7.2,
      changeValue: "+$18.20",
      isPositive: true
    },
    {
      name: "Dividend Safety",
      value: "92%",
      changePercent: 2,
      changeValue: "+2%",
      isPositive: true
    },
    {
      name: "Yield on Cost",
      value: "3.1%",
      changePercent: 0.3,
      changeValue: "+0.3%",
      isPositive: true
    }
  ],
  dividends: mockDividends
};

// Get dividend safety metrics (inspired by Simply Safe Dividends)
export const getDividendSafety = async (symbol: string): Promise<{
  safetyScore: number;
  payoutRatio: number;
  debtToEquity: number;
  dividendGrowth: number;
  isSafe: boolean;
}> => {
  // In a real implementation, this would call the backend API
  // For now, return mock data based on the symbol
  const safeties: {[key: string]: any} = {
    'AAPL': { safetyScore: 95, payoutRatio: 14.8, debtToEquity: 1.2, dividendGrowth: 4.3, isSafe: true },
    'MSFT': { safetyScore: 98, payoutRatio: 27.2, debtToEquity: 0.4, dividendGrowth: 10.2, isSafe: true },
    'JNJ': { safetyScore: 96, payoutRatio: 43.5, debtToEquity: 0.5, dividendGrowth: 6.1, isSafe: true },
    'PG': { safetyScore: 92, payoutRatio: 58.1, debtToEquity: 0.7, dividendGrowth: 5.0, isSafe: true },
    'KO': { safetyScore: 90, payoutRatio: 68.5, debtToEquity: 1.8, dividendGrowth: 4.8, isSafe: true },
  };
  
  return safeties[symbol] || { 
    safetyScore: 85, 
    payoutRatio: 50, 
    debtToEquity: 1.0, 
    dividendGrowth: 3.0, 
    isSafe: true 
  };
};
