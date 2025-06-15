import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Portfolio {
  id: string;
  name: string;
  description?: string;
  is_default: boolean;
  portfolio_type: 'stock' | 'crypto';
}

interface PortfolioContextType {
  portfolios: Portfolio[];
  selectedPortfolio: string;
  setSelectedPortfolio: (portfolioId: string) => void;
  isLoading: boolean;
  refreshPortfolios: () => Promise<void>;
  stockPortfolios: Portfolio[];
  cryptoPortfolios: Portfolio[];
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolio, setSelectedPortfolioState] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Load selected portfolio from localStorage on mount
  useEffect(() => {
    if (user?.id) {
      const savedPortfolio = localStorage.getItem(`selected_portfolio_${user.id}`);
      if (savedPortfolio) {
        console.log('Restoring saved portfolio:', savedPortfolio);
        setSelectedPortfolioState(savedPortfolio);
      }
    }
  }, [user?.id]);

  const refreshPortfolios = async () => {
    if (!user?.id) {
      setPortfolios([]);
      setSelectedPortfolioState('');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      console.log('Fetching portfolios for user:', user.id);
      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });

      if (error) throw error;

      console.log('Portfolios fetched:', data);
      setPortfolios(data || []);
      
      // Set default portfolio if available, or preserve current selection if valid
      if (data && data.length > 0) {
        const savedPortfolio = localStorage.getItem(`selected_portfolio_${user.id}`);
        const currentIsValid = savedPortfolio && data.some(p => p.id === savedPortfolio);
        
        if (currentIsValid) {
          // Keep saved selection if it's still valid
          console.log('Keeping saved portfolio selection:', savedPortfolio);
          setSelectedPortfolioState(savedPortfolio);
        } else {
          // Select default or first portfolio
          const defaultPortfolio = data.find(p => p.is_default);
          const portfolioToSelect = defaultPortfolio ? defaultPortfolio.id : data[0].id;
          console.log('Setting selected portfolio to:', portfolioToSelect);
          setSelectedPortfolioState(portfolioToSelect);
          localStorage.setItem(`selected_portfolio_${user.id}`, portfolioToSelect);
        }
      } else {
        // No portfolios found, clear selection and localStorage
        setSelectedPortfolioState('');
        localStorage.removeItem(`selected_portfolio_${user.id}`);
      }
    } catch (error) {
      console.error('Error fetching portfolios:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle portfolio selection changes
  const handleSetSelectedPortfolio = (portfolioId: string) => {
    console.log('Portfolio selection changed to:', portfolioId);
    const selectedPortfolioData = portfolios.find(p => p.id === portfolioId);
    console.log('Selected portfolio:', selectedPortfolioData?.name, 'Type:', selectedPortfolioData?.portfolio_type);
    
    // Check if it's a broker portfolio
    const trading212PortfolioId = localStorage.getItem('trading212_portfolio_id');
    const binancePortfolioId = localStorage.getItem('binance_portfolio_id');
    
    if (portfolioId === trading212PortfolioId) {
      console.log('Selected Trading212 portfolio');
    } else if (portfolioId === binancePortfolioId) {
      console.log('Selected Binance portfolio');
    } else if (selectedPortfolioData?.portfolio_type === 'crypto') {
      console.log('Selected crypto portfolio');
    } else {
      console.log('Selected stock portfolio');
    }
    
    setSelectedPortfolioState(portfolioId);
    
    // Save to localStorage for persistence across page refreshes
    if (user?.id) {
      localStorage.setItem(`selected_portfolio_${user.id}`, portfolioId);
      console.log('Saved portfolio selection to localStorage:', portfolioId);
    }
  };

  // Fetch user's portfolios
  useEffect(() => {
    refreshPortfolios();
  }, [user?.id]);

  // Log portfolio selection changes
  useEffect(() => {
    if (selectedPortfolio) {
      console.log('Selected portfolio state updated to:', selectedPortfolio);
    }
  }, [selectedPortfolio]);

  // Separate portfolios by type
  const stockPortfolios = portfolios.filter(p => p.portfolio_type === 'stock');
  const cryptoPortfolios = portfolios.filter(p => p.portfolio_type === 'crypto');

  return (
    <PortfolioContext.Provider value={{
      portfolios,
      selectedPortfolio,
      setSelectedPortfolio: handleSetSelectedPortfolio,
      isLoading,
      refreshPortfolios,
      stockPortfolios,
      cryptoPortfolios
    }}>
      {children}
    </PortfolioContext.Provider>
  );
};
