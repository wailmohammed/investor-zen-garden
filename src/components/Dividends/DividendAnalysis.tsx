
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, PieChart as PieChartIcon, BarChart3, Target, Award, ShieldCheck } from "lucide-react";

const DividendAnalysis = () => {
  // Mock data for charts
  const monthlyGrowthData = [
    { month: 'Jan', income: 234.56, growth: 5.2 },
    { month: 'Feb', income: 245.78, growth: 4.8 },
    { month: 'Mar', income: 267.34, growth: 8.8 },
    { month: 'Apr', income: 278.91, growth: 4.3 },
    { month: 'May', income: 295.67, growth: 6.0 },
    { month: 'Jun', income: 312.45, growth: 5.7 },
  ];

  const sectorData = [
    { name: 'Technology', value: 35, income: 997.68, color: '#3b82f6' },
    { name: 'Healthcare', value: 22, income: 626.88, color: '#10b981' },
    { name: 'Financial', value: 18, income: 512.58, color: '#f59e0b' },
    { name: 'Consumer', value: 15, income: 427.15, color: '#8b5cf6' },
    { name: 'Utilities', value: 10, income: 284.77, color: '#ef4444' },
  ];

  const dividendGrowthData = [
    { year: '2020', income: 1250.00 },
    { year: '2021', income: 1456.30 },
    { year: '2022', income: 1678.45 },
    { year: '2023', income: 1923.67 },
    { year: '2024', income: 2234.89 },
    { year: '2025', income: 2847.65 },
  ];

  const topPerformers = [
    { symbol: 'AAPL', company: 'Apple Inc.', yield: 0.51, growth: 4.3, safety: 95, income: 234.56 },
    { symbol: 'MSFT', company: 'Microsoft Corp.', yield: 0.82, growth: 10.2, safety: 98, income: 187.43 },
    { symbol: 'JNJ', company: 'Johnson & Johnson', yield: 3.1, growth: 6.1, safety: 96, income: 156.78 },
    { symbol: 'PG', company: 'Procter & Gamble', yield: 2.4, growth: 5.0, safety: 92, income: 134.23 },
    { symbol: 'KO', company: 'Coca-Cola', yield: 3.0, growth: 4.8, safety: 90, income: 123.45 },
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">5-Year CAGR</span>
            </div>
            <div className="text-2xl font-bold text-green-600">+17.8%</div>
            <p className="text-xs text-muted-foreground">Compound Annual Growth</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Dividend Aristocrats</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">3</div>
            <p className="text-xs text-muted-foreground">25+ years of increases</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Safety Score</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">94</div>
            <p className="text-xs text-muted-foreground">Very Safe Portfolio</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium">Yield on Cost</span>
            </div>
            <div className="text-2xl font-bold text-orange-600">4.7%</div>
            <p className="text-xs text-muted-foreground">Original investment yield</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Monthly Dividend Income & Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'income' ? `$${value}` : `${value}%`,
                    name === 'income' ? 'Income' : 'Growth'
                  ]}
                />
                <Bar dataKey="income" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sector Allocation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Dividend Income by Sector
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sectorData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {sectorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Historical Growth Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Historical Dividend Growth (2020-2025)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dividendGrowthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value}`, 'Annual Income']} />
              <Line 
                type="monotone" 
                dataKey="income" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Performing Dividend Stocks */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Dividend Stocks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topPerformers.map((stock, index) => (
              <div key={stock.symbol} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium">{stock.symbol}</div>
                    <div className="text-sm text-muted-foreground">{stock.company}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Yield</div>
                    <div className="font-medium">{stock.yield}%</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Growth</div>
                    <div className="font-medium text-green-600">+{stock.growth}%</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Safety</div>
                    <Badge 
                      variant="secondary" 
                      className={
                        stock.safety >= 95 ? 'bg-green-100 text-green-800' :
                        stock.safety >= 90 ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }
                    >
                      {stock.safety}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Annual Income</div>
                    <div className="font-medium text-green-600">${stock.income}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Risk Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Risk Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Dividend Sustainability</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Very Safe (90-100)</span>
                    <span>8 stocks</span>
                  </div>
                  <Progress value={67} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Safe (80-89)</span>
                    <span>3 stocks</span>
                  </div>
                  <Progress value={25} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Moderate (70-79)</span>
                    <span>1 stock</span>
                  </div>
                  <Progress value={8} className="h-2" />
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium">Payout Ratios</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Conservative (&lt;50%)</span>
                    <span>70%</span>
                  </div>
                  <Progress value={70} className="h-2 bg-green-100" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Moderate (50-70%)</span>
                    <span>25%</span>
                  </div>
                  <Progress value={25} className="h-2 bg-yellow-100" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>High (&gt;70%)</span>
                    <span>5%</span>
                  </div>
                  <Progress value={5} className="h-2 bg-red-100" />
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium">Dividend History</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Dividend Aristocrats</span>
                  <Badge className="bg-green-100 text-green-800">3</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">10+ Year Growers</span>
                  <Badge className="bg-blue-100 text-blue-800">7</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">5+ Year Growers</span>
                  <Badge className="bg-purple-100 text-purple-800">10</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Recent Cuts</span>
                  <Badge className="bg-red-100 text-red-800">0</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export { DividendAnalysis };
