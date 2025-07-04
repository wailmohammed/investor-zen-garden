
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { usePortfolio } from './PortfolioContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getSavedDividendData, saveDividendDataToDatabase } from '@/services/dividendService';

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
  syncApiDataToDatabase: () => Promise<void>;
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

  // Load saved dividend data from database
  const loadSavedDividendData = async () => {
    if (!user?.id || !selectedPortfolio) return;

    try {
      setState(prev => ({ ...prev, loading: true }));

      console.log('Loading saved dividend data from database');
      const savedData = await getSavedDividendData(user.id, selectedPortfolio);

      const lastSyncTime = localStorage.getItem(`dividend_last_sync_${selectedPortfolio}`);

      setState(prev => ({
        ...prev,
        dividends: savedData,
        loading: false,
        lastSync: lastSyncTime
      }));

      console.log(`Loaded ${savedData.length} dividend records from database`);

    } catch (error) {
      console.error('Error loading saved dividend data:', error);
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  // Sync API data to database
  const syncApiDataToDatabase = async () => {
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

      console.log('Syncing API data to database');

      // Call the dividend detection function with auto-save enabled
      const { data, error } = await supabase.functions.invoke('dividend-detection', {
        body: {
          portfolioId: selectedPortfolio,
          userId: user.id,
          autoSave: true, // This ensures API data is saved to database
          usePortfolioData: false // Use API, not cached data
        }
      });

      if (error) throw error;

      if (data?.success) {
        // Update API call counter
        const newCount = state.apiCallsToday + 1;
        localStorage.setItem('dividend_api_calls_today', newCount.toString());
        
        const currentTime = new Date().toLocaleString();
        localStorage.setItem(`dividend_last_sync_${selectedPortfolio}`, currentTime);

        setState(prev => ({
          ...prev,
          lastSync: currentTime,
          apiCallsToday: newCount,
          canMakeApiCall: newCount < state.maxApiCallsPerDay
        }));

        toast({
          title: "API Data Synced Successfully",
          description: `Saved ${data.dividendStocksFound || 0} dividend stocks to database. API calls remaining: ${state.maxApiCallsPerDay - newCount}`,
        });

        // Reload saved data to reflect changes
        await loadSavedDividendData();
      }

    } catch (error: any) {
      console.error('Error syncing API data:', error);
      toast({
        title: "Sync Failed",
        description: error.message || 'Failed to sync API data. Using saved data.',
        variant: "destructive",
      });
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  // Auto-detect from saved portfolio data
  const autoDetectFromSavedData = async () => {
    if (!user?.id || !selectedPortfolio) return;

    try {
      console.log('Auto-detecting dividends from saved portfolio data');

      const { data, error } = await supabase.functions.invoke('dividend-detection', {
        body: {
          portfolioId: selectedPortfolio,
          userId: user.id,
          autoSave: true,
          usePortfolioData: true // Use saved portfolio data
        }
      });

      if (error) throw error;

      if (data?.success && data.dividendStocksFound > 0) {
        const currentTime = new Date().toLocaleString();
        localStorage.setItem(`dividend_last_sync_${selectedPortfolio}`, currentTime);

        setState(prev => ({ ...prev, lastSync: currentTime }));

        toast({
          title: "Dividends Auto-Detected",
          description: `Found ${data.dividendStocksFound} dividend stocks from saved portfolio data`,
        });

        await loadSavedDividendData();
      }

    } catch (error) {
      console.error('Error in auto-detection from saved data:', error);
    }
  };

  // Refresh data (prioritize saved data, fallback to API if needed)
  const refreshDividendData = async () => {
    if (!user?.id || !selectedPortfolio) return;

    // First, try to load saved data
    await loadSavedDividendData();
    
    // If no saved data and API calls available, sync from API
    if (state.dividends.length === 0 && state.canMakeApiCall) {
      await syncApiDataToDatabase();
    }
  };

  // Get dividend summary from saved data
  const getDividendSummary = () => {
    const totalAnnualIncome = state.dividends.reduce((sum, d) => sum + (d.estimated_annual_income || 0), 0);
    const totalStocks = state.dividends.length;
    const averageYield = totalStocks > 0 
      ? state.dividends.reduce((sum, d) => sum + (d.dividend_yield || 0), 0) / totalStocks 
      : 0;

    return { totalAnnualIncome, totalStocks, averageYield };
  };

  // Load saved data when portfolio changes
  useEffect(() => {
    if (user?.id && selectedPortfolio) {
      checkApiLimits();
      loadSavedDividendData();

      // Auto-detect from saved data if no recent sync
      const lastSync = localStorage.getItem(`dividend_last_sync_${selectedPortfolio}`);
      const shouldAutoDetect = !lastSync || 
        (Date.now() - new Date(lastSync).getTime()) > 4 * 60 * 60 * 1000; // 4 hours

      if (shouldAutoDetect) {
        setTimeout(() => {
          autoDetectFromSavedData();
        }, 2000);
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
    syncApiDataToDatabase,
    getDividendSummary
  };

  return (
    <DividendDataContext.Provider value={contextValue}>
      {children}
    </DividendDataContext.Provider>
  );
};
