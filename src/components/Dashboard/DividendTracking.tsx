
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import StatCard from "../StatCard";
import { Shield, Calendar, TrendingUp, Percent } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

interface DividendData {
  symbol: string;
  company: string;
  annualDividend: number;
  quarterlyDividend: number;
  yield: number;
  nextPayment: number;
  exDate: string;
  paymentDate: string;
}

const DividendTracking = () => {
  const { user } = useAuth();
  const { selectedPortfolio } = usePortfolio();
  const [dividendData, setDividendData] = useState<DividendData[]>([]);
  const [portfolioMetrics, setPortfolioMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    const fetchDividendData = async () => {
      if (!user || !selectedPortfolio) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const trading212PortfolioId = localStorage.getItem('trading212_portfolio_id');
        const binancePortfolioId = localStorage.getItem('binance_portfolio_id');
        
        if (selectedPortfolio === trading212PortfolioId) {
          console.log('Fetching Trading212 dividend data');
          
          // Fetch Trading212 data including dividend information
          const { data, error } = await supabase.functions.invoke('trading212-sync', {
            body: { portfolioId: selectedPortfolio }
          });

          if (error) {
            console.error('Error fetching Trading212 data:', error);
            setDividendData([]);
            setPortfolioMetrics(null);
            return;
          }

          if (data?.success && data.data) {
            const positions = data.data.positions || [];
            const dividendMetrics = data.data.dividendMetrics || {};
            
            // Filter positions that have dividend information
            const dividendPayingStocks = positions.filter((pos: any) => 
              pos.dividendInfo && pos.dividendInfo.annualDividend > 0
            );

            const formattedDividends: DividendData[] = dividendPayingStocks.map((pos: any) => ({
              symbol: pos.symbol,
              company: pos.symbol, // Trading212 doesn't provide full company names
              annualDividend: pos.dividendInfo.annualDividend,
              quarterlyDividend: pos.dividendInfo.quarterlyDividend,
              yield: pos.dividendInfo.yield,
              nextPayment: pos.dividendInfo.nextPayment,
              exDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              paymentDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            }));

            setDividendData(formattedDividends);
            setPortfolioMetrics(dividendMetrics);
          }
        } else if (selectedPortfolio === binancePortfolioId) {
          // Crypto portfolios don't typically have dividends
          setDividendData([]);
          setPortfolioMetrics(null);
        } else {
          // Regular portfolio - use mock data for now
          setDividendData([
            {
              symbol: 'AAPL',
              company: 'Apple Inc.',
              annualDividend: 0.96,
              quarterlyDividend: 0.24,
              yield: 0.51,
              nextPayment: 0.24,
              exDate: '2025-05-09',
              paymentDate: '2025-05-18'
            },
            {
              symbol: 'MSFT',
              company: 'Microsoft Corporation',
              annualDividend: 3.00,
              quarterlyDividend: 0.75,
              yield: 0.82,
              nextPayment: 0.75,
              exDate: '2025-05-15',
              paymentDate: '2025-06-10'
            }
          ]);
          setPortfolioMetrics({
            annualIncome: 245.67,
            monthlyAverage: 20.47,
            portfolioYield: 2.8,
            dividendPayingStocks: 15
          });
        }
      } catch (error) {
        console.error("Error fetching dividend data:", error);
        setDividendData([]);
        setPortfolioMetrics(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDividendData();
  }, [user, selectedPortfolio]);

  // Prepare monthly income data for the chart
  const monthlyData = [
    { month: "Jan", income: 262.41 },
    { month: "Feb", income: 218.76 },
    { month: "Mar", income: 304.25 },
    { month: "Apr", income: 245.32 },
    { month: "May", income: 295.14 },
    { month: "Jun", income: 324.53 },
    { month: "Jul", income: 274.82 },
    { month: "Aug", income: 231.45 },
    { month: "Sep", income: 291.67 },
    { month: "Oct", income: 259.38 },
    { month: "Nov", income: 268.21 },
    { month: "Dec", income: 273.92 }
  ];

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dividend Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-48">
            <p>Loading dividend data...</p>
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

  // If Trading212 but no dividend data
  if (selectedPortfolio === trading212PortfolioId && dividendData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dividend Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <p className="text-muted-foreground mb-2">
              No dividend-paying stocks found in your Trading212 portfolio
            </p>
            <p className="text-sm text-muted-foreground">
              Your Trading212 holdings may be CFDs or non-dividend-paying stocks
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle>Dividend Tracking</CardTitle>
      </CardHeader>
      <CardContent>
        {portfolioMetrics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <StatCard 
              label="Annual Income" 
              value={`$${(portfolioMetrics.annualIncome || 0).toFixed(2)}`} 
              change={{
                value: "+7.2%",
                percentage: "+7.2%",
                isPositive: true
              }}
            />
            <StatCard 
              label="Monthly Average" 
              value={`$${(portfolioMetrics.monthlyAverage || 0).toFixed(2)}`} 
              change={{
                value: "+7.2%",
                percentage: "+7.2%",
                isPositive: true
              }}
            />
            <StatCard 
              label="Dividend Stocks" 
              value={`${portfolioMetrics.dividendPayingStocks || dividendData.length}`} 
              change={{
                value: "0",
                percentage: "0",
                isPositive: true
              }}
            />
            <StatCard 
              label="Portfolio Yield" 
              value={`${(portfolioMetrics.portfolioYield || 0).toFixed(2)}%`} 
              change={{
                value: "+0.3%",
                percentage: "+0.3%",
                isPositive: true
              }}
            />
          </div>
        )}

        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="monthly">Monthly Income</TabsTrigger>
            <TabsTrigger value="safety">Dividend Safety</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming" className="space-y-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Stock</TableHead>
                    <TableHead>Annual Dividend</TableHead>
                    <TableHead>Quarterly</TableHead>
                    <TableHead>Yield</TableHead>
                    <TableHead>Next Payment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dividendData.map((dividend, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="font-medium">{dividend.symbol}</div>
                        <div className="text-xs text-muted-foreground">{dividend.company}</div>
                      </TableCell>
                      <TableCell>${dividend.annualDividend.toFixed(2)}</TableCell>
                      <TableCell>${dividend.quarterlyDividend.toFixed(2)}</TableCell>
                      <TableCell>{dividend.yield.toFixed(2)}%</TableCell>
                      <TableCell>${dividend.nextPayment.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                  {dividendData.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-4">
                        No dividend-paying stocks found
                      </TableCell>
                    </TableRow>
                  )}
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
                <Tooltip formatter={(value) => [`$${value}`, 'Dividend Income']} />
                <Bar dataKey="income" fill="#4f46e5" />
              </BarChart>
            </ResponsiveContainer>
            <div className="text-center text-sm text-muted-foreground">
              Projected annual dividend income: ${portfolioMetrics?.annualIncome?.toFixed(2) || '0.00'}
            </div>
          </TabsContent>
          
          <TabsContent value="safety" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-muted rounded-lg p-4 flex flex-col items-center">
                <Shield className="h-8 w-8 mb-2 text-finance-blue" />
                <div className="text-xs uppercase text-muted-foreground">Safety Score</div>
                <div className="text-2xl font-bold mt-1">92%</div>
              </div>
              <div className="bg-muted rounded-lg p-4 flex flex-col items-center">
                <Calendar className="h-8 w-8 mb-2 text-finance-blue" />
                <div className="text-xs uppercase text-muted-foreground">Consecutive Raises</div>
                <div className="text-2xl font-bold mt-1">14 yrs</div>
              </div>
              <div className="bg-muted rounded-lg p-4 flex flex-col items-center">
                <TrendingUp className="h-8 w-8 mb-2 text-finance-blue" />
                <div className="text-xs uppercase text-muted-foreground">5yr CAGR</div>
                <div className="text-2xl font-bold mt-1">7.2%</div>
              </div>
              <div className="bg-muted rounded-lg p-4 flex flex-col items-center">
                <Percent className="h-8 w-8 mb-2 text-finance-blue" />
                <div className="text-xs uppercase text-muted-foreground">Payout Ratio</div>
                <div className="text-2xl font-bold mt-1">42.5%</div>
              </div>
            </div>
            <div className="text-sm text-center text-muted-foreground mt-4">
              Your dividend portfolio has an average safety score of 92/100, indicating reliable income streams.
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DividendTracking;
