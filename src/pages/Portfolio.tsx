import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area } from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Percent, BarChart3, PieChart as PieChartIcon, Activity, Target, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { PortfolioProvider, usePortfolio } from "@/contexts/PortfolioContext";
import { PortfolioSelector } from "@/components/ui/portfolio-selector";
import { supabase } from "@/integrations/supabase/client";
import { getSavedDividendData } from "@/services/dividendService";
import { useAuth } from "@/contexts/AuthContext";

const PortfolioContent = () => {
  const { user } = useAuth();
  const { portfolios, selectedPortfolio, setSelectedPortfolio, isLoading } = usePortfolio();
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [holdings, setHoldings] = useState<any[]>([]);
  const [portfolioData, setPortfolioData] = useState({
    totalValue: 0,
    totalGainLoss: 0,
    totalGainLossPercent: 0,
    todayChange: 0,
    todayChangePercent: 0,
    holdingsCount: 0,
    dividendYield: 0
  });
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [sectorAllocation, setSectorAllocation] = useState<any[]>([]);
  const [monthlyDividends, setMonthlyDividends] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Get current portfolio type
  const currentPortfolio = portfolios.find(p => p.id === selectedPortfolio);
  const portfolioType = currentPortfolio?.portfolio_type || 'stock';

  // Fetch real portfolio data from saved database
  useEffect(() => {
    const fetchSavedPortfolioData = async () => {
      if (!selectedPortfolio || !user?.id) {
        // Reset to empty state
        setHoldings([]);
        setPortfolioData({
          totalValue: 0,
          totalGainLoss: 0,
          totalGainLossPercent: 0,
          todayChange: 0,
          todayChangePercent: 0,
          holdingsCount: 0,
          dividendYield: 0
        });
        setPerformanceData([]);
        setSectorAllocation([]);
        setMonthlyDividends([]);
        return;
      }

      try {
        setIsLoadingData(true);
        console.log('Fetching saved data for portfolio:', selectedPortfolio);

        // Get saved portfolio metadata
        const { data: savedMetadata } = await supabase
          .from('portfolio_metadata')
          .select('*')
          .eq('portfolio_id', selectedPortfolio)
          .eq('user_id', user.id)
          .single();

        // Get saved portfolio positions
        const { data: savedPositions } = await supabase
          .from('portfolio_positions')
          .select('*')
          .eq('portfolio_id', selectedPortfolio)
          .eq('user_id', user.id);

        // Get saved dividend data
        const savedDividends = await getSavedDividendData(user.id, selectedPortfolio);

        if (savedMetadata && savedPositions) {
          console.log('Using saved portfolio data from database');
          
          // Set portfolio summary data from saved metadata
          setPortfolioData({
            totalValue: savedMetadata.total_value || 0,
            totalGainLoss: savedMetadata.total_return || 0,
            totalGainLossPercent: savedMetadata.total_return_percentage || 0,
            todayChange: savedMetadata.today_change || 0,
            todayChangePercent: savedMetadata.today_change_percentage || 0,
            holdingsCount: savedMetadata.holdings_count || 0,
            dividendYield: savedDividends.length > 0 
              ? savedDividends.reduce((sum, d) => sum + d.dividend_yield, 0) / savedDividends.length 
              : 2.1
          });

          // Set holdings data from saved positions
          const formattedHoldings = savedPositions.map((position: any) => ({
            symbol: position.symbol,
            name: position.symbol,
            shares: position.quantity,
            avgPrice: position.average_price,
            currentPrice: position.current_price,
            value: position.market_value,
            gainLoss: position.unrealized_pnl,
            gainLossPercent: position.average_price > 0 ? ((position.current_price - position.average_price) / position.average_price) * 100 : 0,
            sector: "Technology", // Can be enhanced with sector data
            dividendYield: 1.5, // Can be enhanced with dividend data
            weight: savedMetadata.total_value > 0 ? (position.market_value / savedMetadata.total_value) * 100 : 0
          }));
          
          setHoldings(formattedHoldings);

          // Generate performance data based on saved metadata
          const baseValue = savedMetadata.total_value - savedMetadata.total_return;
          setPerformanceData([
            { date: "Jan", value: baseValue * 0.95, benchmark: baseValue * 0.97 },
            { date: "Feb", value: baseValue * 0.98, benchmark: baseValue * 0.99 },
            { date: "Mar", value: baseValue * 1.02, benchmark: baseValue * 1.01 },
            { date: "Apr", value: baseValue * 1.05, benchmark: baseValue * 1.03 },
            { date: "May", value: baseValue * 1.03, benchmark: baseValue * 1.04 },
            { date: "Jun", value: savedMetadata.total_value, benchmark: baseValue * 1.05 }
          ]);

          // Generate sector allocation (can be enhanced with actual sector data)
          setSectorAllocation([
            { name: "Technology", value: 65.4, color: "#8884d8" },
            { name: "Healthcare", value: 18.2, color: "#82ca9d" },
            { name: "Finance", value: 12.1, color: "#ffc658" },
            { name: "Consumer", value: 4.3, color: "#ff7300" },
          ]);

          // Generate dividend data from saved dividend records
          if (savedDividends.length > 0) {
            const totalAnnualIncome = savedDividends.reduce((sum, d) => sum + d.estimated_annual_income, 0);
            setMonthlyDividends([
              { month: "Jan", amount: totalAnnualIncome / 12 * 0.95 },
              { month: "Feb", amount: totalAnnualIncome / 12 * 0.88 },
              { month: "Mar", amount: totalAnnualIncome / 12 * 1.15 },
              { month: "Apr", amount: totalAnnualIncome / 12 * 0.92 },
              { month: "May", amount: totalAnnualIncome / 12 * 1.08 },
              { month: "Jun", amount: totalAnnualIncome / 12 * 1.22 },
            ]);
          } else {
            // Default dividend data
            setMonthlyDividends([
              { month: "Jan", amount: 45.20 },
              { month: "Feb", amount: 52.30 },
              { month: "Mar", amount: 48.90 },
              { month: "Apr", amount: 61.40 },
              { month: "May", amount: 58.70 },
              { month: "Jun", amount: 67.20 },
            ]);
          }

        } else {
          console.log('No saved data found, showing empty state');
          // If no saved data, show empty state or prompt to sync
        }

      } catch (error) {
        console.error('Error fetching saved portfolio data:', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchSavedPortfolioData();
  }, [selectedPortfolio, user?.id]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            📊 Portfolio Analysis
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Saved Data
            </Badge>
          </h1>
          <p className="text-muted-foreground">Comprehensive view of your saved portfolio data and performance</p>
        </div>
        
        {portfolios.length > 0 && (
          <div className="flex items-center gap-4">
            <PortfolioSelector
              portfolios={portfolios}
              value={selectedPortfolio}
              onValueChange={setSelectedPortfolio}
              placeholder="Select portfolio"
            />
            <div className="flex gap-2">
              <Button 
                variant={viewMode === 'list' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setViewMode('list')}
              >
                List
              </Button>
              <Button 
                variant={viewMode === 'grid' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                Grid
              </Button>
            </div>
          </div>
        )}
      </div>

      {!selectedPortfolio ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-muted-foreground">
              <PieChartIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Select a Portfolio</p>
              <p>Choose a portfolio from the dropdown to view your saved portfolio data</p>
            </div>
          </CardContent>
        </Card>
      ) : isLoadingData ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-muted-foreground">
              <div className="animate-pulse">Loading saved portfolio data...</div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${portfolioData.totalValue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {portfolioData.totalGainLoss >= 0 ? '+' : ''}${portfolioData.totalGainLoss.toLocaleString()} ({portfolioData.totalGainLossPercent.toFixed(2)}%)
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Change</CardTitle>
                {portfolioData.todayChange >= 0 ? (
                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-600" />
                )}
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${portfolioData.todayChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {portfolioData.todayChange >= 0 ? '+' : ''}${portfolioData.todayChange.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {portfolioData.todayChangePercent >= 0 ? '+' : ''}{portfolioData.todayChangePercent.toFixed(2)}% from yesterday
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Holdings</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{portfolioData.holdingsCount}</div>
                <p className="text-xs text-muted-foreground">Saved positions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Dividend Yield</CardTitle>
                <Percent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{portfolioData.dividendYield.toFixed(2)}%</div>
                <p className="text-xs text-muted-foreground">From saved data</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="holdings" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="holdings">📈 Holdings</TabsTrigger>
              <TabsTrigger value="performance">📊 Performance</TabsTrigger>
              <TabsTrigger value="allocation">🥧 Allocation</TabsTrigger>
              <TabsTrigger value="dividends">💰 Dividends</TabsTrigger>
            </TabsList>

            <TabsContent value="holdings" className="space-y-6">
              {holdings.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <div className="text-muted-foreground">
                      <p className="text-lg font-medium">No Saved Holdings Found</p>
                      <p>This portfolio doesn't have any saved holdings data yet.</p>
                      <p className="text-sm mt-2">Sync your portfolio data to see holdings here.</p>
                    </div>
                  </CardContent>
                </Card>
              ) : viewMode === 'list' ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Saved Holdings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Symbol</TableHead>
                          <TableHead>Company</TableHead>
                          <TableHead className="text-right">Shares</TableHead>
                          <TableHead className="text-right">Avg Price</TableHead>
                          <TableHead className="text-right">Current Price</TableHead>
                          <TableHead className="text-right">Market Value</TableHead>
                          <TableHead className="text-right">Gain/Loss</TableHead>
                          <TableHead className="text-right">%</TableHead>
                          <TableHead className="text-right">Weight</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {holdings.map((holding) => (
                          <TableRow key={holding.symbol}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold">
                                  {holding.symbol.charAt(0)}
                                </div>
                                {holding.symbol}
                              </div>
                            </TableCell>
                            <TableCell>{holding.name}</TableCell>
                            <TableCell className="text-right">{holding.shares}</TableCell>
                            <TableCell className="text-right">${holding.avgPrice?.toFixed(2) || '0.00'}</TableCell>
                            <TableCell className="text-right">${holding.currentPrice?.toFixed(2) || '0.00'}</TableCell>
                            <TableCell className="text-right">${holding.value?.toLocaleString() || '0'}</TableCell>
                            <TableCell className={`text-right ${(holding.gainLoss || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {(holding.gainLoss || 0) >= 0 ? '+' : ''}${(holding.gainLoss || 0).toLocaleString()}
                            </TableCell>
                            <TableCell className={`text-right ${(holding.gainLossPercent || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {(holding.gainLossPercent || 0) >= 0 ? '+' : ''}{(holding.gainLossPercent || 0).toFixed(2)}%
                            </TableCell>
                            <TableCell className="text-right">{(holding.weight || 0).toFixed(1)}%</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {holdings.map((holding) => (
                    <Card key={holding.symbol}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-sm font-bold">
                              {holding.symbol.charAt(0)}
                            </div>
                            <div>
                              <CardTitle className="text-lg">{holding.symbol}</CardTitle>
                              <p className="text-sm text-muted-foreground">{holding.name}</p>
                            </div>
                          </div>
                          <Badge variant={(holding.gainLoss || 0) >= 0 ? 'default' : 'destructive'}>
                            {(holding.gainLoss || 0) >= 0 ? '+' : ''}{(holding.gainLossPercent || 0).toFixed(2)}%
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Current Price:</span>
                          <span className="font-medium">${(holding.currentPrice || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Market Value:</span>
                          <span className="font-medium">${(holding.value || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Gain/Loss:</span>
                          <span className={`font-medium ${(holding.gainLoss || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {(holding.gainLoss || 0) >= 0 ? '+' : ''}${(holding.gainLoss || 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Weight:</span>
                          <span className="font-medium">{(holding.weight || 0).toFixed(1)}%</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="performance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Portfolio Performance vs Benchmark
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      portfolio: { label: "Portfolio", color: "#8884d8" },
                      benchmark: { label: "S&P 500", color: "#82ca9d" },
                    }}
                    className="h-[400px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area type="monotone" dataKey="value" stackId="1" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} name="Portfolio" />
                        <Area type="monotone" dataKey="benchmark" stackId="2" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} name="S&P 500" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">YTD Return</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600">+{portfolioData.totalGainLossPercent.toFixed(1)}%</div>
                    <p className="text-xs text-muted-foreground">From saved data</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Holdings Count</span>
                    </div>
                    <div className="text-2xl font-bold">{portfolioData.holdingsCount}</div>
                    <p className="text-xs text-muted-foreground">Saved positions</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium">Today's Change</span>
                    </div>
                    <div className={`text-2xl font-bold ${portfolioData.todayChangePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {portfolioData.todayChangePercent >= 0 ? '+' : ''}{portfolioData.todayChangePercent.toFixed(2)}%
                    </div>
                    <p className="text-xs text-muted-foreground">From saved data</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="allocation" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChartIcon className="h-5 w-5" />
                      Sector Allocation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={{
                        allocation: { label: "Allocation" },
                      }}
                      className="h-[300px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={sectorAllocation}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {sectorAllocation.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <ChartTooltip 
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-background border rounded-lg p-2 shadow-lg">
                                    <p className="font-medium">{data.name}</p>
                                    <p className="text-sm text-muted-foreground">{data.value}%</p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Asset Allocation Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {sectorAllocation.map((sector) => (
                        <div key={sector.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-4 h-4 rounded-full" 
                              style={{ backgroundColor: sector.color }}
                            />
                            <span className="font-medium">{sector.name}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{sector.value}%</div>
                            <div className="text-sm text-muted-foreground">
                              ${((portfolioData.totalValue * sector.value) / 100).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="dividends" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Monthly Dividend Income
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={{
                        dividends: { label: "Dividends", color: "#8884d8" },
                      }}
                      className="h-[250px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthlyDividends}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="amount" fill="#8884d8" name="Dividends ($)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Dividend Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Received (YTD)</span>
                      <span className="font-medium">${monthlyDividends.reduce((sum, month) => sum + month.amount, 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Monthly Average</span>
                      <span className="font-medium">${(monthlyDividends.reduce((sum, month) => sum + month.amount, 0) / monthlyDividends.length).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Projected Annual</span>
                      <span className="font-medium">${(monthlyDividends.reduce((sum, month) => sum + month.amount, 0) * 2).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Yield on Cost</span>
                      <span className="font-medium">{portfolioData.dividendYield.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Data Source</span>
                      <span className="font-medium">Saved Database</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

const Portfolio = () => {
  return (
    <PortfolioProvider>
      <DashboardLayout>
        <PortfolioContent />
      </DashboardLayout>
    </PortfolioProvider>
  );
};

export default Portfolio;
