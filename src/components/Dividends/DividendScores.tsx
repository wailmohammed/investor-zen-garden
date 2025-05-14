
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const holdingsScores = [
  { symbol: 'AAPL', name: 'Apple Inc.', safety: 98, growth: 92, value: 86, yield: 75, overall: 89 },
  { symbol: 'MSFT', name: 'Microsoft Corporation', safety: 97, growth: 95, value: 82, yield: 80, overall: 90 },
  { symbol: 'JNJ', name: 'Johnson & Johnson', safety: 95, growth: 85, value: 88, yield: 92, overall: 91 },
  { symbol: 'PG', name: 'Procter & Gamble Co', safety: 94, growth: 86, value: 84, yield: 90, overall: 89 },
  { symbol: 'KO', name: 'Coca-Cola Co', safety: 93, growth: 82, value: 86, yield: 91, overall: 88 },
  { symbol: 'PEP', name: 'PepsiCo Inc.', safety: 92, growth: 88, value: 80, yield: 89, overall: 87 },
  { symbol: 'VZ', name: 'Verizon Communications', safety: 87, growth: 68, value: 93, yield: 97, overall: 85 },
  { symbol: 'MMM', name: '3M Company', safety: 65, growth: 60, value: 95, yield: 98, overall: 75 }
];

const getScoreColor = (score: number) => {
  if (score >= 90) return 'bg-green-100 text-green-800';
  if (score >= 80) return 'bg-emerald-100 text-emerald-800';
  if (score >= 70) return 'bg-blue-100 text-blue-800';
  if (score >= 60) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
};

const getProgressColor = (score: number) => {
  if (score >= 90) return 'bg-green-600';
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 70) return 'bg-blue-500';
  if (score >= 60) return 'bg-yellow-500';
  return 'bg-red-500';
};

export function DividendScores() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Portfolio Safety Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center mb-6">
              <div className="text-5xl font-bold mb-2">91</div>
              <Badge variant="outline" className="bg-green-100 text-green-800 font-medium">
                Very Safe
              </Badge>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Average Payout Ratio</span>
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
                  <div className="h-full bg-green-500 rounded-full" style={{ width: '35%' }}></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Dividend Coverage</span>
                  <span>2.4x (Excellent)</span>
                </div>
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Cash Flow Stability</span>
                  <span>94% (Excellent)</span>
                </div>
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: '94%' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Portfolio Growth Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center mb-6">
              <div className="text-5xl font-bold mb-2">87</div>
              <Badge variant="outline" className="bg-emerald-100 text-emerald-800 font-medium">
                Strong Growth
              </Badge>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>5-Year Dividend CAGR</span>
                  <span>8.6% (Very Good)</span>
                </div>
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '86%' }}></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Average Annual Increase</span>
                  <span>7.2% (Good)</span>
                </div>
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '72%' }}></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Growth Consistency</span>
                  <span>92% (Excellent)</span>
                </div>
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>EPS Growth Rate</span>
                  <span>9.4% (Excellent)</span>
                </div>
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: '94%' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Individual Stock Scores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Stock</TableHead>
                  <TableHead>Safety</TableHead>
                  <TableHead>Growth</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Yield</TableHead>
                  <TableHead>Overall</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {holdingsScores.map((stock) => (
                  <TableRow key={stock.symbol}>
                    <TableCell>
                      <div className="font-medium">{stock.symbol}</div>
                      <div className="text-xs text-muted-foreground">{stock.name}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={stock.safety} className={`h-2 w-16 ${getProgressColor(stock.safety)}`} />
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getScoreColor(stock.safety)}`}>
                          {stock.safety}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={stock.growth} className={`h-2 w-16 ${getProgressColor(stock.growth)}`} />
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getScoreColor(stock.growth)}`}>
                          {stock.growth}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={stock.value} className={`h-2 w-16 ${getProgressColor(stock.value)}`} />
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getScoreColor(stock.value)}`}>
                          {stock.value}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={stock.yield} className={`h-2 w-16 ${getProgressColor(stock.yield)}`} />
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getScoreColor(stock.yield)}`}>
                          {stock.yield}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`text-sm font-medium px-2 py-1 rounded-full ${getScoreColor(stock.overall)}`}>
                        {stock.overall}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
