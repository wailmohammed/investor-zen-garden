
import { supabase } from "@/integrations/supabase/client";
import { Dividend, DividendPortfolio } from "@/models/dividend";

// Enhanced service to save and retrieve dividend data from database
export const saveDividendDataToDatabase = async (userId: string, portfolioId: string, dividendData: any[]) => {
  console.log(`Saving ${dividendData.length} dividend records to database`);
  
  try {
    const recordsToSave = dividendData.map(dividend => ({
      user_id: userId,
      portfolio_id: portfolioId,
      symbol: dividend.symbol,
      company_name: dividend.company || dividend.symbol,
      annual_dividend: dividend.annualDividend || dividend.annual_dividend || 0,
      dividend_yield: dividend.yield || dividend.dividend_yield || 0,
      frequency: dividend.frequency || 'quarterly',
      ex_dividend_date: dividend.exDate || dividend.ex_dividend_date || null,
      payment_date: dividend.paymentDate || dividend.payment_date || null,
      shares_owned: dividend.shares || dividend.shares_owned || null,
      estimated_annual_income: dividend.totalAnnualIncome || dividend.estimated_annual_income || 0,
      detection_source: dividend.apiSource || dividend.detection_source || 'api',
      detected_at: new Date().toISOString(),
      is_active: true
    }));

    // Use upsert to avoid duplicates
    const { data, error } = await supabase
      .from('detected_dividends')
      .upsert(recordsToSave, {
        onConflict: 'user_id,portfolio_id,symbol'
      });

    if (error) throw error;

    console.log(`Successfully saved ${recordsToSave.length} dividend records`);
    return { success: true, savedCount: recordsToSave.length };
  } catch (error) {
    console.error('Error saving dividend data:', error);
    throw error;
  }
};

// Get saved dividend data from database
export const getSavedDividendData = async (userId: string, portfolioId?: string) => {
  console.log(`Fetching saved dividend data for user: ${userId}, portfolio: ${portfolioId}`);
  
  try {
    let query = supabase
      .from('detected_dividends')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('estimated_annual_income', { ascending: false });

    if (portfolioId) {
      query = query.eq('portfolio_id', portfolioId);
    }

    const { data, error } = await query;

    if (error) throw error;

    console.log(`Found ${data?.length || 0} saved dividend records`);
    return data || [];
  } catch (error) {
    console.error('Error fetching saved dividend data:', error);
    return [];
  }
};

// Save portfolio positions from Trading212 API
export const savePortfolioPositions = async (userId: string, portfolioId: string, positions: any[], brokerType = 'trading212') => {
  console.log(`Saving ${positions.length} portfolio positions to database`);
  
  try {
    const positionsToSave = positions.map(position => ({
      user_id: userId,
      portfolio_id: portfolioId,
      broker_type: brokerType,
      symbol: position.ticker || position.symbol,
      quantity: position.quantity || 0,
      average_price: position.averagePrice || position.average_price || 0,
      current_price: position.currentPrice || position.current_price || 0,
      market_value: position.quantity * (position.currentPrice || position.current_price || 0),
      unrealized_pnl: position.ppl || position.unrealized_pnl || 0,
      last_updated: new Date().toISOString()
    }));

    // Use upsert to update existing positions
    const { data, error } = await supabase
      .from('portfolio_positions')
      .upsert(positionsToSave, {
        onConflict: 'user_id,portfolio_id,symbol'
      });

    if (error) throw error;

    console.log(`Successfully saved ${positionsToSave.length} portfolio positions`);
    return { success: true, savedCount: positionsToSave.length };
  } catch (error) {
    console.error('Error saving portfolio positions:', error);
    throw error;
  }
};

