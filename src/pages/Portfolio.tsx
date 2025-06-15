
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

// Sample holdings data (in a real app, this would come from your database/API)
const sampleHoldings = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    shares: 50,
    avgPrice: 150.00,
    currentPrice: 175.25,
    value: 8762.50,
    gainLoss: 1262.50,
    gainLossPercent: 16.83,
    sector: "Technology",
    dividendYield: 0.52,
    weight: 25.4
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corp.",
    shares: 30,
    avgPrice: 280.00,
    currentPrice: 320.45,
    value: 9613.50,
    gainLoss: 1213.50,
    gainLossPercent: 14.45,
    sector: "Technology",
    dividendYield: 0.73,
    weight: 27.8
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    shares: 20,
    avgPrice: 2400.00,
    currentPrice: 2650.80,
    value: 5301.60,
    gainLoss: 501.60,
    gainLossPercent: 10.45,
    sector: "Technology",
    dividendYield: 0.00,
    weight: 15.3
  },
  {
    symbol: "TSLA",
    name: "Tesla Inc.",
    shares: 15,
    avgPrice: 220.00,
    currentPrice: 195.30,
    value: 2929.50,
    gainLoss: -369.50,
    gainLossPercent: -11.2,
    sector: "Automotive",
    dividendYield: 0.00,
    weight: 8.5
  },
  {
    symbol: "NVDA",
    name: "NVIDIA Corp.",
    shares: 25,
    avgPrice: 180.00,
    currentPrice: 430.20,
    value: 10755.00,
    gainLoss: 6255.00,
    gainLossPercent: 138.67,
    sector: "Technology",
    dividendYield: 0.09,
    weight: 31.1
  }
];

// Performance data for charts
const performanceData = [
  { date: "Jan", value: 25000, benchmark: 24500 },
  { date: "Feb", value: 27500, benchmark: 26200 },
  { date: "Mar", value: 26800, benchmark: 25800 },
  { date: "Apr", value: 29200, benchmark: 27500 },
  { date: "May", value: 32400, benchmark: 29800 },
  { date: "Jun", value: 34600, benchmark: 31200 },
];

const sectorAllocation = [
  { name: "Technology", value: 68.1, color: "#8884d8" },
  { name: "Automotive", value: 8.5, color: "#82ca9d" },
  { name: "Healthcare", value: 12.3, color: "#ffc658" },
  { name: "Finance", value: 7.8, color: "#ff7300" },
  { name: "Consumer", value: 3.3, color: "#00ff88" },
];

const monthlyDividends = [
  { month: "Jan", amount: 45.20 },
  { month: "Feb", amount: 52.30 },
  { month: "Mar", amount: 48.90 },
  { month: "Apr", amount: 61.40 },
  { month: "May", amount: 58.70 },
  { month: "Jun", amount: 67.20 },
];

const PortfolioContent = () => {
  const { portfolios, selectedPortfolio, setSelectedPortfolio, isLoading } = usePortfolio();
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const totalValue = sampleHoldings.reduce((sum, holding) => sum + holding.value, 0);
  const totalGainLoss = sampleHoldings.reduce((sum, holding) => sum + holding.gainLoss, 0);
  const totalGainLossPercent = (totalGainLoss / (totalValue - totalGainLoss)) * 100;

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
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">Live Data</Badge>
          </h1>
          <p className="text-muted-foreground">Comprehensive view of your investment holdings and performance</p>
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
              <p>Choose a portfolio from the dropdown to view your holdings and analysis</p>
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
                <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {totalGainLoss >= 0 ? '+' : ''}${totalGainLoss.toLocaleString()} ({totalGainLossPercent.toFixed(2)}%)
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Change</CardTitle>
                {totalGainLoss >= 0 ? (
                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-600" />
                )}
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  +$1,247.83
                </div>
                <p className="text-xs text-muted-foreground">+3.42% from yesterday</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Holdings</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{sampleHoldings.length}</div>
                <p className="text-xs text-muted-foreground">Active positions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Dividend Yield</CardTitle>
                <Percent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2.14%</div>
                <p className="text-xs text-muted-foreground">Weighted average</p>
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
              {viewMode === 'list' ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Current Holdings
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
                        {sampleHoldings.map((holding) => (
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
                            <TableCell className="text-right">${holding.avgPrice.toFixed(2)}</TableCell>
                            <TableCell className="text-right">${holding.currentPrice.toFixed(2)}</TableCell>
                            <TableCell className="text-right">${holding.value.toLocaleString()}</TableCell>
                            <TableCell className={`text-right ${holding.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {holding.gainLoss >= 0 ? '+' : ''}${holding.gainLoss.toLocaleString()}
                            </TableCell>
                            <TableCell className={`text-right ${holding.gainLossPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {holding.gainLossPercent >= 0 ? '+' : ''}{holding.gainLossPercent.toFixed(2)}%
                            </TableCell>
                            <TableCell className="text-right">{holding.weight.toFixed(1)}%</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sampleHoldings.map((holding) => (
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
                          <Badge variant={holding.gainLoss >= 0 ? 'default' : 'destructive'}>
                            {holding.gainLoss >= 0 ? '+' : ''}{holding.gainLossPercent.toFixed(2)}%
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Current Price:</span>
                          <span className="font-medium">${holding.currentPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Market Value:</span>
                          <span className="font-medium">${holding.value.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Gain/Loss:</span>
                          <span className={`font-medium ${holding.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {holding.gainLoss >= 0 ? '+' : ''}${holding.gainLoss.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Weight:</span>
                          <span className="font-medium">{holding.weight.toFixed(1)}%</span>
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
                    <div className="text-2xl font-bold text-green-600">+24.6%</div>
                    <p className="text-xs text-muted-foreground">vs S&P 500: +18.2%</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Sharpe Ratio</span>
                    </div>
                    <div className="text-2xl font-bold">1.34</div>
                    <p className="text-xs text-muted-foreground">Risk-adjusted return</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium">Max Drawdown</span>
                    </div>
                    <div className="text-2xl font-bold text-red-600">-8.4%</div>
                    <p className="text-xs text-muted-foreground">Peak to trough</p>
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
                              ${((totalValue * sector.value) / 100).toLocaleString()}
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
                      <span className="font-medium">$333.70</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Monthly Average</span>
                      <span className="font-medium">$55.62</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Projected Annual</span>
                      <span className="font-medium">$740.20</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Yield on Cost</span>
                      <span className="font-medium">2.8%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Next Payment</span>
                      <span className="font-medium">Jul 15 ($68.30)</span>
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
