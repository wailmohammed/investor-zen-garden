
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useDividendData } from "@/contexts/DividendDataContext";
import { Shield, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";

const DividendScores = () => {
  const { dividends, loading, getDividendSummary } = useDividendData();
  const { totalAnnualIncome, totalStocks, averageYield } = getDividendSummary();

  // Generate safety scores based on dividend data
  const generateSafetyData = () => {
    return dividends.map((dividend) => {
      // Mock safety data based on symbol
      const safetyProfiles: Record<string, any> = {
        'AAPL': { score: 95, payoutRatio: 14.8, debtToEquity: 1.2, dividendGrowth: 4.3, yearsOfGrowth: 12 },
        'MSFT': { score: 98, payoutRatio: 27.2, debtToEquity: 0.4, dividendGrowth: 10.2, yearsOfGrowth: 20 },
        'JNJ': { score: 96, payoutRatio: 43.5, debtToEquity: 0.5, dividendGrowth: 6.1, yearsOfGrowth: 60 },
        'PG': { score: 92, payoutRatio: 58.1, debtToEquity: 0.7, dividendGrowth: 5.0, yearsOfGrowth: 67 },
        'KO': { score: 90, payoutRatio: 68.5, debtToEquity: 1.8, dividendGrowth: 4.8, yearsOfGrowth: 61 },
      };
      
      const profile = safetyProfiles[dividend.symbol] || { 
        score: 85, 
        payoutRatio: 50, 
        debtToEquity: 1.0, 
        dividendGrowth: 3.0, 
        yearsOfGrowth: 10 
      };

      return {
        symbol: dividend.symbol,
        company: dividend.company_name || dividend.symbol,
        safetyScore: profile.score,
        payoutRatio: profile.payoutRatio,
        debtToEquity: profile.debtToEquity,
        dividendGrowth: profile.dividendGrowth,
        yearsOfGrowth: profile.yearsOfGrowth,
        totalAnnualIncome: dividend.estimated_annual_income,
        isSafe: profile.score >= 80,
        riskLevel: profile.score >= 90 ? 'Low' : profile.score >= 70 ? 'Medium' : 'High'
      };
    });
  };

  const safetyData = generateSafetyData();

  const getRiskBadge = (riskLevel: string) => {
    switch (riskLevel) {
      case 'Low':
        return <Badge variant="default" className="bg-green-100 text-green-800">Low Risk</Badge>;
      case 'Medium':
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800">Medium Risk</Badge>;
      case 'High':
        return <Badge variant="destructive">High Risk</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    } else if (score >= 80) {
      return <Shield className="h-5 w-5 text-blue-600" />;
    } else if (score >= 70) {
      return <TrendingUp className="h-5 w-5 text-yellow-600" />;
    } else {
      return <AlertTriangle className="h-5 w-5 text-red-600" />;
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (safetyData.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-muted-foreground">No dividend safety data available</p>
            <p className="text-sm text-muted-foreground mt-2">
              Add some dividend data to view safety scores
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const avgSafetyScore = safetyData.reduce((sum, stock) => sum + stock.safetyScore, 0) / safetyData.length;
  const safeStocks = safetyData.filter(stock => stock.isSafe).length;

  return (
    <div className="space-y-6">
      {/* Portfolio Safety Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Safety Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgSafetyScore.toFixed(0)}</div>
            <Progress value={avgSafetyScore} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {avgSafetyScore >= 90 ? 'Excellent' : avgSafetyScore >= 80 ? 'Good' : avgSafetyScore >= 70 ? 'Fair' : 'Poor'} safety rating
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Safe Dividends</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeStocks}</div>
            <p className="text-xs text-muted-foreground">
              of {safetyData.length} total stocks ({((safeStocks / safetyData.length) * 100).toFixed(0)}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Income at Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${safetyData.filter(s => !s.isSafe).reduce((sum, s) => sum + s.totalAnnualIncome, 0).toFixed(0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {(((safetyData.filter(s => !s.isSafe).reduce((sum, s) => sum + s.totalAnnualIncome, 0)) / totalAnnualIncome) * 100).toFixed(0)}% of total income
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Growth Years</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(safetyData.reduce((sum, s) => sum + s.yearsOfGrowth, 0) / safetyData.length).toFixed(0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Years of consecutive growth
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Individual Stock Safety Scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {safetyData.map((stock, index) => (
          <Card key={index} className={`${stock.isSafe ? 'border-green-200' : 'border-red-200'}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{stock.symbol}</CardTitle>
                  <p className="text-sm text-muted-foreground">{stock.company}</p>
                </div>
                {getScoreIcon(stock.safetyScore)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Safety Score</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">{stock.safetyScore}</span>
                  {getRiskBadge(stock.riskLevel)}
                </div>
              </div>
              
              <Progress value={stock.safetyScore} className="h-2" />
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payout Ratio:</span>
                  <span className={stock.payoutRatio > 80 ? 'text-red-600' : stock.payoutRatio > 60 ? 'text-yellow-600' : 'text-green-600'}>
                    {stock.payoutRatio}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Debt/Equity:</span>
                  <span className={stock.debtToEquity > 2 ? 'text-red-600' : stock.debtToEquity > 1 ? 'text-yellow-600' : 'text-green-600'}>
                    {stock.debtToEquity.toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dividend Growth:</span>
                  <span className="text-green-600">+{stock.dividendGrowth}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Growth Years:</span>
                  <span className="font-medium">{stock.yearsOfGrowth}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-muted-foreground">Annual Income:</span>
                  <span className="font-medium text-green-600">${stock.totalAnnualIncome.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export { DividendScores };
