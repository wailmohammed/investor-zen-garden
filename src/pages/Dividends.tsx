import React, { useState } from 'react';
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { BarChart as BarChartIcon, ArrowRight, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Calendar } from "@/components/ui/calendar";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from "date-fns";

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
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [calendarView, setCalendarView] = useState<'month' | 'list'>('month');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  // Create dividend event data for the calendar
  const dividendEvents = upcomingDividends.reduce((acc: Record<string, any[]>, div) => {
    const date = div.exDate.split('-').join('/');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push({
      symbol: div.symbol,
      name: div.name,
      amount: div.amount,
      type: 'ex-dividend'
    });
    
    const payDate = div.payDate.split('-').join('/');
    if (!acc[payDate]) {
      acc[payDate] = [];
    }
    acc[payDate].push({
      symbol: div.symbol,
      name: div.name, 
      amount: div.amount,
      type: 'payment'
    });
    
    return acc;
  }, {});

  const handlePreviousMonth = () => {
    setSelectedMonth(subMonths(selectedMonth, 1));
  };

  const handleNextMonth = () => {
    setSelectedMonth(addMonths(selectedMonth, 1));
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };
  
  // Convert dates to the format used in dividendEvents
  const getFormattedDate = (date: Date) => {
    return format(date, 'yyyy/MM/dd');
  };

  // Get events for the selected date
  const selectedDateEvents = selectedDate 
    ? dividendEvents[getFormattedDate(selectedDate)] || [] 
    : [];
  
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
                <div className="flex items-center justify-between">
                  <CardTitle>Dividend Calendar</CardTitle>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setCalendarView('month')}
                      className={calendarView === 'month' ? 'bg-primary text-primary-foreground' : ''}
                    >
                      Month View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setCalendarView('list')}
                      className={calendarView === 'list' ? 'bg-primary text-primary-foreground' : ''}
                    >
                      List View
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {calendarView === 'month' ? (
                  <div className="space-y-4">
                    <div className="flex flex-col space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium text-lg">{format(selectedMonth, 'MMMM yyyy')}</h3>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={handleNextMonth}>
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={handleDateSelect}
                            month={selectedMonth}
                            className="rounded-md border"
                          />
                        </div>
                        
                        <div className="bg-muted p-4 rounded-lg">
                          <h3 className="font-medium mb-2">{selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}</h3>
                          {selectedDateEvents.length > 0 ? (
                            <div className="space-y-3">
                              {selectedDateEvents.map((event, i) => (
                                <div key={i} className={`p-3 rounded-md ${event.type === 'ex-dividend' ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'} border`}>
                                  <div className="flex justify-between">
                                    <div>
                                      <div className="font-medium">{event.symbol}</div>
                                      <div className="text-xs text-muted-foreground">{event.name}</div>
                                    </div>
                                    <div className="text-right">
                                      <div className="font-medium">${event.amount.toFixed(2)}</div>
                                      <div className="text-xs text-muted-foreground">
                                        {event.type === 'ex-dividend' ? 'Ex-Dividend' : 'Payment'}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : selectedDate ? (
                            <p className="text-muted-foreground">No dividend events for this date.</p>
                          ) : (
                            <p className="text-muted-foreground">Select a date to view dividend events.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium text-lg">Upcoming Dividend Events</h3>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                          <span className="text-xs text-muted-foreground">Ex-Dividend</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="h-3 w-3 rounded-full bg-green-500"></div>
                          <span className="text-xs text-muted-foreground">Payment</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead>Event Type</TableHead>
                            <TableHead>Amount</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell>May 9, 2025</TableCell>
                            <TableCell>
                              <div className="font-medium">AAPL</div>
                              <div className="text-xs text-muted-foreground">Apple Inc.</div>
                            </TableCell>
                            <TableCell>
                              <div className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Ex-Dividend
                              </div>
                            </TableCell>
                            <TableCell>$0.24</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>May 15, 2025</TableCell>
                            <TableCell>
                              <div className="font-medium">MSFT</div>
                              <div className="text-xs text-muted-foreground">Microsoft Corporation</div>
                            </TableCell>
                            <TableCell>
                              <div className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Ex-Dividend
                              </div>
                            </TableCell>
                            <TableCell>$0.75</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>May 18, 2025</TableCell>
                            <TableCell>
                              <div className="font-medium">AAPL</div>
                              <div className="text-xs text-muted-foreground">Apple Inc.</div>
                            </TableCell>
                            <TableCell>
                              <div className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Payment
                              </div>
                            </TableCell>
                            <TableCell>$0.24</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>May 25, 2025</TableCell>
                            <TableCell>
                              <div className="font-medium">JNJ</div>
                              <div className="text-xs text-muted-foreground">Johnson & Johnson</div>
                            </TableCell>
                            <TableCell>
                              <div className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Payment
                              </div>
                            </TableCell>
                            <TableCell>$1.19</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>May 28, 2025</TableCell>
                            <TableCell>
                              <div className="font-medium">KO</div>
                              <div className="text-xs text-muted-foreground">Coca-Cola Company</div>
                            </TableCell>
                            <TableCell>
                              <div className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Ex-Dividend
                              </div>
                            </TableCell>
                            <TableCell>$0.46</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Monthly Dividend Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={[
                      { month: 'May', exDividends: 3, payments: 2, totalAmount: 63.84 },
                      { month: 'Jun', exDividends: 2, payments: 3, totalAmount: 79.54 },
                      { month: 'Jul', exDividends: 4, payments: 2, totalAmount: 52.28 },
                      { month: 'Aug', exDividends: 2, payments: 4, totalAmount: 84.72 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" orientation="left" />
                      <YAxis yAxisId="right" orientation="right" domain={[0, 'dataMax + 20']} />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="exDividends" name="Ex-Dividends" fill="#8884d8" />
                      <Bar yAxisId="left" dataKey="payments" name="Payments" fill="#82ca9d" />
                      <Bar yAxisId="right" dataKey="totalAmount" name="Total ($)" fill="#ffc658" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Upcoming Dividend Income</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Month</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Events</TableHead>
                          <TableHead>YoY Change</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>May 2025</TableCell>
                          <TableCell>$68.48</TableCell>
                          <TableCell>5</TableCell>
                          <TableCell className="text-finance-green">+8.2%</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>June 2025</TableCell>
                          <TableCell>$85.54</TableCell>
                          <TableCell>4</TableCell>
                          <TableCell className="text-finance-green">+12.5%</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>July 2025</TableCell>
                          <TableCell>$54.28</TableCell>
                          <TableCell>3</TableCell>
                          <TableCell className="text-finance-green">+5.8%</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>August 2025</TableCell>
                          <TableCell>$84.72</TableCell>
                          <TableCell>6</TableCell>
                          <TableCell className="text-finance-green">+7.4%</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                  <div className="flex justify-center mt-4">
                    <Button variant="outline" size="sm" className="text-xs">
                      Export Calendar (.ics)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Dividends;
