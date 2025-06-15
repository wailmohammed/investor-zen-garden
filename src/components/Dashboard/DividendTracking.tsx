
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import StatCard from "../StatCard";
import { Shield, Calendar, TrendingUp, Percent, RefreshCw, DollarSign, Database, AlertTriangle, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { calculateDividendIncome } from "@/services/dividendCalculator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

interface DividendData {
  symbol: string;
  company: string;
  shares: number;
  annualDividend: number;
  quarterlyDividend: number;
  totalAnnualIncome: number;
  totalQuarterlyIncome: number;
  yield: number;
  frequency: 'quarterly' | 'annual' | 'monthly' | 'semi-annual';
  nextPayment: number;
  exDate: string;
  paymentDate: string;
  currentValue: number;
  hasDiv: boolean;
  isNewlyAdded?: boolean;
  apiSource?: string;
}

const DividendTracking = () => {
  const { user } = useAuth();
  const { selectedPortfolio } = usePortfolio();
  const { toast } = useToast();
  const [dividendData, setDividendData] = useState<DividendData[]>([]);
  const [portfolioMetrics, setPortfolioMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('holdings');
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const saveDetectedDividends = async () => {
    if (!user || !selectedPortfolio || !dividendData.length) {
      toast({
        title: "No Data to Save",
        description: "No dividend data available to save",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      console.log('Saving detected dividends to database...');
      
      // Call the dividend detection edge function to save data
      const { data, error } = await supabase.functions.invoke('dividend-detection', {
        body: {
          portfolioId: selectedPortfolio,
          userId: user.id,
          saveData: true,
          dividendData: dividendData
        }
      });

      if (error) {
        console.error('Error saving dividend data:', error);
        throw new Error(error.message || 'Failed to save dividend data');
      }

      if (data?.success) {
        toast({
          title: "Data Saved Successfully",
          description: `Saved ${dividendData.length} dividend stocks to database`,
          variant: "default",
        });
        console.log('Dividend data saved successfully:', data);
      } else {
        throw new Error(data?.error || 'Failed to save dividend data');
      }
    } catch (error: any) {
      console.error('Error saving dividend data:', error);
      toast({
        title: "Save Failed",
        description: error.message || 'Failed to save dividend data',
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const fetchDividendData = async (forceRefresh = false) => {
    if (!user || !selectedPortfolio) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    if (forceRefresh) {
      setRefreshing(true);
      toast({
        title: "Refreshing Data",
        description: "Analyzing portfolio for dividend stocks...",
      });
    }
    setProcessingStatus('Initializing comprehensive dividend analysis...');

    try {
      const trading212PortfolioId = localStorage.getItem('trading212_portfolio_id');
      
      if (selectedPortfolio === trading212PortfolioId) {
        console.log('Starting ENHANCED Trading212 dividend analysis with multiple free APIs');
        
        setProcessingStatus('Connecting to Trading212 and preparing API services...');
        
        // Fetch Trading212 positions with better error handling
        const { data, error: functionError } = await supabase.functions.invoke('trading212-sync', {
          body: { portfolioId: selectedPortfolio, forceRefresh }
        });

        if (functionError) {
          console.error('Error calling trading212-sync:', functionError);
          throw new Error(functionError.message || 'Failed to fetch Trading212 data');
        }

        if (data?.error) {
          console.error('Trading212 sync error:', data.error);
          if (data.error.includes('RATE_LIMITED')) {
            setError('Trading212 API rate limit reached. Please try again in a few minutes.');
            toast({
              title: "Rate Limited",
              description: "Trading212 API rate limit reached. Using cached data if available.",
              variant: "destructive",
            });
            // Try to use cached data
            const cachedData = localStorage.getItem('trading212_data');
            if (cachedData) {
              try {
                const parsedData = JSON.parse(cachedData);
                if (parsedData.positions) {
                  setProcessingStatus('Using cached Trading212 data for dividend analysis...');
                  const dividendResults = await calculateDividendIncome(parsedData.positions);
                  
                  setDividendData(dividendResults.dividendPayingStocks);
                  setPortfolioMetrics({
                    annualIncome: dividendResults.totalAnnualIncome,
                    quarterlyIncome: dividendResults.totalQuarterlyIncome,
                    monthlyAverage: dividendResults.totalAnnualIncome / 12,
                    portfolioYield: dividendResults.portfolioYield,
                    dividendPayingStocks: dividendResults.dividendPayingStocks.length,
                    totalStocksAnalyzed: parsedData.positions.length,
                    databaseSize: dividendResults.stats.databaseSize,
                    newStocksAdded: dividendResults.stats.newStocksAdded,
                    coveragePercentage: dividendResults.stats.coveragePercentage,
                    processingErrors: dividendResults.stats.processingErrors,
                    apiCallsMade: dividendResults.stats.apiCallsMade,
                    databaseHits: dividendResults.stats.databaseHits
                  });
                  setProcessingStatus('Using cached data - analysis complete');
                  return;
                }
              } catch (parseError) {
                console.error('Error parsing cached data:', parseError);
              }
            }
            
            // No cached data available
            setDividendData([]);
            setPortfolioMetrics({
              annualIncome: 0,
              quarterlyIncome: 0,
              monthlyAverage: 0,
              portfolioYield: 0,
              dividendPayingStocks: 0,
              totalStocksAnalyzed: 0,
              databaseSize: 0,
              newStocksAdded: 0,
              coveragePercentage: 0,
              processingErrors: 1,
              apiCallsMade: 0,
              databaseHits: 0
            });
            setProcessingStatus('Rate limited - no cached data available');
            return;
          } else {
            throw new Error(data.error);
          }
        }

        if (data?.success && data.data?.positions) {
          const positions = data.data.positions;
          console.log('Trading212 positions found:', positions.length);
          
          setProcessingStatus(`Analyzing ${positions.length} holdings with comprehensive API detection...`);
          
          // Use ENHANCED dividend calculator with comprehensive API detection
          const dividendResults = await calculateDividendIncome(positions);
          
          console.log('🎉 ENHANCED dividend calculation completed:', {
            totalAnnual: dividendResults.totalAnnualIncome,
            stocksWithDividends: dividendResults.dividendPayingStocks.length,
            portfolioYield: dividendResults.portfolioYield,
            newlyDetected: dividendResults.stats.newStocksAdded,
            apiCallsMade: dividendResults.stats.apiCallsMade,
            databaseHits: dividendResults.stats.databaseHits,
            databaseSize: dividendResults.stats.databaseSize
          });
          
          setDividendData(dividendResults.dividendPayingStocks);
          setPortfolioMetrics({
            annualIncome: dividendResults.totalAnnualIncome,
            quarterlyIncome: dividendResults.totalQuarterlyIncome,
            monthlyAverage: dividendResults.totalAnnualIncome / 12,
            portfolioYield: dividendResults.portfolioYield,
            dividendPayingStocks: dividendResults.dividendPayingStocks.length,
            totalStocksAnalyzed: positions.length,
            databaseSize: dividendResults.stats.databaseSize,
            newStocksAdded: dividendResults.stats.newStocksAdded,
            coveragePercentage: dividendResults.stats.coveragePercentage,
            processingErrors: dividendResults.stats.processingErrors,
            apiCallsMade: dividendResults.stats.apiCallsMade,
            databaseHits: dividendResults.stats.databaseHits
          });
          
          setProcessingStatus('Enhanced analysis complete with comprehensive API detection');
          
          if (forceRefresh) {
            toast({
              title: "Refresh Complete",
              description: `Found ${dividendResults.dividendPayingStocks.length} dividend stocks from ${positions.length} holdings`,
            });
          }
        } else {
          console.log('No Trading212 position data available');
          setDividendData([]);
          setPortfolioMetrics(null);
          setProcessingStatus('No Trading212 data available');
          setError('No portfolio data found. Please ensure your Trading212 portfolio is properly connected.');
        }
      } else {
        // For other portfolios, show appropriate message
        setDividendData([]);
        setPortfolioMetrics(null);
        setProcessingStatus('Portfolio not supported for dividend tracking');
        setError('This portfolio type does not support dividend tracking. Please select a Trading212 portfolio.');
      }
    } catch (error: any) {
      console.error("Error in enhanced dividend calculation:", error);
      setError(error.message || 'Failed to analyze portfolio for dividends');
      setDividendData([]);
      setPortfolioMetrics(null);
      setProcessingStatus('Error during enhanced analysis');
      
      toast({
        title: "Analysis Failed",
        description: error.message || 'Failed to analyze portfolio for dividends',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleManualRefresh = () => {
    fetchDividendData(true);
  };

  const triggerAutoSync = async () => {
    if (!user || !selectedPortfolio) return;

    try {
      setRefreshing(true);
      toast({
        title: "Triggering Auto Sync",
        description: "Starting automated dividend detection...",
      });

      const { data, error } = await supabase.functions.invoke('run-scheduled-task', {
        body: { taskName: 'dividend-detection' }
      });

      if (error) {
        throw new Error(error.message || 'Failed to trigger auto sync');
      }

      if (data?.success) {
        toast({
          title: "Auto Sync Triggered",
          description: "Dividend detection job has been started",
          variant: "default",
        });
        
        // Refresh data after a delay
        setTimeout(() => {
          fetchDividendData(true);
        }, 2000);
      } else {
        throw new Error(data?.error || 'Failed to trigger auto sync');
      }
    } catch (error: any) {
      console.error('Error triggering auto sync:', error);
      toast({
        title: "Auto Sync Failed",
        description: error.message || 'Failed to trigger auto sync',
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDividendData();
  }, [user, selectedPortfolio]);

  // Prepare monthly income projection data for the chart
  const monthlyData = portfolioMetrics ? [
    { month: "Jan", income: portfolioMetrics.monthlyAverage * 0.95 },
    { month: "Feb", income: portfolioMetrics.monthlyAverage * 0.88 },
    { month: "Mar", income: portfolioMetrics.monthlyAverage * 1.15 },
    { month: "Apr", income: portfolioMetrics.monthlyAverage * 0.92 },
    { month: "May", income: portfolioMetrics.monthlyAverage * 1.08 },
    { month: "Jun", income: portfolioMetrics.monthlyAverage * 1.22 },
    { month: "Jul", income: portfolioMetrics.monthlyAverage * 1.05 },
    { month: "Aug", income: portfolioMetrics.monthlyAverage * 0.85 },
    { month: "Sep", income: portfolioMetrics.monthlyAverage * 1.12 },
    { month: "Oct", income: portfolioMetrics.monthlyAverage * 0.98 },
    { month: "Nov", income: portfolioMetrics.monthlyAverage * 1.03 },
    { month: "Dec", income: portfolioMetrics.monthlyAverage * 1.07 }
  ] : [];

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>🚀 Enhanced Dividend Tracker with Comprehensive API Detection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col justify-center items-center h-48 space-y-2">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
            <p>{processingStatus}</p>
            <p className="text-sm text-muted-foreground">Using Yahoo Finance, Alpha Vantage, FMP & Polygon APIs...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!selectedPortfolio) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Enhanced Dividend Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-48">
            <p className="text-muted-foreground">Select a portfolio to view dividend data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Check if this is a portfolio without dividends
  const trading212PortfolioId = localStorage.getItem('trading212_portfolio_id');
  const binancePortfolioId = localStorage.getItem('binance_portfolio_id');
  
  if (selectedPortfolio === binancePortfolioId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Enhanced Dividend Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <p className="text-muted-foreground mb-2">
              Crypto portfolios don't include dividend-paying assets
            </p>
            <p className="text-sm text-muted-foreground">
              Switch to a stock portfolio to view dividend data
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>🌟 Enhanced Dividend Tracker with Comprehensive API Detection</CardTitle>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={saveDetectedDividends}
              disabled={saving || !dividendData.length}
            >
              <Save className={`h-4 w-4 mr-2 ${saving ? 'animate-spin' : ''}`} />
              {saving ? 'Saving...' : 'Save Data'}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleManualRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={triggerAutoSync}
              disabled={refreshing}
            >
              <Database className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Auto Sync
            </Button>
          </div>
        </div>
        {portfolioMetrics && (
          <>
            <p className="text-sm text-muted-foreground">
              Enhanced Detection: {portfolioMetrics.dividendPayingStocks} dividend payers from {portfolioMetrics.totalStocksAnalyzed} holdings
              • Database: {portfolioMetrics.databaseSize} stocks • API Calls: {portfolioMetrics.apiCallsMade} • Cache Hits: {portfolioMetrics.databaseHits}
            </p>
            {portfolioMetrics.newStocksAdded > 0 && (
              <Alert className="mt-2">
                <Database className="h-4 w-4" />
                <AlertDescription>
                  🎉 Discovered {portfolioMetrics.newStocksAdded} new dividend payers using comprehensive API detection from Yahoo Finance, Alpha Vantage, FMP & Polygon
                </AlertDescription>
              </Alert>
            )}
          </>
        )}
        {error && (
          <Alert variant="destructive" className="mt-2">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error}
              <div className="flex gap-2 mt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleManualRefresh}
                  disabled={refreshing}
                >
                  Try Again
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={triggerAutoSync}
                  disabled={refreshing}
                >
                  Auto Sync
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>
      <CardContent>
        {portfolioMetrics && dividendData.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <StatCard 
                label="Annual Income" 
                value={`$${portfolioMetrics.annualIncome.toFixed(2)}`} 
                change={{
                  value: "+7.2%",
                  percentage: "+7.2%",
                  isPositive: true
                }}
                icon={<DollarSign className="h-4 w-4" />}
              />
              <StatCard 
                label="Monthly Average" 
                value={`$${portfolioMetrics.monthlyAverage.toFixed(2)}`} 
                change={{
                  value: "+7.2%",
                  percentage: "+7.2%",
                  isPositive: true
                }}
                icon={<Calendar className="h-4 w-4" />}
              />
              <StatCard 
                label="Dividend Stocks" 
                value={`${portfolioMetrics.dividendPayingStocks}`} 
                change={{
                  value: `${portfolioMetrics.newStocksAdded} new`,
                  percentage: `${portfolioMetrics.newStocksAdded} new`,
                  isPositive: true
                }}
                icon={<Shield className="h-4 w-4" />}
              />
              <StatCard 
                label="Portfolio Yield" 
                value={`${portfolioMetrics.portfolioYield.toFixed(2)}%`} 
                change={{
                  value: "+0.3%",
                  percentage: "+0.3%",
                  isPositive: true
                }}
                icon={<Percent className="h-4 w-4" />}
              />
            </div>

            <Tabs 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="space-y-4"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="holdings">Enhanced Holdings</TabsTrigger>
                <TabsTrigger value="projections">Monthly Projections</TabsTrigger>
                <TabsTrigger value="analysis">API Analysis</TabsTrigger>
              </TabsList>
              
              <TabsContent value="holdings" className="space-y-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Company</TableHead>
                        <TableHead>Shares</TableHead>
                        <TableHead>Dividend/Share</TableHead>
                        <TableHead>Annual Income</TableHead>
                        <TableHead>Yield</TableHead>
                        <TableHead>Detection</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dividendData.map((dividend, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div className="font-medium">{dividend.symbol}</div>
                            <div className="text-xs text-muted-foreground">{dividend.company}</div>
                          </TableCell>
                          <TableCell>{dividend.shares.toFixed(6)}</TableCell>
                          <TableCell>${dividend.annualDividend.toFixed(2)}</TableCell>
                          <TableCell className="font-medium text-green-600">
                            ${dividend.totalAnnualIncome.toFixed(2)}
                          </TableCell>
                          <TableCell>{dividend.yield.toFixed(2)}%</TableCell>
                          <TableCell>
                            {dividend.isNewlyAdded ? (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded flex items-center gap-1">
                                🆕 API
                                {dividend.apiSource && <span className="text-xs">({dividend.apiSource})</span>}
                              </span>
                            ) : (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">💾 Known</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              
              <TabsContent value="projections" className="space-y-4">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Projected Dividend Income']} />
                    <Bar dataKey="income" fill="#4f46e5" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="text-center text-sm text-muted-foreground">
                  Enhanced projected annual dividend income: ${portfolioMetrics.annualIncome.toFixed(2)}
                </div>
              </TabsContent>
              
              <TabsContent value="analysis" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-muted rounded-lg p-4 flex flex-col items-center">
                    <Database className="h-8 w-8 mb-2 text-finance-blue" />
                    <div className="text-xs uppercase text-muted-foreground">Database Size</div>
                    <div className="text-2xl font-bold mt-1">{portfolioMetrics.databaseSize}</div>
                  </div>
                  <div className="bg-muted rounded-lg p-4 flex flex-col items-center">
                    <TrendingUp className="h-8 w-8 mb-2 text-finance-blue" />
                    <div className="text-xs uppercase text-muted-foreground">API Calls</div>
                    <div className="text-2xl font-bold mt-1">{portfolioMetrics.apiCallsMade}</div>
                  </div>
                  <div className="bg-muted rounded-lg p-4 flex flex-col items-center">
                    <Shield className="h-8 w-8 mb-2 text-finance-blue" />
                    <div className="text-xs uppercase text-muted-foreground">Cache Hits</div>
                    <div className="text-2xl font-bold mt-1">{portfolioMetrics.databaseHits}</div>
                  </div>
                  <div className="bg-muted rounded-lg p-4 flex flex-col items-center">
                    <Percent className="h-8 w-8 mb-2 text-finance-blue" />
                    <div className="text-xs uppercase text-muted-foreground">New Detected</div>
                    <div className="text-2xl font-bold mt-1">{portfolioMetrics.newStocksAdded}</div>
                  </div>
                </div>
                <div className="text-sm text-center text-muted-foreground mt-4">
                  🌟 Enhanced dividend detection using Yahoo Finance, Alpha Vantage, Financial Modeling Prep & Polygon APIs.
                  <br />
                  Comprehensive analysis of {portfolioMetrics.totalStocksAnalyzed} holdings with real-time API detection for maximum accuracy.
                </div>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
            <p className="text-muted-foreground mb-2">
              {error ? error : portfolioMetrics ? 
                'No dividend-paying stocks found in your current holdings' : 
                'Unable to load enhanced dividend data'
              }
            </p>
            {portfolioMetrics && (
              <p className="text-sm text-muted-foreground mb-4">
                Analyzed {portfolioMetrics.totalStocksAnalyzed} holdings with enhanced database of {portfolioMetrics.databaseSize} stocks
              </p>
            )}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleManualRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Try Again'}
              </Button>
              <Button 
                variant="outline" 
                onClick={triggerAutoSync}
                disabled={refreshing}
              >
                <Database className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Auto Sync
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DividendTracking;
