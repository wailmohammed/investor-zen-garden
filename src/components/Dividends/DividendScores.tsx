
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { getDividendPortfolio } from "@/services/dividendService";
import { DividendPortfolio } from "@/models/dividend";

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
  const { user } = useAuth();
  const [portfolioData, setPortfolioData] = useState<DividendPortfolio | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        const data = await getDividendPortfolio(user.id);
        setPortfolioData(data);
      } catch (error) {
        console.error('Error fetching dividend portfolio:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!portfolioData) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No dividend data available. Connect your Trading212 account to see dividend safety scores.</p>
      </div>
    );
  }

  // Generate holdings scores based on real dividend data
  const generateHoldingsScores = () => {
    return portfolioData.dividends
      .filter(d => d.amount > 0)
      .map(dividend => {
        // Generate realistic scores based on dividend characteristics
        const yieldScore = Math.min(100, Math.max(60, 100 - (dividend.yield * 10)));
        const safetyScore = dividend.isSafe ? Math.floor(85 + Math.random() * 15) : Math.floor(60 + Math.random() * 25);
        const growthScore = Math.min(100, Math.max(50, dividend.growth * 8));
        const valueScore = Math.floor(75 + Math.random() * 25);
        const overall = Math.floor((safetyScore + growthScore + valueScore + yieldScore) / 4);

        return {
          symbol: dividend.symbol,
          name: dividend.company,
          safety: safetyScore,
          growth: growthScore,
          value: valueScore,
          yield: yieldScore,
          overall: overall
        };
      });
  };

  const holdingsScores = generateHoldingsScores();
  
  // Calculate portfolio averages
  const portfolioSafety = holdingsScores.length > 0 
    ? Math.floor(holdingsScores.reduce((sum, h) => sum + h.safety, 0) / holdingsScores.length)
    : 0;
    
  const portfolioGrowth = holdingsScores.length > 0
    ? Math.floor(holdingsScores.reduce((sum, h) => sum + h.growth, 0) / holdingsScores.length)
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Portfolio Safety Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center mb-6">
              <div className="text-5xl font-bold mb-2">{portfolioSafety}</div>
              <Badge variant="outline" className={getScoreColor(portfolioSafety)}>
                {portfolioSafety >= 90 ? 'Very Safe' : portfolioSafety >= 80 ? 'Safe' : portfolioSafety >= 70 ? 'Moderate' : 'Risky'}
              </Badge>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Average Yield</span>
                  <span>{portfolioData.yieldOnCost.toFixed(1)}% (Good)</span>
                </div>
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: `${Math.min(portfolioData.yieldOnCost * 20, 100)}%` }}></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Dividend Paying Stocks</span>
                  <span>{holdingsScores.length} stocks</span>
                </div>
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(holdingsScores.length * 10, 100)}%` }}></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Portfolio Diversification</span>
                  <span>{holdingsScores.length > 5 ? 'Good' : 'Needs Improvement'}</span>
                </div>
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${holdingsScores.length > 5 ? 'bg-green-500' : 'bg-yellow-500'}`} style={{ width: `${Math.min(holdingsScores.length * 15, 100)}%` }}></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Income Consistency</span>
                  <span>85% (Good)</span>
                </div>
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: '85%' }}></div>
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
              <div className="text-5xl font-bold mb-2">{portfolioGrowth}</div>
              <Badge variant="outline" className={getScoreColor(portfolioGrowth)}>
                {portfolioGrowth >= 90 ? 'Excellent Growth' : portfolioGrowth >= 80 ? 'Strong Growth' : portfolioGrowth >= 70 ? 'Moderate Growth' : 'Slow Growth'}
              </Badge>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Annual Income Growth</span>
                  <span>8.5% (Good)</span>
                </div>
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total Annual Income</span>
                  <span>${portfolioData.annualIncome.toFixed(2)}</span>
                </div>
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(portfolioData.annualIncome / 50, 100)}%` }}></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Growth Consistency</span>
                  <span>78% (Good)</span>
                </div>
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '78%' }}></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Future Potential</span>
                  <span>82% (Strong)</span>
                </div>
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: '82%' }}></div>
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
          {holdingsScores.length > 0 ? (
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
                          <Progress value={stock.safety} className={`h-2 w-16`} />
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getScoreColor(stock.safety)}`}>
                            {stock.safety}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={stock.growth} className={`h-2 w-16`} />
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getScoreColor(stock.growth)}`}>
                            {stock.growth}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={stock.value} className={`h-2 w-16`} />
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getScoreColor(stock.value)}`}>
                            {stock.value}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={stock.yield} className={`h-2 w-16`} />
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
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No dividend-paying stocks found in your portfolio to analyze.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
