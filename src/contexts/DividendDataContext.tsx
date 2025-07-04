
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { usePortfolio } from './PortfolioContext';
import { useToast } from '@/hooks/use-toast';
import { getSavedDividendData } from '@/services/dividendService';

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
  error: string | null;
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
    canMakeApiCall: true,
    error: null
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
    if (!user?.id || !selectedPortfolio) {
      setState(prev => ({ ...prev, loading: false, dividends: [], error: null }));
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      console.log('Loading saved dividend data from database for portfolio:', selectedPortfolio);
      const savedData = await getSavedDividendData(user.id, selectedPortfolio);

      const lastSyncTime = localStorage.getItem(`dividend_last_sync_${selectedPortfolio}`);

      setState(prev => ({
        ...prev,
        dividends: savedData || [],
        loading: false,
        lastSync: lastSyncTime,
        error: null
      }));

      console.log(`Loaded ${savedData?.length || 0} dividend records from database`);

      // If no data found, show helpful message
      if (!savedData || savedData.length === 0) {
        console.log('No dividend data found in database for this portfolio');
      }

    } catch (error) {
      console.error('Error loading saved dividend data:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        dividends: [], 
        error: 'Failed to load dividend data from database'
      }));
    }
  };

  // Mock sync API data to database (since edge function is failing)
  const syncApiDataToDatabase = async () => {
    if (!user?.id || !selectedPortfolio) {
      setState(prev => ({ ...prev, error: 'Please select a portfolio first' }));
      return;
    }

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
      setState(prev => ({ ...prev, loading: true, error: null }));

      console.log('Mock API sync - edge function unavailable');
      
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
        title: "API Sync Attempted",
        description: "Edge function unavailable. Please add some sample dividend data manually or check your portfolio positions.",
        variant: "default",
      });

      // Reload saved data
      await loadSavedDividendData();

    } catch (error: any) {
      console.error('Error syncing API data:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to sync dividend data. Please try again later.'
      }));
      toast({
        title: "Sync Failed",
        description: 'Edge function unavailable. Using saved data.',
        variant: "destructive",
      });
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  // Refresh data (load from database)
  const refreshDividendData = async () => {
    await loadSavedDividendData();
  };

  // Get dividend summary from saved data
  const getDividendSummary = () => {
    if (!state.dividends || state.dividends.length === 0) {
      return { totalAnnualIncome: 0, totalStocks: 0, averageYield: 0 };
    }

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
      console.log('Portfolio changed, loading dividend data for:', selectedPortfolio);
      checkApiLimits();
      loadSavedDividendData();
    } else {
      console.log('No user or portfolio selected, clearing dividend data');
      setState(prev => ({ ...prev, loading: false, dividends: [], error: null }));
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
