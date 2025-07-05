
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useDividendData } from "@/contexts/DividendDataContext";
import { useAuth } from "@/contexts/AuthContext";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { SampleDataButton } from "@/components/SampleDataButton";
import { TrendingUp, DollarSign, PieChart, Database, Target, AlertCircle, RefreshCw } from "lucide-react";

const DividendOverviewEnhanced = () => {
  const { user } = useAuth();
  const { selectedPortfolio } = usePortfolio();
  
  // Add error boundary protection
  let dividendData;
  try {
    dividendData = useDividendData();
  } catch (error) {
    console.log('DividendDataProvider not available:', error);
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Dividend tracking not available. Please check your portfolio configuration.
        </AlertDescription>
      </Alert>
    );
  }

  const {
    dividends,
    loading,
    error,
    apiCallsToday,
    maxApiCallsPerDay,
    getDividendSummary,
    refreshDividendData,
    syncApiDataToDatabase
  } = dividendData;

  if (loading && dividends.length === 0) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading from database...</CardTitle>
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

  if (error) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error}
          <Button 
            onClick={refreshDividendData} 
            variant="outline" 
            size="sm" 
            className="ml-2"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!selectedPortfolio) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Please select a portfolio to view dividend data from the database.
        </AlertDescription>
      </Alert>
    );
  }

  if (dividends.length === 0) {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No saved dividend data found in database for this portfolio.
            <div className="flex gap-2 mt-3">
              <SampleDataButton />
              <Button onClick={syncApiDataToDatabase} variant="outline" size="sm">
                Sync API Data
              </Button>
              <Button onClick={refreshDividendData} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </Button>
            </div>
          </AlertDescription>
        </Alert>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Get Started with Dividend Tracking
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8">
            <Database className="h-16 w-16 mx-auto mb-4 text-blue-500" />
            <h3 className="text-lg font-medium mb-2">No Dividend Data Yet</h3>
            <p className="text-muted-foreground mb-4">
              To start tracking your dividends, you can add sample data to see how it works, or sync your real portfolio data.
            </p>
            <div className="flex justify-center gap-2">
              <SampleDataButton />
              <Button onClick={syncApiDataToDatabase} variant="outline">
                Sync Portfolio Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { totalAnnualIncome, totalStocks, averageYield } = getDividendSummary();

  return (
    <div className="space-y-6">
      {/* Main Stats Cards - All from Database */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annual Dividend Income</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalAnnualIncome.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Database className="h-3 w-3 text-green-500" />
              From database • ${(totalAnnualIncome / 12).toFixed(2)}/month
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
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Database className="h-3 w-3 text-blue-500" />
              Portfolio average from database
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
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Database className="h-3 w-3 text-green-500" />
              Saved in database
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Source</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Database</div>
            <p className="text-xs text-muted-foreground">
              {apiCallsToday}/{maxApiCallsPerDay} API calls used today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Database Analytics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5" />
              Portfolio Analysis
              <Badge className="bg-green-100 text-green-800">Database</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>High Yield Stocks (&gt;4%)</span>
                <span>{dividends.filter(d => d.dividend_yield > 4).length}</span>
              </div>
              <Progress 
                value={totalStocks > 0 ? (dividends.filter(d => d.dividend_yield > 4).length / totalStocks) * 100 : 0} 
                className="h-2" 
              />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Medium Yield Stocks (2-4%)</span>
                <span>{dividends.filter(d => d.dividend_yield >= 2 && d.dividend_yield <= 4).length}</span>
              </div>
              <Progress 
                value={totalStocks > 0 ? (dividends.filter(d => d.dividend_yield >= 2 && d.dividend_yield <= 4).length / totalStocks) * 100 : 0} 
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
              Database Status
              <Badge className="bg-blue-100 text-blue-800">Active</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{totalStocks}</div>
                <p className="text-xs text-muted-foreground">Saved Records</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">${totalAnnualIncome.toFixed(0)}</div>
                <p className="text-xs text-muted-foreground">Total Income</p>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Database Coverage</span>
                <span>100%</span>
              </div>
              <Progress value={100} className="h-2" />
            </div>

            <div className="pt-2 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Data Source:</span>
                <Badge className="bg-green-100 text-green-800">Database</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Storage:</span>
                <Badge variant="outline">Persistent</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Last Updated:</span>
                <Badge variant="outline">Live</Badge>
              </div>
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button onClick={refreshDividendData} variant="outline" size="sm" className="flex-1">
                <RefreshCw className="h-3 w-3 mr-1" />
                Refresh
              </Button>
              <SampleDataButton />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Income Breakdown from Database */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Income Breakdown
            <Badge className="bg-green-100 text-green-800">Database Source</Badge>
          </CardTitle>
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
          <div className="mt-4 text-center text-xs text-muted-foreground">
            💾 All calculations based on persistent database records
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export { DividendOverviewEnhanced };
