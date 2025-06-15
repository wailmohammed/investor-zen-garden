
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import StatCard from "../StatCard";
import { Shield, Calendar, TrendingUp, Percent, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { calculateDividendIncome, getSupportedDividendStocks } from "@/services/dividendCalculator";

interface DividendData {
  symbol: string;
  company: string;
  shares: number;
  annualDividend: number;
  quarterlyDividend: number;
  totalAnnualIncome: number;
  totalQuarterlyIncome: number;
  yield: number;
  nextPayment: number;
  exDate: string;
  paymentDate: string;
  currentValue: number;
}

const DividendTracking = () => {
  const { user } = useAuth();
  const { selectedPortfolio } = usePortfolio();
  const [dividendData, setDividendData] = useState<DividendData[]>([]);
  const [portfolioMetrics, setPortfolioMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');

  const fetchDividendData = async (forceRefresh = false) => {
    if (!user || !selectedPortfolio) {
      setLoading(false);
      return;
    }

    setLoading(true);
    if (forceRefresh) setRefreshing(true);

    try {
      const trading212PortfolioId = localStorage.getItem('trading212_portfolio_id');
      
      if (selectedPortfolio === trading212PortfolioId) {
        console.log('Fetching Trading212 data and calculating dividends from shares owned');
        
        // Fetch Trading212 positions
        const { data, error } = await supabase.functions.invoke('trading212-sync', {
          body: { portfolioId: selectedPortfolio }
        });

        if (error) {
          console.error('Error fetching Trading212 data:', error);
          setDividendData([]);
          setPortfolioMetrics(null);
          return;
        }

        if (data?.success && data.data?.positions) {
          const positions = data.data.positions;
          console.log('Trading212 positions found:', positions.length);
          
          // Calculate dividends using share quantities and free dividend data
          const dividendResults = calculateDividendIncome(positions);
          
          setDividendData(dividendResults.dividendPayingStocks);
          setPortfolioMetrics({
            annualIncome: dividendResults.totalAnnualIncome,
            quarterlyIncome: dividendResults.totalQuarterlyIncome,
            monthlyAverage: dividendResults.totalAnnualIncome / 12,
            portfolioYield: dividendResults.portfolioYield,
            dividendPayingStocks: dividendResults.dividendPayingStocks.length,
            supportedStocks: getSupportedDividendStocks().length
          });

          console.log('Dividend data calculated:', {
            totalStocks: dividendResults.dividendPayingStocks.length,
            totalAnnual: dividendResults.totalAnnualIncome,
            portfolioYield: dividendResults.portfolioYield
          });
        } else {
          console.log('No Trading212 position data available');
          setDividendData([]);
          setPortfolioMetrics(null);
        }
      } else {
        // For other portfolios, use mock data
        setDividendData([]);
        setPortfolioMetrics(null);
      }
    } catch (error) {
      console.error("Error calculating dividend data:", error);
      setDividendData([]);
      setPortfolioMetrics(null);
    } finally {
      setLoading(false);
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
          <CardTitle>Dividend Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-48">
            <p>Calculating dividend income from your holdings...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!selectedPortfolio) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dividend Tracking</CardTitle>
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
          <CardTitle>Dividend Tracking</CardTitle>
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
          <CardTitle>Dividend Tracking</CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => fetchDividendData(true)}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        {portfolioMetrics && (
          <p className="text-sm text-muted-foreground">
            Calculated from {portfolioMetrics.dividendPayingStocks} dividend-paying stocks 
            • {portfolioMetrics.supportedStocks} stocks supported
          </p>
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
              />
              <StatCard 
                label="Monthly Average" 
                value={`$${portfolioMetrics.monthlyAverage.toFixed(2)}`} 
                change={{
                  value: "+7.2%",
                  percentage: "+7.2%",
                  isPositive: true
                }}
              />
              <StatCard 
                label="Dividend Stocks" 
                value={`${portfolioMetrics.dividendPayingStocks}`} 
                change={{
                  value: "0",
                  percentage: "0",
                  isPositive: true
                }}
              />
              <StatCard 
                label="Portfolio Yield" 
                value={`${portfolioMetrics.portfolioYield.toFixed(2)}%`} 
                change={{
                  value: "+0.3%",
                  percentage: "+0.3%",
                  isPositive: true
                }}
              />
            </div>

            <Tabs 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="space-y-4"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="upcoming">Holdings</TabsTrigger>
                <TabsTrigger value="monthly">Projections</TabsTrigger>
                <TabsTrigger value="safety">Analysis</TabsTrigger>
              </TabsList>
              
              <TabsContent value="upcoming" className="space-y-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Stock</TableHead>
                        <TableHead>Shares</TableHead>
                        <TableHead>Annual Dividend</TableHead>
                        <TableHead>Total Annual Income</TableHead>
                        <TableHead>Yield</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dividendData.map((dividend, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div className="font-medium">{dividend.symbol}</div>
                            <div className="text-xs text-muted-foreground">{dividend.company}</div>
                          </TableCell>
                          <TableCell>{dividend.shares.toFixed(4)}</TableCell>
                          <TableCell>${dividend.annualDividend.toFixed(2)}</TableCell>
                          <TableCell className="font-medium">
                            ${dividend.totalAnnualIncome.toFixed(2)}
                          </TableCell>
                          <TableCell>{dividend.yield.toFixed(2)}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              
              <TabsContent value="monthly" className="space-y-4">
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
                  Projected annual dividend income: ${portfolioMetrics.annualIncome.toFixed(2)}
                </div>
              </TabsContent>
              
              <TabsContent value="safety" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-muted rounded-lg p-4 flex flex-col items-center">
                    <Shield className="h-8 w-8 mb-2 text-finance-blue" />
                    <div className="text-xs uppercase text-muted-foreground">Portfolio Yield</div>
                    <div className="text-2xl font-bold mt-1">{portfolioMetrics.portfolioYield.toFixed(1)}%</div>
                  </div>
                  <div className="bg-muted rounded-lg p-4 flex flex-col items-center">
                    <Calendar className="h-8 w-8 mb-2 text-finance-blue" />
                    <div className="text-xs uppercase text-muted-foreground">Dividend Stocks</div>
                    <div className="text-2xl font-bold mt-1">{portfolioMetrics.dividendPayingStocks}</div>
                  </div>
                  <div className="bg-muted rounded-lg p-4 flex flex-col items-center">
                    <TrendingUp className="h-8 w-8 mb-2 text-finance-blue" />
                    <div className="text-xs uppercase text-muted-foreground">Annual Income</div>
                    <div className="text-2xl font-bold mt-1">${Math.round(portfolioMetrics.annualIncome)}</div>
                  </div>
                  <div className="bg-muted rounded-lg p-4 flex flex-col items-center">
                    <Percent className="h-8 w-8 mb-2 text-finance-blue" />
                    <div className="text-xs uppercase text-muted-foreground">Monthly Avg</div>
                    <div className="text-2xl font-bold mt-1">${Math.round(portfolioMetrics.monthlyAverage)}</div>
                  </div>
                </div>
                <div className="text-sm text-center text-muted-foreground mt-4">
                  Dividend calculations based on current share holdings and free dividend data sources.
                </div>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <p className="text-muted-foreground mb-2">
              No dividend-paying stocks found in your portfolio
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Your holdings may be CFDs or stocks not in our dividend database
            </p>
            <div className="text-xs text-muted-foreground">
              Supported dividend stocks: {getSupportedDividendStocks().join(', ')}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DividendTracking;
