
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useDividendData } from "@/contexts/DividendDataContext";
import { useAuth } from "@/contexts/AuthContext";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { TrendingUp, DollarSign, PieChart, Database, Target, AlertCircle } from "lucide-react";

const DividendOverviewEnhanced = () => {
  const { user } = useAuth();
  const { selectedPortfolio } = usePortfolio();
  const {
    dividends,
    loading,
    apiCallsToday,
    maxApiCallsPerDay,
    getDividendSummary
  } = useDividendData();

  if (loading && dividends.length === 0) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <div className="h-2 bg-gray-200 rounded mt-2 animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!selectedPortfolio) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Please select a portfolio to view dividend data.
        </AlertDescription>
      </Alert>
    );
  }

  if (dividends.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No saved dividend data found. Use the dividend tracker to detect and save your dividend stocks.
        </AlertDescription>
      </Alert>
    );
  }

  const { totalAnnualIncome, totalStocks, averageYield } = getDividendSummary();

  return (
    <div className="space-y-6">
      {/* Main Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annual Dividend Income</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalAnnualIncome.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              ${(totalAnnualIncome / 12).toFixed(2)} per month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Yield</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageYield.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">
              Portfolio average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dividend Stocks</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStocks}</div>
            <p className="text-xs text-muted-foreground">
              Saved in database
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Usage</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{apiCallsToday}/{maxApiCallsPerDay}</div>
            <p className="text-xs text-muted-foreground">
              Calls used today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5" />
              Portfolio Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>High Yield Stocks (&gt;4%)</span>
                <span>{dividends.filter(d => d.dividend_yield > 4).length}</span>
              </div>
              <Progress 
                value={(dividends.filter(d => d.dividend_yield > 4).length / totalStocks) * 100} 
                className="h-2" 
              />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Medium Yield Stocks (2-4%)</span>
                <span>{dividends.filter(d => d.dividend_yield >= 2 && d.dividend_yield <= 4).length}</span>
              </div>
              <Progress 
                value={(dividends.filter(d => d.dividend_yield >= 2 && d.dividend_yield <= 4).length / totalStocks) * 100} 
                className="h-2" 
              />
            </div>

            <div className="pt-2 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total Stocks:</span>
                <Badge variant="outline">{totalStocks}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>High Yield (&gt;4%):</span>
                <Badge variant="outline">{dividends.filter(d => d.dividend_yield > 4).length}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Medium Yield (2-4%):</span>
                <Badge variant="outline">{dividends.filter(d => d.dividend_yield >= 2 && d.dividend_yield <= 4).length}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Low Yield (&lt;2%):</span>
                <Badge variant="outline">{dividends.filter(d => d.dividend_yield < 2).length}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Database className="h-5 w-5" />
              Data Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{totalStocks}</div>
                <p className="text-xs text-muted-foreground">Saved Stocks</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{maxApiCallsPerDay - apiCallsToday}</div>
                <p className="text-xs text-muted-foreground">API Calls Left</p>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Daily API Usage</span>
                <span>{apiCallsToday}/{maxApiCallsPerDay}</span>
              </div>
              <Progress value={(apiCallsToday / maxApiCallsPerDay) * 100} className="h-2" />
            </div>

            <div className="pt-2 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Data Source:</span>
                <Badge className="bg-green-100 text-green-800">Saved Database</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Auto-Sync:</span>
                <Badge variant="outline">Smart Limits</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Storage:</span>
                <Badge variant="outline">Persistent</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Income Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Income Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-xl font-bold text-green-600">${totalAnnualIncome.toFixed(2)}</div>
              <p className="text-sm text-muted-foreground">Annual Total</p>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-blue-600">${(totalAnnualIncome / 4).toFixed(2)}</div>
              <p className="text-sm text-muted-foreground">Quarterly</p>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-purple-600">${(totalAnnualIncome / 12).toFixed(2)}</div>
              <p className="text-sm text-muted-foreground">Monthly Average</p>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-orange-600">${(totalAnnualIncome / 52).toFixed(2)}</div>
              <p className="text-sm text-muted-foreground">Weekly Average</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export { DividendOverviewEnhanced };
