
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Printer, Mail } from "lucide-react";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const sectorAllocation = [
  { name: 'Technology', value: 28 },
  { name: 'Healthcare', value: 18 },
  { name: 'Consumer Staples', value: 15 },
  { name: 'Financials', value: 14 },
  { name: 'Industrials', value: 10 },
  { name: 'Utilities', value: 8 },
  { name: 'Energy', value: 7 }
];

const monthlyComparisonData = [
  { month: 'Jan', thisYear: 262.41, lastYear: 240.28 },
  { month: 'Feb', thisYear: 218.76, lastYear: 200.14 },
  { month: 'Mar', thisYear: 304.25, lastYear: 278.93 },
  { month: 'Apr', thisYear: 245.32, lastYear: 224.36 },
  { month: 'May', thisYear: 295.14, lastYear: 270.45 },
  { month: 'Jun', thisYear: 324.53, lastYear: 297.21 },
  { month: 'Jul', thisYear: 274.82, lastYear: 251.44 },
  { month: 'Aug', thisYear: 231.45, lastYear: 212.12 },
  { month: 'Sep', thisYear: 291.67, lastYear: 267.32 },
  { month: 'Oct', thisYear: 259.38, lastYear: 237.63 },
  { month: 'Nov', thisYear: 268.21, lastYear: 245.72 },
  { month: 'Dec', thisYear: 273.92, lastYear: 251.10 }
];

const topHoldings = [
  { symbol: 'AAPL', name: 'Apple Inc.', income: 49.92, percentage: 1.5 },
  { symbol: 'MSFT', name: 'Microsoft Corporation', income: 96.00, percentage: 3.0 },
  { symbol: 'JNJ', name: 'Johnson & Johnson', income: 114.24, percentage: 3.5 },
  { symbol: 'PG', name: 'Procter & Gamble Co', income: 112.88, percentage: 3.5 },
  { symbol: 'KO', name: 'Coca-Cola Co', income: 110.40, percentage: 3.4 }
];

export function DividendReport() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Annual Report Summary</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Button variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" size="sm">
              <Mail className="h-4 w-4 mr-2" />
              Email
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="bg-muted p-4 rounded-md">
              <h3 className="font-medium mb-2">Annual Summary 2024</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Total Income</div>
                  <div className="font-bold text-lg">$3,249.86</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">YoY Growth</div>
                  <div className="font-bold text-lg text-finance-green">+9.3%</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Portfolio Yield</div>
                  <div className="font-bold text-lg">3.1%</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Payments</div>
                  <div className="font-bold text-lg">148</div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-2">Income by Sector</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
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
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Monthly Comparison (2023 vs 2024)</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyComparisonData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value}`, 'Income']} />
                      <Legend />
                      <Bar dataKey="lastYear" name="2023" fill="#8884d8" />
                      <Bar dataKey="thisYear" name="2024" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Top Income Contributors</h3>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Stock</TableHead>
                      <TableHead>Annual Income</TableHead>
                      <TableHead>% of Income</TableHead>
                      <TableHead>Income Graph</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topHoldings.map((stock) => (
                      <TableRow key={stock.symbol}>
                        <TableCell>
                          <div className="font-medium">{stock.symbol}</div>
                          <div className="text-xs text-muted-foreground">{stock.name}</div>
                        </TableCell>
                        <TableCell>${stock.income.toFixed(2)}</TableCell>
                        <TableCell>{stock.percentage.toFixed(1)}%</TableCell>
                        <TableCell>
                          <div className="w-24 h-2 bg-gray-200 rounded-full">
                            <div 
                              className="h-full bg-blue-500 rounded-full" 
                              style={{ width: `${(stock.income / 120) * 100}%` }}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
            
            <div className="bg-muted p-4 rounded-md">
              <h3 className="font-medium mb-2">Recommendations</h3>
              <ul className="text-sm space-y-1">
                <li>• Consider increasing allocation to utilities sector for higher yield</li>
                <li>• Reduce concentration in technology stocks to lower volatility</li>
                <li>• Your portfolio is well-positioned for income growth in the coming year</li>
                <li>• Review holdings with dividend growth rates below 3% for potential replacement</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
