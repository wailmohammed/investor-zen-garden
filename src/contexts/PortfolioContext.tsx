
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

  // Fetch user's portfolios
  useEffect(() => {
    const fetchPortfolios = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('portfolios')
          .select('*')
          .eq('user_id', user.id)
          .order('is_default', { ascending: false });

        if (error) throw error;

        setPortfolios(data || []);
        
        // Set default portfolio if available
        const defaultPortfolio = data?.find(p => p.is_default);
        if (defaultPortfolio) {
          setSelectedPortfolio(defaultPortfolio.id);
        } else if (data && data.length > 0) {
          setSelectedPortfolio(data[0].id);
        }
      } catch (error) {
        console.error('Error fetching portfolios:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPortfolios();
  }, [user?.id]);

  return (
    <PortfolioContext.Provider value={{
      portfolios,
      selectedPortfolio,
      setSelectedPortfolio,
      isLoading
    }}>
      {children}
    </PortfolioContext.Provider>
  );
};
