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
  const [hasRealData, setHasRealData] = useState(false);
  const [dataSource, setDataSource] = useState<string>('');

  // Get current portfolio type
  const currentPortfolio = portfolios.find(p => p.id === selectedPortfolio);
  const portfolioType = currentPortfolio?.portfolio_type || 'stock';

  // Format currency helper
  const formatCurrency = (amount: number) => {
    return `$${Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Format percentage helper
  const formatPercentage = (percentage: number) => {
    const sign = percentage >= 0 ? '+' : '';
    return `${sign}${percentage.toFixed(2)}%`;
  };

  // Format change with sign
  const formatChangeWithSign = (amount: number) => {
    const sign = amount >= 0 ? '+' : '-';
    return `${sign}${formatCurrency(amount)}`;
  };

  // Fetch portfolio-specific data
  useEffect(() => {
    const fetchPortfolioData = async () => {
      if (!selectedPortfolio) {
        console.log('No portfolio selected, showing empty state');
        setPortfolioData({
          totalValue: "$0.00",
          todayChange: "$0.00",
          todayPercentage: "0%",
          totalReturn: "$0.00",
          totalReturnPercentage: "0%",
          holdingsCount: 0,
          netDeposits: "$0.00"
        });
        setHasRealData(false);
        setDataSource('');
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
          setDataSource('Trading212 API');
          
          try {
            // Call the Trading212 sync function to get real data
            const { data, error } = await supabase.functions.invoke('trading212-sync', {
              body: { portfolioId: selectedPortfolio }
            });

            console.log('Trading212 API Response:', { data, error });

            if (error) {
              console.error('Error fetching Trading212 data:', error);
              throw new Error(`Trading212 API Error: ${error.message}`);
            }

            if (data?.success && data.data) {
              // Use real Trading212 data with proper validation
              const realData = data.data;
              console.log('Real Trading212 data received:', realData);
              
              // Calculate proper values from positions if main values are missing
              let calculatedTotalValue = realData.totalValue || 0;
              let calculatedCashBalance = realData.cashBalance || 0;
              
              // If totalValue is 0 but we have positions, calculate from positions
              if (calculatedTotalValue === 0 && realData.positions && realData.positions.length > 0) {
                calculatedTotalValue = realData.positions.reduce((sum: number, pos: any) => 
                  sum + (pos.marketValue || (pos.quantity * pos.currentPrice) || 0), 0
                );
              }
              
              // Add cash balance to total value
              const finalTotalValue = calculatedTotalValue + calculatedCashBalance;
              
              // Extract the actual values - don't default important metrics to zero
              const todayChange = realData.todayChange || 0;
              const totalReturn = realData.totalReturn || 0;
              const netDeposits = realData.netDeposits || calculatedCashBalance || 0;
              const holdingsCount = realData.holdingsCount || (realData.positions ? realData.positions.length : 0);
              
              // Calculate percentages properly
              const todayPercentage = finalTotalValue > 0 ? (todayChange / (finalTotalValue - todayChange)) * 100 : 0;
              const totalReturnPercentage = netDeposits > 0 ? (totalReturn / netDeposits) * 100 : 0;

              // Display the actual data
              setPortfolioData({
                totalValue: formatCurrency(finalTotalValue),
                todayChange: formatChangeWithSign(todayChange),
                todayPercentage: formatPercentage(todayPercentage),
                totalReturn: formatChangeWithSign(totalReturn),
                totalReturnPercentage: formatPercentage(totalReturnPercentage),
                holdingsCount: holdingsCount,
                netDeposits: formatCurrency(netDeposits)
              });
              setHasRealData(true);
              
              // Cache the processed data
              const processedData = {
                ...realData,
                totalValue: finalTotalValue,
                todayPercentage: todayPercentage,
                totalReturnPercentage: totalReturnPercentage
              };
              localStorage.setItem('trading212_data', JSON.stringify(processedData));
              
              toast({
                title: "Trading212 Data Loaded",
                description: `Portfolio updated with ${holdingsCount} positions from Trading212`,
                variant: "default",
              });
            } else if (data?.error === 'RATE_LIMITED' || data?.error?.includes('RATE_LIMITED')) {
              console.warn('Trading212 API rate limited, trying cached data');
              setDataSource('Trading212 API (Rate Limited)');
              
              // Try to use cached data
              const cachedData = localStorage.getItem('trading212_data');
              if (cachedData) {
                try {
                  const cachedRealData = JSON.parse(cachedData);
                  const totalValue = cachedRealData.totalValue || 0;
                  const todayChange = cachedRealData.todayChange || 0;
                  const todayPercentage = cachedRealData.todayPercentage || 0;
                  const totalReturn = cachedRealData.totalReturn || 0;
                  const totalReturnPercentage = cachedRealData.totalReturnPercentage || 0;
                  const netDeposits = cachedRealData.netDeposits || cachedRealData.cashBalance || 0;
                  const holdingsCount = cachedRealData.holdingsCount || 0;
                  
                  setPortfolioData({
                    totalValue: formatCurrency(totalValue),
                    todayChange: formatChangeWithSign(todayChange),
                    todayPercentage: formatPercentage(todayPercentage),
                    totalReturn: formatChangeWithSign(totalReturn),
                    totalReturnPercentage: formatPercentage(totalReturnPercentage),
                    holdingsCount: holdingsCount,
                    netDeposits: formatCurrency(netDeposits)
                  });
                  setHasRealData(true);
                  
                  toast({
                    title: "Using Cached Data",
                    description: "Trading212 API is rate limited. Showing cached portfolio data.",
                    variant: "default",
                  });
                } catch (parseError) {
                  console.error('Error parsing cached data:', parseError);
                  throw new Error('Invalid cached data');
                }
              } else {
                throw new Error('No cached data available and API is rate limited');
              }
            } else {
              console.error('Trading212 API returned no valid data:', data);
              throw new Error('No valid data received from Trading212 API');
            }
          } catch (fetchError) {
            console.error('Trading212 API fetch error:', fetchError);
            setDataSource('Trading212 API (Error)');
            
            // Try cached data as fallback
            const cachedData = localStorage.getItem('trading212_data');
            if (cachedData) {
              try {
                const cachedRealData = JSON.parse(cachedData);
                const totalValue = cachedRealData.totalValue || 0;
                const todayChange = cachedRealData.todayChange || 0;
                const todayPercentage = cachedRealData.todayPercentage || 0;
                const totalReturn = cachedRealData.totalReturn || 0;
                const totalReturnPercentage = cachedRealData.totalReturnPercentage || 0;
                const netDeposits = cachedRealData.netDeposits || cachedRealData.cashBalance || 0;
                const holdingsCount = cachedRealData.holdingsCount || 0;
                
                setPortfolioData({
                  totalValue: formatCurrency(totalValue),
                  todayChange: formatChangeWithSign(todayChange),
                  todayPercentage: formatPercentage(todayPercentage),
                  totalReturn: formatChangeWithSign(totalReturn),
                  totalReturnPercentage: formatPercentage(totalReturnPercentage),
                  holdingsCount: holdingsCount,
                  netDeposits: formatCurrency(netDeposits)
                });
                setHasRealData(true);
                setDataSource('Trading212 API (Cached)');
                
                toast({
                  title: "Using Cached Data",
                  description: "Unable to fetch fresh data. Showing cached portfolio data.",
                  variant: "default",
                });
              } catch (parseError) {
                console.error('Error parsing cached data:', parseError);
                // Show zero values for API errors to maintain consistency
                setPortfolioData({
                  totalValue: "$0.00",
                  todayChange: "$0.00",
                  todayPercentage: "0%",
                  totalReturn: "$0.00",
                  totalReturnPercentage: "0%",
                  holdingsCount: 0,
                  netDeposits: "$0.00"
                });
                setHasRealData(false);
                
                toast({
                  title: "Trading212 Connection Failed",
                  description: "Unable to fetch data from Trading212. Please check your API configuration in the Data Integration page.",
                  variant: "destructive",
                });
              }
            } else {
              // Show zero values for API errors to maintain consistency
              setPortfolioData({
                totalValue: "$0.00",
                todayChange: "$0.00",
                todayPercentage: "0%",
                totalReturn: "$0.00",
                totalReturnPercentage: "0%",
                holdingsCount: 0,
                netDeposits: "$0.00"
              });
              setHasRealData(false);
              
              toast({
                title: "Trading212 Connection Failed",
                description: "Unable to fetch data from Trading212. Please check your API configuration in the Data Integration page.",
                variant: "destructive",
              });
            }
          }
        } else if (selectedPortfolio === binancePortfolioId) {
          console.log('Fetching real Binance portfolio data');
          setDataSource('Binance API');
          
          // Call the Binance API function to get real data
          const { data, error } = await supabase.functions.invoke('binance-api', {
            body: { portfolioId: selectedPortfolio }
          });

          if (error) {
            console.error('Error fetching Binance data:', error);
            setDataSource('Binance API (Error)');
            setPortfolioData({
              totalValue: "$0.00",
              todayChange: "$0.00",
              todayPercentage: "0%",
              totalReturn: "$0.00",
              totalReturnPercentage: "0%",
              holdingsCount: 0,
              netDeposits: "$0.00"
            });
            setHasRealData(false);
            
            toast({
              title: "Binance API Error",
              description: "Failed to fetch Binance data. Please check your API credentials.",
              variant: "destructive",
            });
            throw error;
          }

          if (data?.success) {
            // Use real Binance data from API with proper validation
            const realData = data.data;
            const totalValue = realData.totalValue || 0;
            const todayChange = realData.todayChange || 0;
            const todayPercentage = realData.todayPercentage || 0;
            const totalReturn = realData.totalReturn || 0;
            const totalReturnPercentage = realData.totalReturnPercentage || 0;
            const netDeposits = realData.netDeposits || 0;
            const holdingsCount = realData.holdingsCount || 0;
            
            setPortfolioData({
              totalValue: formatCurrency(totalValue),
              todayChange: formatChangeWithSign(todayChange),
              todayPercentage: formatPercentage(todayPercentage),
              totalReturn: formatChangeWithSign(totalReturn),
              totalReturnPercentage: formatPercentage(totalReturnPercentage),
              holdingsCount: holdingsCount,
              netDeposits: formatCurrency(netDeposits)
            });
            
            // Cache the data
            localStorage.setItem('binance_data', JSON.stringify(realData));
            setHasRealData(true);
            setDataSource('Binance API');
            console.log('Real Binance data loaded successfully:', realData);
            
            toast({
              title: "Live Binance Data",
              description: "Portfolio updated with real-time data from your Binance account",
              variant: "default",
            });
          } else {
            console.error('Binance API returned error:', data?.error);
            setDataSource('Binance API (Error)');
            setPortfolioData({
              totalValue: "$0.00",
              todayChange: "$0.00",
              todayPercentage: "0%",
              totalReturn: "$0.00",
              totalReturnPercentage: "0%",
              holdingsCount: 0,
              netDeposits: "$0.00"
            });
            setHasRealData(false);
            
            toast({
              title: "Binance API Error",
              description: data?.error || 'Failed to fetch Binance data',
              variant: "destructive",
            });
            throw new Error(data?.error || 'Failed to fetch Binance data');
          }
        } else if (portfolioType === 'crypto') {
          console.log('Loading sample crypto portfolio data');
          setDataSource('Sample Crypto Data');
          
          // Use sample crypto data
          setPortfolioData({
            totalValue: "$15,432.18",
            todayChange: "+$542.33",
            todayPercentage: "+3.64%",
            totalReturn: "+$3,432.18",
            totalReturnPercentage: "+28.6%",
            holdingsCount: 8,
            netDeposits: "$12,000.00"
          });
          setHasRealData(true);
        } else {
          console.log('Loading sample stock portfolio data for user portfolio');
          setDataSource('Manual Portfolio');
          
          // Sample data for user-created portfolios
          setPortfolioData({
            totalValue: "$12,543.87",
            todayChange: "+$156.42",
            todayPercentage: "+1.27%",
            totalReturn: "+$2,543.87",
            totalReturnPercentage: "+25.4%",
            holdingsCount: 8,
            netDeposits: "$10,000.00"
          });
          setHasRealData(true);
        }
      } catch (error) {
        console.error('Error fetching portfolio data:', error);
        
        // Only show zero values for non-connected portfolios or critical errors
        if (selectedPortfolio === localStorage.getItem('trading212_portfolio_id') || 
            selectedPortfolio === localStorage.getItem('binance_portfolio_id')) {
          setPortfolioData({
            totalValue: "$0.00",
            todayChange: "$0.00",
            todayPercentage: "0%",
            totalReturn: "$0.00",
            totalReturnPercentage: "0%",
            holdingsCount: 0,
            netDeposits: "$0.00"
          });
          setHasRealData(false);
          setDataSource(dataSource + ' (Error)');
        }
        
        toast({
          title: "Error Loading Data",
          description: "Unable to load portfolio data. Please try again later or check your API configuration.",
          variant: "destructive",
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
              <div className="text-sm text-blue-600 p-2 bg-blue-50 rounded-md">
                🔄 Fetching real-time data from {dataSource}...
              </div>
            )}
            
            {!hasRealData && !isLoadingData && portfolioData.totalValue === "$0.00" && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800 font-medium">
                  📊 No Portfolio Data Available
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  {selectedPortfolio === localStorage.getItem('trading212_portfolio_id') 
                    ? "Trading212 API connection failed or your account has no positions. Please check your API key in Data Integration page."
                    : selectedPortfolio === localStorage.getItem('binance_portfolio_id')
                    ? "Binance API connection failed. Please check your API keys in Data Integration page."
                    : "This portfolio has no holdings. Add some holdings manually or connect it to a broker."}
                </p>
              </div>
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
            
            {/* Show which portfolio is selected with detailed status */}
            <div className="mt-2 p-3 bg-muted rounded-md">
              <p className="text-xs text-muted-foreground">Selected Portfolio:</p>
              <p className="text-sm font-medium flex items-center gap-1">
                {portfolioType === 'crypto' ? '🪙' : '📈'}
                {portfolios.find(p => p.id === selectedPortfolio)?.name || 'Unknown Portfolio'}
                <span className="text-xs text-muted-foreground ml-1">
                  ({portfolioType === 'crypto' ? 'Crypto' : 'Stock'})
                </span>
              </p>
              <p className="text-xs mt-1">
                <span className="font-medium">Data Source: </span>
                <span className={
                  dataSource.includes('Error') ? 'text-red-600' :
                  dataSource.includes('Rate Limited') ? 'text-orange-600' :
                  dataSource.includes('Cached') ? 'text-orange-600' :
                  dataSource.includes('API') ? 'text-green-600' :
                  'text-gray-600'
                }>
                  {dataSource || 'Not connected'}
                </span>
              </p>
              {selectedPortfolio === localStorage.getItem('trading212_portfolio_id') && (
                <p className="text-xs text-blue-600 mt-1">
                  {hasRealData ? '✓ Connected to Trading212' : '⚠️ Trading212 Connection Issue'}
                </p>
              )}
              {selectedPortfolio === localStorage.getItem('binance_portfolio_id') && (
                <p className="text-xs text-orange-600 mt-1">
                  {hasRealData ? '✓ Connected to Binance' : '⚠️ Binance Connection Issue'}
                </p>
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
