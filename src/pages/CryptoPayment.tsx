
import React, { useState, useEffect } from 'react';
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, TrendingUp, TrendingDown, Wallet, DollarSign, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const CryptoPayment = () => {
  const { user } = useAuth();
  const { selectedPortfolio, portfolios } = usePortfolio();
  const [cryptoData, setCryptoData] = useState<any[]>([]);
  const [portfolioSummary, setPortfolioSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  // Check if this is a Trading212 connected portfolio
  const trading212PortfolioId = localStorage.getItem('trading212_portfolio_id');
  const isTrading212Portfolio = selectedPortfolio === trading212PortfolioId;
  const currentPortfolio = portfolios.find(p => p.id === selectedPortfolio);

  const fetchCachedData = async () => {
    if (!selectedPortfolio || !user) return null;

    try {
      console.log('Fetching cached Trading212 data...');
      
      // Get cached metadata
      const { data: cachedData } = await supabase
        .from('portfolio_metadata')
        .select('*')
        .eq('portfolio_id', selectedPortfolio)
        .eq('broker_type', 'trading212')
        .maybeSingle();

      // Get cached positions
      const { data: cachedPositions } = await supabase
        .from('portfolio_positions')
        .select('*')
        .eq('portfolio_id', selectedPortfolio)
        .eq('broker_type', 'trading212');

      if (cachedData && cachedPositions && cachedPositions.length > 0) {
        console.log('Found cached data:', { metadata: cachedData, positions: cachedPositions.length });
        
        // Filter for crypto-like positions
        const cryptoPositions = cachedPositions.filter((pos: any) => {
          const symbol = pos.symbol.toLowerCase();
          return symbol.includes('btc') || 
                 symbol.includes('eth') || 
                 symbol.includes('usdt') ||
                 symbol.includes('bnb') ||
                 symbol.includes('ada') ||
                 symbol.includes('dot') ||
                 symbol.includes('link') ||
                 symbol.includes('sol') ||
                 symbol.includes('avax') ||
                 symbol.includes('matic') ||
                 symbol.includes('crypto') ||
                 pos.symbol.length <= 5; // Many crypto symbols are short
        });

        const formattedCryptoPositions = cryptoPositions.map((pos: any) => ({
          symbol: pos.symbol,
          quantity: pos.quantity,
          currentPrice: pos.current_price,
          marketValue: pos.market_value,
          unrealizedPnL: pos.unrealized_pnl,
          averagePrice: pos.average_price
        }));

        setCryptoData(formattedCryptoPositions);
        
        setPortfolioSummary({
          totalValue: cachedData.total_value || 0,
          todayChange: cachedData.today_change || 0,
          todayPercentage: cachedData.today_change_percentage || 0,
          cryptoCount: formattedCryptoPositions.length,
          cashBalance: cachedData.cash_balance || 0
        });

        setLastUpdate(cachedData.last_sync_at || 'Unknown');
        
        return {
          success: true,
          cryptoCount: formattedCryptoPositions.length,
          fromCache: true
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching cached data:', error);
      return null;
    }
  };

  const syncFreshData = async () => {
    if (!selectedPortfolio || !user) return;

    try {
      console.log('Attempting to sync fresh Trading212 data...');
      
      const { data: syncData, error: syncError } = await supabase.functions.invoke('trading212-sync', {
        body: { portfolioId: selectedPortfolio }
      });

      console.log('Trading212 sync response:', { data: syncData, error: syncError });

      if (syncError) {
        console.error('Trading212 sync error:', syncError);
        throw new Error(`Trading212 sync failed: ${syncError.message}`);
      }

      if (syncData?.success && syncData.data) {
        const realData = syncData.data;
        console.log('Fresh Trading212 data received:', realData);
        
        // Filter crypto positions from real data
        const allPositions = realData.positions || [];
        const cryptoPositions = allPositions.filter((pos: any) => {
          const symbol = pos.symbol.toLowerCase();
          return symbol.includes('btc') || 
                 symbol.includes('eth') || 
                 symbol.includes('usdt') ||
                 symbol.includes('bnb') ||
                 symbol.includes('ada') ||
                 symbol.includes('dot') ||
                 symbol.includes('link') ||
                 symbol.includes('sol') ||
                 symbol.includes('avax') ||
                 symbol.includes('matic') ||
                 symbol.includes('crypto') ||
                 pos.symbol.length <= 5;
        });

        setCryptoData(cryptoPositions);
        
        setPortfolioSummary({
          totalValue: realData.totalValue || 0,
          todayChange: realData.todayChange || 0,
          todayPercentage: realData.todayPercentage || 0,
          cryptoCount: cryptoPositions.length,
          cashBalance: realData.cashBalance || 0
        });

        setLastUpdate(new Date().toISOString());

        toast({
          title: "Trading212 Data Synced",
          description: `Found ${cryptoPositions.length} crypto positions from ${allPositions.length} total positions`,
        });

        return { success: true, cryptoCount: cryptoPositions.length };
      } else if (syncData?.error === 'RATE_LIMITED') {
        throw new Error('Trading212 API rate limited. Using cached data.');
      } else {
        throw new Error('No fresh data available from Trading212 API');
      }
    } catch (error: any) {
      console.error('Fresh data sync failed:', error);
      throw error;
    }
  };

  useEffect(() => {
    const fetchCryptoData = async () => {
      console.log('Starting crypto data fetch...');
      setIsLoading(true);
      setError(null);

      if (!selectedPortfolio || !user) {
        console.log('No portfolio or user selected');
        setIsLoading(false);
        return;
      }

      try {
        if (isTrading212Portfolio) {
          console.log('Fetching Trading212 crypto data for portfolio:', selectedPortfolio);
          
          // Try cached data first
          const cachedResult = await fetchCachedData();
          
          if (cachedResult?.success) {
            console.log('Using cached data successfully');
            setIsLoading(false);
            
            if (cachedResult.cryptoCount > 0) {
              toast({
                title: "Cached Data Loaded",
                description: `Showing ${cachedResult.cryptoCount} crypto positions from cached data`,
              });
            }

            // Try to sync fresh data in background, but don't block UI
            try {
              await syncFreshData();
            } catch (syncError: any) {
              console.log('Background sync failed, keeping cached data:', syncError.message);
              // Show a subtle notification about using cached data
              if (syncError.message.includes('rate limited')) {
                toast({
                  title: "Using Cached Data",
                  description: "Trading212 API is rate limited. Showing latest cached data.",
                  variant: "default",
                });
              }
            }
          } else {
            // No cached data, try fresh sync
            try {
              await syncFreshData();
            } catch (syncError: any) {
              console.error('Fresh sync failed and no cached data available:', syncError);
              
              // Set empty state but don't show as error - just informational
              setCryptoData([]);
              setPortfolioSummary({
                totalValue: 0,
                todayChange: 0,
                todayPercentage: 0,
                cryptoCount: 0,
                cashBalance: 0
              });
              
              setError(`Unable to load Trading212 data: ${syncError.message}`);
            }
          }
        } else {
          // Mock crypto data for non-Trading212 portfolios
          console.log('Using mock crypto data for non-Trading212 portfolio');
          const mockCryptoData = [
            {
              symbol: 'BTC',
              quantity: 0.5,
              currentPrice: 65000,
              marketValue: 32500,
              unrealizedPnL: 2500,
              averagePrice: 60000
            },
            {
              symbol: 'ETH',
              quantity: 2.5,
              currentPrice: 3200,
              marketValue: 8000,
              unrealizedPnL: 800,
              averagePrice: 2880
            }
          ];

          setCryptoData(mockCryptoData);
          setPortfolioSummary({
            totalValue: 40500,
            todayChange: 1200,
            todayPercentage: 3.05,
            cryptoCount: 2,
            cashBalance: 0
          });
          setLastUpdate(new Date().toISOString());
        }
      } catch (error: any) {
        console.error('Error in fetchCryptoData:', error);
        setError(error.message || 'Failed to fetch crypto data');
        
        // Set empty state
        setCryptoData([]);
        setPortfolioSummary({
          totalValue: 0,
          todayChange: 0,
          todayPercentage: 0,
          cryptoCount: 0,
          cashBalance: 0
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCryptoData();
  }, [selectedPortfolio, user, isTrading212Portfolio]);

  const handleRefresh = async () => {
    if (!isTrading212Portfolio) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await syncFreshData();
      toast({
        title: "Data Refreshed",
        description: "Trading212 data has been updated successfully",
      });
    } catch (error: any) {
      console.error('Manual refresh failed:', error);
      toast({
        title: "Refresh Failed",
        description: error.message || "Failed to refresh data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading crypto portfolio data...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              💰 Crypto Portfolio
              {isTrading212Portfolio && <Badge variant="default" className="bg-green-100 text-green-800">Live Trading212 Data</Badge>}
            </h1>
            <p className="text-muted-foreground">
              {selectedPortfolio ? `Portfolio: ${currentPortfolio?.name || 'Unknown'}` : 'Select a portfolio to view crypto holdings'}
            </p>
            {lastUpdate && (
              <p className="text-xs text-muted-foreground mt-1">
                Last updated: {new Date(lastUpdate).toLocaleString()}
              </p>
            )}
          </div>
          
          {isTrading212Portfolio && (
            <Button 
              onClick={handleRefresh} 
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>
          )}
        </div>

        {!selectedPortfolio ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">
                Please select a portfolio to view your crypto holdings
              </p>
            </CardContent>
          </Card>
        ) : error ? (
          <Alert>
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              {isTrading212Portfolio && (
                <Button onClick={handleRefresh} size="sm" variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              )}
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {/* Portfolio Summary */}
            {portfolioSummary && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-muted-foreground">Total Value</span>
                    </div>
                    <p className="text-2xl font-bold">
                      ${portfolioSummary.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      {portfolioSummary.todayChange >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                      <span className="text-sm text-muted-foreground">Today's Change</span>
                    </div>
                    <p className={`text-2xl font-bold ${portfolioSummary.todayChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {portfolioSummary.todayChange >= 0 ? '+' : ''}${Math.abs(portfolioSummary.todayChange).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className={`text-sm ${portfolioSummary.todayPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {portfolioSummary.todayPercentage >= 0 ? '+' : ''}{portfolioSummary.todayPercentage.toFixed(2)}%
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-muted-foreground">Crypto Assets</span>
                    </div>
                    <p className="text-2xl font-bold">{portfolioSummary.cryptoCount}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-muted-foreground">Cash Balance</span>
                    </div>
                    <p className="text-2xl font-bold">
                      ${portfolioSummary.cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Crypto Holdings */}
            <Card>
              <CardHeader>
                <CardTitle>Crypto Holdings</CardTitle>
              </CardHeader>
              <CardContent>
                {cryptoData.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      {isTrading212Portfolio 
                        ? "No crypto positions found in your Trading212 portfolio" 
                        : "No crypto holdings available"}
                    </p>
                    {isTrading212Portfolio && (
                      <div className="space-y-2">
                        <Button onClick={handleRefresh} variant="outline">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Refresh Data
                        </Button>
                        <p className="text-xs text-muted-foreground">
                          Or <Button variant="link" className="p-0 h-auto" asChild>
                            <a href="/brokers">manage your Trading212 connection</a>
                          </Button>
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cryptoData.map((crypto, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium text-lg">{crypto.symbol}</div>
                          <div className="text-sm text-muted-foreground">
                            {crypto.quantity} @ ${crypto.currentPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                          {crypto.averagePrice && (
                            <div className="text-xs text-muted-foreground">
                              Avg: ${crypto.averagePrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            ${crypto.marketValue?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                          {crypto.unrealizedPnL !== undefined && (
                            <div className={`text-sm ${crypto.unrealizedPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {crypto.unrealizedPnL >= 0 ? '+' : ''}${crypto.unrealizedPnL.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CryptoPayment;
