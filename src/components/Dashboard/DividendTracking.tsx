import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getUpcomingDividends, getDividendPortfolio } from "@/services/dividendService";
import { useAuth } from "@/contexts/AuthContext";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { Dividend, DividendPortfolio } from "@/models/dividend";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import StatCard from "../StatCard";
import { Shield, Calendar, TrendingUp, Percent } from "lucide-react";
import { format } from "date-fns";

const DividendTracking = () => {
  const { user } = useAuth();
  const { selectedPortfolio } = usePortfolio();
  const [upcomingDividends, setUpcomingDividends] = useState<Dividend[]>([]);
  const [portfolio, setPortfolio] = useState<DividendPortfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !selectedPortfolio) {
        console.log('No user or selected portfolio for dividend data');
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        console.log('Fetching dividend data for portfolio:', selectedPortfolio);
        
        // Check if this is a connected broker portfolio
        const trading212PortfolioId = localStorage.getItem('trading212_portfolio_id');
        const binancePortfolioId = localStorage.getItem('binance_portfolio_id');
        
        if (selectedPortfolio === trading212PortfolioId) {
          // Trading212 portfolios typically don't have dividends (mostly CFDs)
          console.log('Trading212 portfolio - no dividend data');
          setUpcomingDividends([]);
          setPortfolio(null);
        } else if (selectedPortfolio === binancePortfolioId) {
          // Crypto portfolios don't have traditional dividends
          console.log('Binance portfolio - no dividend data');
          setUpcomingDividends([]);
          setPortfolio(null);
        } else {
          // Regular portfolio - fetch dividend data
          const [dividends, portfolioData] = await Promise.all([
            getUpcomingDividends(user.id),
            getDividendPortfolio(user.id)
          ]);

          console.log('Dividend data fetched:', { dividends, portfolioData });
          setUpcomingDividends(dividends);
          setPortfolio(portfolioData);
        }
      } catch (error) {
        console.error("Error fetching dividend data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

  // Group dividends by month for calendar view
  const calendarData = upcomingDividends.reduce<{[key: string]: {count: number, amount: number}}>((acc, dividend) => {
    const month = format(new Date(dividend.exDate), 'MMM');
    
    if (!acc[month]) {
      acc[month] = { count: 0, amount: 0 };
    }
    
    acc[month].count += 1;
    acc[month].amount += dividend.amount;
    
    return acc;
  }, {});

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

  // Check if this is a broker portfolio without dividends
  const trading212PortfolioId = localStorage.getItem('trading212_portfolio_id');
  const binancePortfolioId = localStorage.getItem('binance_portfolio_id');
  
  if (selectedPortfolio === trading212PortfolioId || selectedPortfolio === binancePortfolioId) {
    const brokerName = selectedPortfolio === trading212PortfolioId ? 'Trading212' : 'Binance';
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dividend Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <p className="text-muted-foreground mb-2">
              {brokerName} portfolios typically don't include dividend-paying assets
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
        <CardTitle>Dividend Tracking</CardTitle>
      </CardHeader>
      <CardContent>
        {portfolio && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {portfolio.metrics.map((metric, index) => (
                <StatCard 
                  key={index}
                  label={metric.name} 
                  value={metric.value.toString()} 
                  change={{
                    value: metric.changeValue?.toString() || "",
                    percentage: metric.changePercent?.toString() + "%" || "",
                    isPositive: metric.isPositive || false
                  }}
                />
              ))}
            </div>

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
                        <TableHead>Company</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Ex-Date</TableHead>
                        <TableHead>Payment Date</TableHead>
                        <TableHead>Yield</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {upcomingDividends.map((dividend) => (
                        <TableRow key={dividend.id}>
                          <TableCell>
                            <div className="font-medium">{dividend.symbol}</div>
                            <div className="text-xs text-muted-foreground">{dividend.company}</div>
                          </TableCell>
                          <TableCell>${dividend.amount.toFixed(4)}</TableCell>
                          <TableCell>{new Date(dividend.exDate).toLocaleDateString()}</TableCell>
                          <TableCell>{new Date(dividend.paymentDate).toLocaleDateString()}</TableCell>
                          <TableCell>{dividend.yield.toFixed(2)}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* New: Calendar preview */}
                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-2">Dividends This Quarter</h3>
                  <div className="flex gap-2">
                    {Object.entries(calendarData).map(([month, data]) => (
                      <div key={month} className="flex-1 bg-muted rounded-md p-3 text-center">
                        <div className="text-lg font-medium">{month}</div>
                        <div className="text-sm text-muted-foreground">{data.count} dividends</div>
                        <div className="text-lg font-bold mt-1">${data.amount.toFixed(2)}</div>
                      </div>
                    ))}
                    {Object.keys(calendarData).length === 0 && (
                      <div className="flex-1 bg-muted rounded-md p-3 text-center">
                        <div className="text-sm text-muted-foreground">No upcoming dividends</div>
                      </div>
                    )}
                  </div>
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
                  Projected annual dividend income: ${portfolio.annualIncome.toFixed(2)}
                </div>

                {/* New: Monthly contribution breakdown */}
                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-2">Top Contributing Months</h3>
                  <div className="space-y-2">
                    {monthlyData
                      .sort((a, b) => b.income - a.income)
                      .slice(0, 3)
                      .map((month, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="h-3 w-3 rounded-full bg-blue-500 mr-2"></div>
                            <span>{month.month}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">${month.income.toFixed(2)}</span>
                            <span className="text-xs text-muted-foreground">
                              ({((month.income / portfolio.annualIncome) * 100).toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
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

                {/* New: Safety score explanation */}
                <div className="bg-muted rounded-lg p-4 mt-4">
                  <h3 className="font-medium mb-2">Understanding Dividend Safety</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    A dividend safety score above 80 indicates the company is likely to maintain or increase its dividend during economic downturns.
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Safe (80-100)</span>
                      <span className="font-medium">85% of your portfolio</span>
                    </div>
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span>Borderline (60-79)</span>
                      <span className="font-medium">12% of your portfolio</span>
                    </div>
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-500 rounded-full" style={{ width: '12%' }}></div>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span>Unsafe (0-59)</span>
                      <span className="font-medium">3% of your portfolio</span>
                    </div>
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 rounded-full" style={{ width: '3%' }}></div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
        {!portfolio && (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <p className="text-muted-foreground mb-4">No dividend data available for this portfolio</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DividendTracking;
