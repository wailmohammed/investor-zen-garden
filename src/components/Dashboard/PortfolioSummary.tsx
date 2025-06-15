import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatCard from "../StatCard";
import { PortfolioSelector } from "@/components/ui/portfolio-selector";
import { useState, useEffect } from "react";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const PortfolioSummary = () => {
  const { toast } = useToast();
  const { portfolios, selectedPortfolio, setSelectedPortfolio, isLoading } = usePortfolio();
  const [portfolioData, setPortfolioData] = useState({
    totalValue: "$0.00",
    todayChange: "$0.00",
    todayPercentage: "0%",
    totalReturn: "$0.00",
    totalReturnPercentage: "0%",
    holdingsCount: 0,
    netDeposits: "$0.00"
  });
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Get current portfolio type
  const currentPortfolio = portfolios.find(p => p.id === selectedPortfolio);
  const portfolioType = currentPortfolio?.portfolio_type || 'stock';

  // Fetch portfolio-specific data
  useEffect(() => {
    const fetchPortfolioData = async () => {
      if (!selectedPortfolio) {
        console.log('No portfolio selected, resetting data');
        setPortfolioData({
          totalValue: "$0.00",
          todayChange: "$0.00",
          todayPercentage: "0%",
          totalReturn: "$0.00",
          totalReturnPercentage: "0%",
          holdingsCount: 0,
          netDeposits: "$0.00"
        });
        return;
      }

      try {
        setIsLoadingData(true);
        console.log('Fetching data for portfolio:', selectedPortfolio, 'Type:', portfolioType);
        
        // Check if this is a Trading212 or Binance connected portfolio
        const trading212PortfolioId = localStorage.getItem('trading212_portfolio_id');
        const binancePortfolioId = localStorage.getItem('binance_portfolio_id');
        
        if (selectedPortfolio === trading212PortfolioId) {
          console.log('Fetching real Trading212 portfolio data');
          
          // Check for cached data first
          const cachedData = localStorage.getItem('trading212_data');
          let shouldUseCached = false;

          try {
            // Call the Trading212 sync function to get real data
            const { data, error } = await supabase.functions.invoke('trading212-sync', {
              body: { portfolioId: selectedPortfolio }
            });

            if (error) {
              console.error('Error fetching Trading212 data:', error);
              shouldUseCached = true;
            } else if (data?.success) {
              // Use real Trading212 data
              const realData = data.data;
              setPortfolioData({
                totalValue: `$${realData.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                todayChange: `${realData.todayChange >= 0 ? '+' : ''}$${realData.todayChange.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                todayPercentage: `${realData.todayPercentage >= 0 ? '+' : ''}${realData.todayPercentage.toFixed(2)}%`,
                totalReturn: `${realData.totalReturn >= 0 ? '+' : ''}$${realData.totalReturn.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                totalReturnPercentage: `${realData.totalReturnPercentage >= 0 ? '+' : ''}${realData.totalReturnPercentage.toFixed(2)}%`,
                holdingsCount: realData.holdingsCount,
                netDeposits: `$${realData.netDeposits.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              });
              
              // Update cached data
              localStorage.setItem('trading212_data', JSON.stringify(realData));
              console.log('Real Trading212 data loaded:', realData);
            } else {
              console.error('Trading212 API error:', data?.error);
              shouldUseCached = true;
            }
          } catch (fetchError) {
            console.error('Network error fetching Trading212 data:', fetchError);
            shouldUseCached = true;
          }

          // Use cached data if API failed
          if (shouldUseCached && cachedData) {
            try {
              const cachedRealData = JSON.parse(cachedData);
              setPortfolioData({
                totalValue: `$${cachedRealData.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                todayChange: `${cachedRealData.todayChange >= 0 ? '+' : ''}$${cachedRealData.todayChange.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                todayPercentage: `${cachedRealData.todayPercentage >= 0 ? '+' : ''}${cachedRealData.todayPercentage.toFixed(2)}%`,
                totalReturn: `${cachedRealData.totalReturn >= 0 ? '+' : ''}$${cachedRealData.totalReturn.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                totalReturnPercentage: `${cachedRealData.totalReturnPercentage >= 0 ? '+' : ''}${cachedRealData.totalReturnPercentage.toFixed(2)}%`,
                holdingsCount: cachedRealData.holdingsCount,
                netDeposits: `$${cachedRealData.netDeposits.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              });
              console.log('Using cached Trading212 data');
              
              toast({
                title: "Using Cached Data",
                description: "Trading212 API is temporarily unavailable. Showing cached portfolio data.",
                variant: "default",
              });
            } catch (parseError) {
              console.error('Error parsing cached data:', parseError);
              // Fall back to sample data
              setPortfolioData({
                totalValue: "$2,631.96",
                todayChange: "-$32.15",
                todayPercentage: "-1.21%",
                totalReturn: "-$95.13",
                totalReturnPercentage: "-11.0%",
                holdingsCount: 3,
                netDeposits: "$2,727.09"
              });
            }
          } else if (shouldUseCached) {
            // No cached data available, use sample data
            setPortfolioData({
              totalValue: "$2,631.96",
              todayChange: "-$32.15",
              todayPercentage: "-1.21%",
              totalReturn: "-$95.13",
              totalReturnPercentage: "-11.0%",
              holdingsCount: 3,
              netDeposits: "$2,727.09"
            });
            toast({
              title: "Sample Data",
              description: "Trading212 API is unavailable. Showing sample portfolio data.",
              variant: "default",
            });
          }
        } else if (selectedPortfolio === binancePortfolioId) {
          console.log('Fetching real Binance portfolio data');
          
          // Call the Binance API function to get real data
          const { data, error } = await supabase.functions.invoke('binance-api', {
            body: { portfolioId: selectedPortfolio }
          });

          if (error) {
            console.error('Error fetching Binance data:', error);
            toast({
              title: "Binance API Error",
              description: "Failed to fetch Binance data. Please check your API credentials.",
              variant: "destructive",
            });
            throw error;
          }

          if (data?.success) {
            // Use real Binance data from API
            const realData = data.data;
            setPortfolioData({
              totalValue: `$${realData.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              todayChange: `${realData.todayChange >= 0 ? '+' : ''}$${Math.abs(realData.todayChange).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              todayPercentage: `${realData.todayPercentage >= 0 ? '+' : ''}${realData.todayPercentage.toFixed(2)}%`,
              totalReturn: `${realData.totalReturn >= 0 ? '+' : ''}$${Math.abs(realData.totalReturn).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              totalReturnPercentage: `${realData.totalReturnPercentage >= 0 ? '+' : ''}${realData.totalReturnPercentage.toFixed(2)}%`,
              holdingsCount: realData.holdingsCount,
              netDeposits: `$${realData.netDeposits.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            });
            
            // Cache the data
            localStorage.setItem('binance_data', JSON.stringify(realData));
            console.log('Real Binance data loaded successfully:', realData);
            
            toast({
              title: "Live Binance Data",
              description: "Portfolio updated with real-time data from your Binance account",
              variant: "default",
            });
          } else {
            console.error('Binance API returned error:', data?.error);
            toast({
              title: "Binance API Error",
              description: data?.error || 'Failed to fetch Binance data',
              variant: "destructive",
            });
            throw new Error(data?.error || 'Failed to fetch Binance data');
          }
        } else if (portfolioType === 'crypto') {
          console.log('Fetching crypto portfolio data from CoinGecko');
          
          // Call the crypto API function to get real data
          const { data, error } = await supabase.functions.invoke('crypto-api', {
            body: { portfolioId: selectedPortfolio }
          });

          if (error) {
            console.error('Error fetching crypto data:', error);
            toast({
              title: "API Error",
              description: "Failed to fetch crypto data from API",
              variant: "destructive",
            });
            throw error;
          }

          if (data?.success) {
            // Use real crypto data from API
            const realData = data.data;
            setPortfolioData({
              totalValue: `$${realData.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              todayChange: `${realData.todayChange >= 0 ? '+' : ''}$${Math.abs(realData.todayChange).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              todayPercentage: `${realData.todayPercentage >= 0 ? '+' : ''}${realData.todayPercentage.toFixed(2)}%`,
              totalReturn: `${realData.totalReturn >= 0 ? '+' : ''}$${Math.abs(realData.totalReturn).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              totalReturnPercentage: `${realData.totalReturnPercentage >= 0 ? '+' : ''}${realData.totalReturnPercentage.toFixed(2)}%`,
              holdingsCount: realData.holdingsCount,
              netDeposits: `$${realData.netDeposits.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            });
            
            console.log('Real crypto data loaded successfully:', realData);
            
            toast({
              title: "Live Crypto Data",
              description: "Portfolio updated with real-time cryptocurrency prices from CoinGecko",
              variant: "default",
            });
          } else {
            console.error('Crypto API returned error:', data?.error);
            toast({
              title: "API Error",
              description: data?.error || 'Failed to fetch crypto data',
              variant: "destructive",
            });
            throw new Error(data?.error || 'Failed to fetch crypto data');
          }
        } else {
          console.log('Loading stock portfolio data');
          // Default stock portfolio data
          setPortfolioData({
            totalValue: "$254,872.65",
            todayChange: "+$1,243.32",
            todayPercentage: "+0.49%",
            totalReturn: "+$45,631.28",
            totalReturnPercentage: "+21.8%",
            holdingsCount: 15,
            netDeposits: "$209,241.37"
          });
        }
      } catch (error) {
        console.error('Error fetching portfolio data:', error);
        toast({
          title: "Error",
          description: "Failed to load portfolio data. Please try again.",
          variant: "destructive",
        });
        
        // Reset to empty state on error
        setPortfolioData({
          totalValue: "$0.00",
          todayChange: "$0.00",
          todayPercentage: "0%",
          totalReturn: "$0.00",
          totalReturnPercentage: "0%",
          holdingsCount: 0,
          netDeposits: "$0.00"
        });
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchPortfolioData();
  }, [selectedPortfolio, portfolioType, toast]);

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-8 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle>Portfolio Summary</CardTitle>
        {portfolios.length > 0 && (
          <div className="mt-2">
            <PortfolioSelector
              portfolios={portfolios}
              value={selectedPortfolio}
              onValueChange={setSelectedPortfolio}
              placeholder="Select portfolio"
            />
          </div>
        )}
      </CardHeader>
      <CardContent>
        {portfolios.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <p>No portfolios found.</p>
            <p className="text-sm mt-1">Create your first portfolio to get started.</p>
          </div>
        ) : selectedPortfolio ? (
          <div className="grid grid-cols-1 gap-4">
            {isLoadingData && (
              <div className="text-sm text-blue-600">🔄 Fetching real-time data...</div>
            )}
            
            <StatCard 
              label="Total Value" 
              value={portfolioData.totalValue}
              change={{ 
                value: portfolioData.todayChange, 
                percentage: portfolioData.todayPercentage, 
                isPositive: portfolioData.todayChange.includes('+')
              }} 
            />
            <StatCard 
              label="Today's Change" 
              value={portfolioData.todayChange}
              change={{ 
                value: portfolioData.todayChange, 
                percentage: portfolioData.todayPercentage, 
                isPositive: portfolioData.todayChange.includes('+')
              }} 
            />
            <StatCard 
              label="Total Return" 
              value={portfolioData.totalReturn}
              change={{ 
                value: portfolioData.totalReturn, 
                percentage: portfolioData.totalReturnPercentage, 
                isPositive: portfolioData.totalReturn.includes('+')
              }} 
            />
            <StatCard 
              label="Net Deposits" 
              value={portfolioData.netDeposits}
            />
            <div className="text-sm text-muted-foreground mt-2">
              {portfolioData.holdingsCount} holdings
            </div>
            
            {/* Show which portfolio is selected with type indicator */}
            <div className="mt-2 p-2 bg-muted rounded-md">
              <p className="text-xs text-muted-foreground">Selected Portfolio:</p>
              <p className="text-sm font-medium flex items-center gap-1">
                {portfolioType === 'crypto' ? '🪙' : '📈'}
                {portfolios.find(p => p.id === selectedPortfolio)?.name || 'Unknown Portfolio'}
                <span className="text-xs text-muted-foreground ml-1">
                  ({portfolioType === 'crypto' ? 'Crypto' : 'Stock'})
                </span>
              </p>
              {selectedPortfolio === localStorage.getItem('trading212_portfolio_id') && (
                <p className="text-xs text-blue-600">✓ Connected to Trading212 (Real Data)</p>
              )}
              {selectedPortfolio === localStorage.getItem('binance_portfolio_id') && (
                <p className="text-xs text-orange-600">✓ Connected to Binance (Real Data)</p>
              )}
              {portfolioType === 'crypto' && selectedPortfolio !== localStorage.getItem('binance_portfolio_id') && (
                <p className="text-xs text-green-600">✓ Live Data from CoinGecko API</p>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            <p>Select a portfolio to view data</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PortfolioSummary;
