
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

// Get upcoming dividends
export const getUpcomingDividends = async (userId: string): Promise<Dividend[]> => {
  console.log("Fetching upcoming dividends for user:", userId);
  
  // Always return mock data for now since we don't have real broker connections
  const upcomingDividends = mockDividends.filter(d => d.status === 'pending');
  console.log("Found upcoming dividends:", upcomingDividends);
  return upcomingDividends;
};

// Get dividend portfolio summary
export const getDividendPortfolio = async (userId: string): Promise<DividendPortfolio | null> => {
  console.log("Fetching dividend portfolio for user:", userId);
  
  // Always return mock portfolio data for now
  const portfolio = {...mockDividendPortfolio, userId};
  console.log("Returning portfolio data:", portfolio);
  return portfolio;
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