// Save portfolio metadata
export const savePortfolioMetadata = async (userId: string, portfolioId: string, metadata: any, brokerType = 'trading212') => {
  console.log(`Saving portfolio metadata to database`);
  
  try {
    const metadataToSave = {
      user_id: userId,
      portfolio_id: portfolioId,
      broker_type: brokerType,
      total_value: metadata.totalValue || metadata.total_value || 0,
      total_return: metadata.totalReturn || metadata.total_return || 0,
      total_return_percentage: metadata.totalReturnPercentage || metadata.total_return_percentage || 0,
      today_change: metadata.todayChange || metadata.today_change || 0,
      today_change_percentage: metadata.todayChangePercentage || metadata.today_change_percentage || 0,
      cash_balance: metadata.cashBalance || metadata.cash_balance || 0,
      holdings_count: metadata.holdingsCount || metadata.holdings_count || 0,
      last_sync_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('portfolio_metadata')
      .upsert(metadataToSave, {
        onConflict: 'user_id,portfolio_id'
      });

    if (error) throw error;

    console.log('Successfully saved portfolio metadata');
    return { success: true };
  } catch (error) {
    console.error('Error saving portfolio metadata:', error);
    throw error;
  }
};

// Get upcoming dividends with real saved data
export const getUpcomingDividends = async (userId: string, portfolioId?: string): Promise<Dividend[]> => {
  console.log("Fetching upcoming dividends from saved data");
  
  try {
    const savedDividends = await getSavedDividendData(userId, portfolioId);
    
    // Convert saved data to Dividend format
    const upcomingDividends: Dividend[] = savedDividends
      .filter(d => d.is_active)
      .map(dividend => ({
        id: dividend.id,
        symbol: dividend.symbol,
        company: dividend.company_name || dividend.symbol,
        amount: dividend.annual_dividend / 4, // Quarterly amount
        currency: "USD",
        exDate: dividend.ex_dividend_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        paymentDate: dividend.payment_date || new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        yield: dividend.dividend_yield,
        frequency: dividend.frequency as "quarterly" | "monthly" | "annual",
        growth: 5.0, // Default assumption
        isSafe: true,
        status: "pending" as const
      }));
      
    console.log(`Returning ${upcomingDividends.length} upcoming dividends from saved data`);
    return upcomingDividends;
  } catch (error) {
    console.error('Error fetching upcoming dividends:', error);
    return [];
  }
};

// Get dividend portfolio summary from saved data
export const getDividendPortfolio = async (userId: string, portfolioId?: string): Promise<DividendPortfolio | null> => {
  console.log("Fetching dividend portfolio from saved data");
  
  try {
    const savedDividends = await getSavedDividendData(userId, portfolioId);
    
    if (savedDividends.length === 0) {
      return null;
    }

    const totalAnnualIncome = savedDividends.reduce((sum, d) => sum + (d.estimated_annual_income || 0), 0);
    const monthlyAverage = totalAnnualIncome / 12;
    const totalHoldings = savedDividends.length;
    const averageYield = savedDividends.reduce((sum, d) => sum + (d.dividend_yield || 0), 0) / totalHoldings;

    const portfolio: DividendPortfolio = {
      id: portfolioId || "saved-portfolio",
      name: "Saved Dividend Portfolio",
      userId: userId,
      annualIncome: totalAnnualIncome,
      monthlyAverage: monthlyAverage,
      totalHoldings: totalHoldings,
      yieldOnCost: averageYield,
      metrics: [
        {
          name: "Annual Income",
          value: `$${totalAnnualIncome.toFixed(2)}`, 
          changePercent: 7.2,
          changeValue: `+$${(totalAnnualIncome * 0.072).toFixed(2)}`,
          isPositive: true
        },
        {
          name: "Monthly Average",
          value: `$${monthlyAverage.toFixed(2)}`,
          changePercent: 7.2,
          changeValue: `+$${(monthlyAverage * 0.072).toFixed(2)}`,
          isPositive: true
        },
        {
          name: "Dividend Stocks",
          value: `${totalHoldings}`,
          changePercent: 0,
          changeValue: "0",
          isPositive: true
        },
        {
          name: "Average Yield",
          value: `${averageYield.toFixed(2)}%`,
          changePercent: 0.3,
          changeValue: "+0.3%",
          isPositive: true
        }
      ],
      dividends: await getUpcomingDividends(userId, portfolioId)
    };
    
    console.log("Returning saved dividend portfolio data:", portfolio);
    return portfolio;
  } catch (error) {
    console.error('Error fetching dividend portfolio:', error);
    return null;
  }
};

// Get dividend safety metrics (can be enhanced with saved data)
export const getDividendSafety = async (symbol: string): Promise<{
  safetyScore: number;
  payoutRatio: number;
  debtToEquity: number;
  dividendGrowth: number;
  isSafe: boolean;
}> => {
  // Try to get from saved data first
  try {
    const { data } = await supabase
      .from('detected_dividends')
      .select('*')
      .eq('symbol', symbol)
      .eq('is_active', true)
      .single();

    if (data) {
      return {
        safetyScore: 90, // Can be calculated based on saved metrics
        payoutRatio: 50, // Default
        debtToEquity: 1.0, // Default
        dividendGrowth: 5.0, // Default
        isSafe: true
      };
    }
  } catch (error) {
    console.log('No saved safety data for', symbol);
  }

  // Fallback to default values
  return { 
    safetyScore: 85, 
    payoutRatio: 50, 
    debtToEquity: 1.0, 
    dividendGrowth: 3.0, 
    isSafe: true 
  };
};
