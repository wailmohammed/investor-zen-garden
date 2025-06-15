
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
  autoSyncEnabled: boolean;
}

interface DividendDataContextType extends DividendDataState {
  refreshDividendData: () => Promise<void>;
  toggleAutoSync: () => void;
  forceSyncData: () => Promise<void>;
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
    canMakeApiCall: true,
    autoSyncEnabled: true
  });

  // Check API call limits
  const checkApiLimits = () => {
    const today = new Date().toDateString();
    const lastCallDate = localStorage.getItem('dividend_api_last_call_date');
    const callCount = parseInt(localStorage.getItem('dividend_api_calls_today') || '0');

    if (lastCallDate !== today) {
      // Reset counter for new day
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

  // Refresh dividend data with API sync (respects limits)
  const refreshDividendData = async () => {
    if (!user?.id || !selectedPortfolio) return;

    checkApiLimits();

    if (!state.canMakeApiCall) {
      toast({
        title: "Daily API Limit Reached",
        description: `You've used all ${state.maxApiCallsPerDay} API calls for today. Showing saved data.`,
        variant: "destructive",
      });
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true }));

      // Call dividend detection with auto-save enabled
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

        // Reload saved data after sync
        await loadSavedDividendData();
      }

    } catch (error: any) {
      console.error('Error refreshing dividend data:', error);
      toast({
        title: "Sync Failed",
        description: error.message || 'Failed to sync dividend data. Showing saved data.',
        variant: "destructive",
      });
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  // Force sync (ignores limits, for admin use)
  const forceSyncData = async () => {
    if (!user?.id || !selectedPortfolio) return;

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
        const currentTime = new Date().toLocaleString();
        localStorage.setItem(`dividend_last_sync_${selectedPortfolio}`, currentTime);
        setState(prev => ({ ...prev, lastSync: currentTime }));

        toast({
          title: "Force Sync Complete",
          description: `Found ${data.dividendStocksFound || 0} dividend stocks`,
        });

        await loadSavedDividendData();
      }

    } catch (error: any) {
      console.error('Error in force sync:', error);
      toast({
        title: "Force Sync Failed",
        description: error.message || 'Failed to force sync data',
        variant: "destructive",
      });
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  // Toggle auto sync
  const toggleAutoSync = () => {
    const newAutoSync = !state.autoSyncEnabled;
    setState(prev => ({ ...prev, autoSyncEnabled: newAutoSync }));
    localStorage.setItem('dividend_auto_sync_enabled', newAutoSync.toString());
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

  // Auto-sync on portfolio change or initial load
  useEffect(() => {
    if (user?.id && selectedPortfolio) {
      checkApiLimits();
      loadSavedDividendData();

      // Auto-sync if enabled and within limits
      const autoSyncEnabled = localStorage.getItem('dividend_auto_sync_enabled') !== 'false';
      setState(prev => ({ ...prev, autoSyncEnabled }));

      if (autoSyncEnabled && state.canMakeApiCall) {
        const lastSync = localStorage.getItem(`dividend_last_sync_${selectedPortfolio}`);
        const shouldAutoSync = !lastSync || 
          (Date.now() - new Date(lastSync).getTime()) > 6 * 60 * 60 * 1000; // 6 hours

        if (shouldAutoSync) {
          refreshDividendData();
        }
      }
    }
  }, [user?.id, selectedPortfolio]);

  // Check limits on mount
  useEffect(() => {
    checkApiLimits();
  }, []);

  const contextValue: DividendDataContextType = {
    ...state,
    refreshDividendData,
    toggleAutoSync,
    forceSyncData,
    getDividendSummary
  };

  return (
    <DividendDataContext.Provider value={contextValue}>
      {children}
    </DividendDataContext.Provider>
  );
};
