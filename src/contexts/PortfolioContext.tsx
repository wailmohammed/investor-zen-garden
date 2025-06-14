
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Portfolio {
  id: string;
  name: string;
  description?: string;
  is_default: boolean;
}

interface PortfolioContextType {
  portfolios: Portfolio[];
  selectedPortfolio: string;
  setSelectedPortfolio: (portfolioId: string) => void;
  isLoading: boolean;
  refreshPortfolios: () => Promise<void>;
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
  const [selectedPortfolio, setSelectedPortfolio] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const refreshPortfolios = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

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
        const currentIsValid = selectedPortfolio && data.some(p => p.id === selectedPortfolio);
        if (!currentIsValid) {
          const defaultPortfolio = data.find(p => p.is_default);
          const portfolioToSelect = defaultPortfolio ? defaultPortfolio.id : data[0].id;
          console.log('Setting selected portfolio to:', portfolioToSelect);
          setSelectedPortfolio(portfolioToSelect);
        }
      }
    } catch (error) {
      console.error('Error fetching portfolios:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user's portfolios
  useEffect(() => {
    refreshPortfolios();
  }, [user?.id]);

  // Log portfolio selection changes
  useEffect(() => {
    if (selectedPortfolio) {
      console.log('Selected portfolio changed to:', selectedPortfolio);
      const selectedName = portfolios.find(p => p.id === selectedPortfolio)?.name;
      console.log('Selected portfolio name:', selectedName);
    }
  }, [selectedPortfolio, portfolios]);

  return (
    <PortfolioContext.Provider value={{
      portfolios,
      selectedPortfolio,
      setSelectedPortfolio,
      isLoading,
      refreshPortfolios
    }}>
      {children}
    </PortfolioContext.Provider>
  );
};
