
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { usePortfolio } from './PortfolioContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DividendRecord {
  id: string;
  symbol: string;
  company_name: string;
  annual_dividend: number;
  dividend_yield: number;
  frequency: string;
  shares_owned: number;
  estimated_annual_income: number;
  detection_source: string;
  detected_at: string;
  is_active: boolean;
}

interface DividendDataState {
  dividends: DividendRecord[];
  loading: boolean;
  lastSync: string | null;
  apiCallsToday: number;
  maxApiCallsPerDay: number;
  canMakeApiCall: boolean;
}

interface DividendDataContextType extends DividendDataState {
  refreshDividendData: () => Promise<void>;
  getDividendSummary: () => {
    totalAnnualIncome: number;
    totalStocks: number;
    averageYield: number;
  };
}

const DividendDataContext = createContext<DividendDataContextType | undefined>(undefined);

export const useDividendData = () => {
  const context = useContext(DividendDataContext);
  if (!context) {
    throw new Error('useDividendData must be used within a DividendDataProvider');
  }
  return context;
};

export const DividendDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { selectedPortfolio } = usePortfolio();
  const { toast } = useToast();

  const [state, setState] = useState<DividendDataState>({
    dividends: [],
    loading: true,
    lastSync: null,
    apiCallsToday: 0,
    maxApiCallsPerDay: 4,
    canMakeApiCall: true
  });

  // Check API call limits
  const checkApiLimits = () => {
    const today = new Date().toDateString();
    const lastCallDate = localStorage.getItem('dividend_api_last_call_date');
    const callCount = parseInt(localStorage.getItem('dividend_api_calls_today') || '0');

    if (lastCallDate !== today) {
      localStorage.setItem('dividend_api_last_call_date', today);
      localStorage.setItem('dividend_api_calls_today', '0');
      setState(prev => ({ ...prev, apiCallsToday: 0, canMakeApiCall: true }));
    } else {
      const canMakeCall = callCount < state.maxApiCallsPerDay;
      setState(prev => ({ ...prev, apiCallsToday: callCount, canMakeApiCall: canMakeCall }));
    }
  };

  // Increment API call counter
  const incrementApiCalls = () => {
    const newCount = state.apiCallsToday + 1;
    localStorage.setItem('dividend_api_calls_today', newCount.toString());
    setState(prev => ({
      ...prev,
      apiCallsToday: newCount,
      canMakeApiCall: newCount < state.maxApiCallsPerDay
    }));
  };

  // Load saved dividend data from database
  const loadSavedDividendData = async () => {
    if (!user?.id || !selectedPortfolio) return;

    try {
      setState(prev => ({ ...prev, loading: true }));

      const { data, error } = await supabase
        .from('detected_dividends')
        .select('*')
        .eq('user_id', user.id)
        .eq('portfolio_id', selectedPortfolio)
        .eq('is_active', true)
        .order('estimated_annual_income', { ascending: false });

      if (error) throw error;

      const lastSyncTime = localStorage.getItem(`dividend_last_sync_${selectedPortfolio}`);

      setState(prev => ({
        ...prev,
        dividends: data || [],
        loading: false,
        lastSync: lastSyncTime
      }));

    } catch (error) {
      console.error('Error loading saved dividend data:', error);
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  // Check for portfolio changes and update dividend data
  const checkPortfolioChanges = async () => {
    if (!user?.id || !selectedPortfolio) return;

    try {
      // Get current portfolio positions from saved data
      const { data: positions, error: positionsError } = await supabase
        .from('portfolio_positions')
        .select('*')
        .eq('portfolio_id', selectedPortfolio)
        .eq('user_id', user.id);

      if (positionsError || !positions) return;

      // Get existing dividend records
      const { data: existingDividends, error: dividendsError } = await supabase
        .from('detected_dividends')
        .select('symbol, shares_owned')
        .eq('user_id', user.id)
        .eq('portfolio_id', selectedPortfolio)
        .eq('is_active', true);

      if (dividendsError) return;

      const existingMap = new Map(existingDividends?.map(d => [d.symbol, d.shares_owned]) || []);
      let hasChanges = false;

      // Check for quantity changes in existing dividend stocks
      for (const position of positions) {
        const cleanSymbol = position.symbol.replace(/_US_EQ$|_EQ$|\.L$|\.TO$/, '').toUpperCase();
        if (existingMap.has(cleanSymbol)) {
          const existingShares = existingMap.get(cleanSymbol);
          if (existingShares !== position.quantity) {
            hasChanges = true;
            console.log(`Shares changed for ${cleanSymbol}: ${existingShares} -> ${position.quantity}`);
            
            // Update shares and recalculate income
            await supabase
              .from('detected_dividends')
              .update({
                shares_owned: position.quantity,
                estimated_annual_income: position.quantity * 0, // Will be updated with actual dividend
                updated_at: new Date().toISOString()
              })
              .eq('user_id', user.id)
              .eq('portfolio_id', selectedPortfolio)
              .eq('symbol', cleanSymbol);
          }
        }
      }

      if (hasChanges) {
        console.log('Portfolio changes detected, refreshing dividend data');
        await loadSavedDividendData();
      }

    } catch (error) {
      console.error('Error checking portfolio changes:', error);
    }
  };

  // Auto-detect dividends from saved portfolio data
  const autoDetectFromPortfolioData = async () => {
    if (!user?.id || !selectedPortfolio) return;

    try {
      // Check if we have recent portfolio data
      const { data: positions, error: positionsError } = await supabase
        .from('portfolio_positions')
        .select('*')
        .eq('portfolio_id', selectedPortfolio)
        .eq('user_id', user.id);

      if (positionsError || !positions || positions.length === 0) return;

      console.log(`Auto-detecting dividends from ${positions.length} saved positions`);

      // Call dividend detection using saved portfolio data
      const { data, error } = await supabase.functions.invoke('dividend-detection', {
        body: {
          portfolioId: selectedPortfolio,
          userId: user.id,
          autoSave: true,
          usePortfolioData: true // Use saved portfolio data instead of API
        }
      });

      if (error) throw error;

      if (data?.success) {
        const currentTime = new Date().toLocaleString();
        localStorage.setItem(`dividend_last_sync_${selectedPortfolio}`, currentTime);

        setState(prev => ({ ...prev, lastSync: currentTime }));

        if (data.dividendStocksFound > 0) {
          toast({
            title: "Dividends Auto-Detected",
            description: `Found ${data.dividendStocksFound} dividend stocks from portfolio data`,
          });
        }

        await loadSavedDividendData();
      }

    } catch (error) {
      console.error('Error in auto-detection:', error);
    }
  };

  // Manual refresh dividend data with API sync
  const refreshDividendData = async () => {
    if (!user?.id || !selectedPortfolio) return;

    checkApiLimits();

    if (!state.canMakeApiCall) {
      toast({
        title: "Daily API Limit Reached",
        description: `You've used all ${state.maxApiCallsPerDay} API calls for today. Using saved data.`,
        variant: "destructive",
      });
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true }));

      const { data, error } = await supabase.functions.invoke('dividend-detection', {
        body: {
          portfolioId: selectedPortfolio,
          userId: user.id,
          autoSave: true
        }
      });

      if (error) throw error;

      if (data?.success) {
        incrementApiCalls();
        const currentTime = new Date().toLocaleString();
        localStorage.setItem(`dividend_last_sync_${selectedPortfolio}`, currentTime);

        setState(prev => ({ ...prev, lastSync: currentTime }));

        toast({
          title: "Data Synced Successfully",
          description: `Found ${data.dividendStocksFound || 0} dividend stocks. API calls remaining: ${state.maxApiCallsPerDay - state.apiCallsToday - 1}`,
        });

        await loadSavedDividendData();
      }

    } catch (error: any) {
      console.error('Error refreshing dividend data:', error);
      toast({
        title: "Sync Failed",
        description: error.message || 'Failed to sync dividend data. Using saved data.',
        variant: "destructive",
      });
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  // Get dividend summary
  const getDividendSummary = () => {
    const totalAnnualIncome = state.dividends.reduce((sum, d) => sum + d.estimated_annual_income, 0);
    const totalStocks = state.dividends.length;
    const averageYield = totalStocks > 0 
      ? state.dividends.reduce((sum, d) => sum + d.dividend_yield, 0) / totalStocks 
      : 0;

    return { totalAnnualIncome, totalStocks, averageYield };
  };

  // Auto-load and check for changes when portfolio changes
  useEffect(() => {
    if (user?.id && selectedPortfolio) {
      checkApiLimits();
      loadSavedDividendData();

      // Auto-detect from portfolio data if no recent dividend data
      const lastSync = localStorage.getItem(`dividend_last_sync_${selectedPortfolio}`);
      const shouldAutoDetect = !lastSync || 
        (Date.now() - new Date(lastSync).getTime()) > 4 * 60 * 60 * 1000; // 4 hours

      if (shouldAutoDetect) {
        setTimeout(() => {
          autoDetectFromPortfolioData();
        }, 2000); // Delay to allow portfolio data to load
      }

      // Check for portfolio changes periodically
      const changeCheckInterval = setInterval(() => {
        checkPortfolioChanges();
      }, 30000); // Check every 30 seconds

      return () => clearInterval(changeCheckInterval);
    }
  }, [user?.id, selectedPortfolio]);

  // Check limits on mount
  useEffect(() => {
    checkApiLimits();
  }, []);

  const contextValue: DividendDataContextType = {
    ...state,
    refreshDividendData,
    getDividendSummary
  };

  return (
    <DividendDataContext.Provider value={contextValue}>
      {children}
    </DividendDataContext.Provider>
  );
};
