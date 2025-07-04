import { supabase } from "@/integrations/supabase/client";
import { Dividend, DividendPortfolio } from "@/models/dividend";

// Enhanced service to save and retrieve dividend data from database with duplicate prevention
export const saveDividendDataToDatabase = async (userId: string, portfolioId: string, dividendData: any[]) => {
  console.log(`Checking existing data before saving ${dividendData.length} dividend records`);
  
  try {
    // First, check what data already exists
    const { data: existingData } = await supabase
      .from('detected_dividends')
      .select('symbol, annual_dividend, dividend_yield')
      .eq('user_id', userId)
      .eq('portfolio_id', portfolioId)
      .eq('is_active', true);

    const existingSymbols = new Map();
    if (existingData) {
      existingData.forEach(item => {
        existingSymbols.set(item.symbol, {
          annual_dividend: item.annual_dividend,
          dividend_yield: item.dividend_yield
        });
      });
    }

    // Filter out records that are identical to existing ones
    const newRecords = [];
    const updateRecords = [];

    dividendData.forEach(dividend => {
      const symbol = dividend.symbol;
      const existing = existingSymbols.get(symbol);
      
      const recordData = {
        user_id: userId,
        portfolio_id: portfolioId,
        symbol: symbol,
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
      };

      if (!existing) {
        // New record
        newRecords.push(recordData);
      } else {
        // Check if data has changed
        const hasChanged = 
          existing.annual_dividend !== recordData.annual_dividend ||
          existing.dividend_yield !== recordData.dividend_yield;
        
        if (hasChanged) {
          updateRecords.push(recordData);
        }
      }
    });

    console.log(`Found ${newRecords.length} new records and ${updateRecords.length} records to update`);

    let savedCount = 0;

    // Insert new records
    if (newRecords.length > 0) {
      const { error: insertError } = await supabase
        .from('detected_dividends')
        .insert(newRecords);

      if (insertError) throw insertError;
      savedCount += newRecords.length;
    }

    // Update existing records
    if (updateRecords.length > 0) {
      for (const record of updateRecords) {
        const { error: updateError } = await supabase
          .from('detected_dividends')
          .upsert(record, { onConflict: 'user_id,portfolio_id,symbol' });

        if (updateError) throw updateError;
      }
      savedCount += updateRecords.length;
    }

    console.log(`Successfully processed ${savedCount} dividend records (${newRecords.length} new, ${updateRecords.length} updated)`);
    return { success: true, savedCount, newCount: newRecords.length, updatedCount: updateRecords.length };
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

// Enhanced portfolio positions saving with duplicate prevention
export const savePortfolioPositions = async (userId: string, portfolioId: string, positions: any[], brokerType = 'trading212') => {
  console.log(`Checking existing positions before saving ${positions.length} portfolio positions`);
  
  try {
    // Check existing positions
    const { data: existingPositions } = await supabase
      .from('portfolio_positions')
      .select('symbol, quantity, current_price, market_value')
      .eq('user_id', userId)
      .eq('portfolio_id', portfolioId);

    const existingMap = new Map();
    if (existingPositions) {
      existingPositions.forEach(pos => {
        existingMap.set(pos.symbol, {
          quantity: pos.quantity,
          current_price: pos.current_price,
          market_value: pos.market_value
        });
      });
    }

    const newPositions = [];
    const updatePositions = [];

    positions.forEach(position => {
      const symbol = position.ticker || position.symbol;
      const existing = existingMap.get(symbol);
      
      const positionData = {
        user_id: userId,
        portfolio_id: portfolioId,
        broker_type: brokerType,
        symbol: symbol,
        quantity: position.quantity || 0,
        average_price: position.averagePrice || position.average_price || 0,
        current_price: position.currentPrice || position.current_price || 0,
        market_value: position.quantity * (position.currentPrice || position.current_price || 0),
        unrealized_pnl: position.ppl || position.unrealized_pnl || 0,
        last_updated: new Date().toISOString()
      };

      if (!existing) {
        newPositions.push(positionData);
      } else {
        // Check if significant data has changed (price or quantity)
        const priceChanged = Math.abs(existing.current_price - positionData.current_price) > 0.01;
        const quantityChanged = Math.abs(existing.quantity - positionData.quantity) > 0.000001;
        
        if (priceChanged || quantityChanged) {
          updatePositions.push(positionData);
        }
      }
    });

    console.log(`Found ${newPositions.length} new positions and ${updatePositions.length} positions to update`);

    let savedCount = 0;

    // Insert new positions
    if (newPositions.length > 0) {
      const { error: insertError } = await supabase
        .from('portfolio_positions')
        .insert(newPositions);

      if (insertError) throw insertError;
      savedCount += newPositions.length;
    }

    // Update existing positions
    if (updatePositions.length > 0) {
      for (const position of updatePositions) {
        const { error: updateError } = await supabase
          .from('portfolio_positions')
          .upsert(position, { onConflict: 'user_id,portfolio_id,symbol' });

        if (updateError) throw updateError;
      }
      savedCount += updatePositions.length;
    }

    console.log(`Successfully processed ${savedCount} positions (${newPositions.length} new, ${updatePositions.length} updated)`);
    return { success: true, savedCount, newCount: newPositions.length, updatedCount: updatePositions.length };
  } catch (error) {
    console.error('Error saving portfolio positions:', error);
    throw error;
  }
};

// Enhanced portfolio metadata saving with change detection
export const savePortfolioMetadata = async (userId: string, portfolioId: string, metadata: any, brokerType = 'trading212') => {
  console.log(`Checking existing metadata before saving portfolio metadata`);
  
  try {
    // Check if metadata already exists and if it has changed
    const { data: existingMetadata } = await supabase
      .from('portfolio_metadata')
      .select('*')
      .eq('user_id', userId)
      .eq('portfolio_id', portfolioId)
      .single();

    const newMetadata = {
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

    // Check if update is needed
    let shouldUpdate = !existingMetadata;
    
    if (existingMetadata) {
      // Check if significant values have changed
      const valueChanged = Math.abs(existingMetadata.total_value - newMetadata.total_value) > 0.01;
      const returnChanged = Math.abs(existingMetadata.total_return - newMetadata.total_return) > 0.01;
      const todayChanged = Math.abs(existingMetadata.today_change - newMetadata.today_change) > 0.01;
      
      shouldUpdate = valueChanged || returnChanged || todayChanged;
    }

    if (shouldUpdate) {
      const { error } = await supabase
        .from('portfolio_metadata')
        .upsert(newMetadata, { onConflict: 'user_id,portfolio_id' });

      if (error) throw error;

      console.log('Successfully updated portfolio metadata');
      return { success: true, updated: true };
    } else {
      console.log('Portfolio metadata unchanged, skipping update');
      return { success: true, updated: false };
    }

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
