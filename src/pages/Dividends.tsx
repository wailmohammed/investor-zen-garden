import React, { useState } from 'react';
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { BarChart as BarChartIcon, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

// Mock data inspired by Snowball Analytics and Simply Safe Dividends
const dividendsByMonth = [
  { name: 'Jan', amount: 262.41 },
  { name: 'Feb', amount: 218.76 },
  { name: 'Mar', amount: 304.25 },
  { name: 'Apr', amount: 245.32 },
  { name: 'May', amount: 295.14 },
  { name: 'Jun', amount: 324.53 },
  { name: 'Jul', amount: 274.82 },
  { name: 'Aug', amount: 231.45 },
  { name: 'Sep', amount: 291.67 },
  { name: 'Oct', amount: 259.38 },
  { name: 'Nov', amount: 268.21 },
  { name: 'Dec', amount: 273.92 }
];

const growthData = [
  { year: 2018, income: 1450.28 },
  { year: 2019, income: 1683.45 },
  { year: 2020, income: 1893.21 },
  { year: 2021, income: 2242.67 },
  { year: 2022, income: 2658.32 },
  { year: 2023, income: 2972.14 },
  { year: 2024, income: 3249.86 }
];

const sectorAllocation = [
  { name: 'Technology', value: 28 },
  { name: 'Healthcare', value: 18 },
  { name: 'Consumer Staples', value: 15 },
  { name: 'Financials', value: 14 },
  { name: 'Industrials', value: 10 },
  { name: 'Utilities', value: 8 },
  { name: 'Energy', value: 7 }
];

const upcomingDividends = [
  { symbol: 'AAPL', name: 'Apple Inc.', exDate: '2025-05-09', payDate: '2025-05-18', amount: 0.24, yield: 0.51 },
  { symbol: 'MSFT', name: 'Microsoft Corporation', exDate: '2025-05-15', payDate: '2025-06-10', amount: 0.75, yield: 0.82 },
  { symbol: 'KO', name: 'Coca-Cola Company', exDate: '2025-05-28', payDate: '2025-06-15', amount: 0.46, yield: 3.0 },
  { symbol: 'PEP', name: 'PepsiCo Inc.', exDate: '2025-06-05', payDate: '2025-06-28', amount: 1.27, yield: 2.9 },
  { symbol: 'T', name: 'AT&T Inc.', exDate: '2025-06-08', payDate: '2025-07-01', amount: 0.28, yield: 6.2 }
];

const holdings = [
  { symbol: 'AAPL', name: 'Apple Inc.', shares: 52, cost: 122.45, yield: 0.51, income: 49.92, safety: 98 },
  { symbol: 'MSFT', name: 'Microsoft Corporation', shares: 32, cost: 214.32, yield: 0.82, income: 96.00, safety: 97 },
  { symbol: 'JNJ', name: 'Johnson & Johnson', shares: 24, cost: 142.88, yield: 3.1, income: 114.24, safety: 95 },
  { symbol: 'PG', name: 'Procter & Gamble Co', shares: 30, cost: 127.54, yield: 2.4, income: 112.88, safety: 94 },
  { symbol: 'KO', name: 'Coca-Cola Co', shares: 60, cost: 52.85, yield: 3.0, income: 110.40, safety: 93 },
  { symbol: 'PEP', name: 'PepsiCo Inc.', shares: 22, cost: 154.23, yield: 2.9, income: 111.76, safety: 92 },
  { symbol: 'VZ', name: 'Verizon Communications', shares: 38, cost: 51.42, yield: 6.8, income: 133.76, safety: 87 },
  { symbol: 'MCD', name: 'McDonald\'s Corp', shares: 14, cost: 215.67, yield: 2.2, income: 66.64, safety: 90 },
  { symbol: 'HD', name: 'Home Depot Inc', shares: 10, cost: 284.32, yield: 2.3, income: 65.40, safety: 89 },
  { symbol: 'MMM', name: '3M Company', shares: 18, cost: 172.56, yield: 5.8, income: 179.64, safety: 65 }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

const Dividends = () => {
  const { user, defaultCurrency } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Dividend Tracker</h1>
            <p className="text-muted-foreground">Track, analyze and forecast your dividend income</p>
          </div>
          
          <Link to="/dividend-stats">
            <Button className="flex items-center gap-2">
              <BarChartIcon size={16} />
              <span>Dividend Stats</span>
              <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
        
        <div className="flex flex-wrap gap-4 mb-6">
          <Card className="w-full sm:w-[calc(25%-12px)]">
            <CardContent className="p-6">
              <div className="text-sm font-medium text-muted-foreground">Annual Income</div>
              <div className="text-3xl font-bold">${defaultCurrency === 'USD' ? '3,250' : '2,925'}
                <span className="text-xs text-finance-green ml-2">+7.2%</span>
              </div>
            </CardContent>
          </Card>
          <Card className="w-full sm:w-[calc(25%-12px)]">
            <CardContent className="p-6">
              <div className="text-sm font-medium text-muted-foreground">Monthly Average</div>
              <div className="text-3xl font-bold">${defaultCurrency === 'USD' ? '271' : '244'}
                <span className="text-xs text-finance-green ml-2">+7.2%</span>
              </div>
            </CardContent>
          </Card>
          <Card className="w-full sm:w-[calc(25%-12px)]">
            <CardContent className="p-6">
              <div className="text-sm font-medium text-muted-foreground">Portfolio Yield</div>
              <div className="text-3xl font-bold">3.1%
                <span className="text-xs text-finance-green ml-2">+0.3%</span>
              </div>
            </CardContent>
          </Card>
          <Card className="w-full sm:w-[calc(25%-12px)]">
            <CardContent className="p-6">
              <div className="text-sm font-medium text-muted-foreground">Safety Score</div>
              <div className="text-3xl font-bold">92
                <span className="text-xs text-finance-green ml-2">+2</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="holdings">Holdings</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Dividend Income</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dividendsByMonth}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value}`, 'Dividend Income']} />
                      <Bar dataKey="amount" fill="#4f46e5" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Annual Income Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={growthData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value}`, 'Annual Income']} />
                      <Line type="monotone" dataKey="income" stroke="#4f46e5" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sector Allocation</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center items-center">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={sectorAllocation}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {sectorAllocation.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, 'Allocation']} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Upcoming Dividends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Stock</TableHead>
                          <TableHead>Ex-Date</TableHead>
                          <TableHead>Pay Date</TableHead>
                          <TableHead>Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {upcomingDividends.map((dividend, i) => (
                          <TableRow key={i}>
                            <TableCell>
                              <div className="font-medium">{dividend.symbol}</div>
                              <div className="text-xs text-muted-foreground">{dividend.name}</div>
                            </TableCell>
                            <TableCell>{dividend.exDate}</TableCell>
                            <TableCell>{dividend.payDate}</TableCell>
                            <TableCell>${dividend.amount.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="holdings" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Dividend Holdings</CardTitle>
                <Button variant="outline">Import Holdings</Button>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Stock</TableHead>
                        <TableHead>Shares</TableHead>
                        <TableHead>Avg Cost</TableHead>
                        <TableHead>Yield</TableHead>
                        <TableHead>Annual Income</TableHead>
                        <TableHead>Safety</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {holdings.map((holding, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <div className="font-medium">{holding.symbol}</div>
                            <div className="text-xs text-muted-foreground">{holding.name}</div>
                          </TableCell>
                          <TableCell>{holding.shares}</TableCell>
                          <TableCell>${holding.cost.toFixed(2)}</TableCell>
                          <TableCell>{holding.yield.toFixed(1)}%</TableCell>
                          <TableCell>${holding.income.toFixed(2)}</TableCell>
                          <TableCell>
                            <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              holding.safety > 80 ? 'bg-green-100 text-green-800' :
                              holding.safety > 60 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {holding.safety}/100
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analysis" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Dividend Safety Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Overall Portfolio Safety</span>
                      <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">92/100 (Very Safe)</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Payout Ratio</span>
                        <span>42.5% (Healthy)</span>
                      </div>
                      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: '42.5%' }}></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Debt to Equity</span>
                        <span>0.84 (Good)</span>
                      </div>
                      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: '30%' }}></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Dividend Growth Rate (5yr)</span>
                        <span>7.2% (Excellent)</span>
                      </div>
                      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: '72%' }}></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Earnings Growth (5yr)</span>
                        <span>9.4% (Excellent)</span>
                      </div>
                      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: '94%' }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Income Projections</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="text-sm font-medium">5-Year Dividend Growth Forecast</div>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={[
                          { year: '2025', income: 3250 },
                          { year: '2026', income: 3510 },
                          { year: '2027', income: 3795 },
                          { year: '2028', income: 4106 },
                          { year: '2029', income: 4445 },
                          { year: '2030', income: 4814 }
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="year" />
                          <YAxis domain={[3000, 5000]} />
                          <Tooltip formatter={(value) => [`$${value}`, 'Projected Income']} />
                          <Line type="monotone" dataKey="income" stroke="#4f46e5" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="bg-muted p-4 rounded-md">
                      <div className="font-medium mb-2">Dividend Income Breakdown</div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Current Annual</div>
                          <div className="font-medium">$3,250</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Monthly Average</div>
                          <div className="font-medium">$271</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">5yr Projected Annual</div>
                          <div className="font-medium">$4,814</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Projected Growth</div>
                          <div className="font-medium text-finance-green">+48.1%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="calendar" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Dividend Calendar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">May 2025</h3>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">&lt; April</Button>
                      <Button variant="outline" size="sm">June &gt;</Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium">
                    <div>Sun</div>
                    <div>Mon</div>
                    <div>Tue</div>
                    <div>Wed</div>
                    <div>Thu</div>
                    <div>Fri</div>
                    <div>Sat</div>
                  </div>
                  
                  <div className="grid grid-cols-7 gap-2">
                    {/* Empty cells for previous month */}
                    {[...Array(4)].map((_, i) => (
                      <div key={`empty-start-${i}`} className="h-24 p-2 bg-muted rounded-md opacity-50"></div>
                    ))}
                    
                    {/* Actual days */}
                    {[...Array(31)].map((_, i) => {
                      const day = i + 1;
                      const hasDividend = [9, 15, 28].includes(day);
                      return (
                        <div 
                          key={`day-${day}`} 
                          className={`h-24 p-2 rounded-md border ${hasDividend ? 'border-blue-500 bg-blue-50' : 'bg-white'}`}
                        >
                          <div className="font-medium mb-1">{day}</div>
                          {day === 9 && (
                            <div className="text-xs p-1 bg-blue-100 rounded truncate">
                              AAPL Ex-div $0.24
                            </div>
                          )}
                          {day === 15 && (
                            <div className="text-xs p-1 bg-blue-100 rounded truncate">
                              MSFT Ex-div $0.75
                            </div>
                          )}
                          {day === 28 && (
                            <div className="text-xs p-1 bg-blue-100 rounded truncate">
                              KO Ex-div $0.46
                            </div>
                          )}
                        </div>
                      );
                    })}
                    
                    {/* Empty cells for next month */}
                    {[...Array(1)].map((_, i) => (
                      <div key={`empty-end-${i}`} className="h-24 p-2 bg-muted rounded-md opacity-50"></div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Upcoming Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Symbol</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>May 18, 2025</TableCell>
                        <TableCell>AAPL</TableCell>
                        <TableCell>Payment</TableCell>
                        <TableCell>$12.48</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>May 25, 2025</TableCell>
                        <TableCell>JNJ</TableCell>
                        <TableCell>Payment</TableCell>
                        <TableCell>$28.56</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>June 10, 2025</TableCell>
                        <TableCell>MSFT</TableCell>
                        <TableCell>Payment</TableCell>
                        <TableCell>$24.00</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>June 15, 2025</TableCell>
                        <TableCell>KO</TableCell>
                        <TableCell>Payment</TableCell>
                        <TableCell>$27.60</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>June 28, 2025</TableCell>
                        <TableCell>PEP</TableCell>
                        <TableCell>Payment</TableCell>
                        <TableCell>$27.94</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Dividends;
