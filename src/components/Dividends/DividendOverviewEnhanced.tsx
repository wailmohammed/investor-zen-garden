
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { supabase } from "@/integrations/supabase/client";
import { calculateDividendIncome, getDividendDatabaseStats } from "@/services/dividendCalculator";
import { TrendingUp, DollarSign, PieChart, Database, Target, AlertCircle } from "lucide-react";

interface DividendOverviewStats {
  totalAnnualIncome: number;
  totalQuarterlyIncome: number;
  portfolioYield: number;
  dividendPayingStocks: number;
  totalPositions: number;
  symbolsMatched: number;
  coveragePercentage: number;
  databaseSize: number;
}

const DividendOverviewEnhanced = () => {
  const { user } = useAuth();
  const { selectedPortfolio } = usePortfolio();
  const [stats, setStats] = useState<DividendOverviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDividendOverview = async () => {
    if (!user || !selectedPortfolio) {
      setLoading(false);
      return;
    }

    try {
      const trading212PortfolioId = localStorage.getItem('trading212_portfolio_id');
      
      if (selectedPortfolio === trading212PortfolioId) {
        const { data, error: functionError } = await supabase.functions.invoke('trading212-sync', {
          body: { portfolioId: selectedPortfolio }
        });

        if (functionError || data?.error) {
          setError(data?.message || 'Failed to fetch data');
          return;
        }

        if (data?.success && data.data?.positions) {
          const positions = data.data.positions;
          const dividendResults = calculateDividendIncome(positions);
          
          setStats({
            totalAnnualIncome: dividendResults.totalAnnualIncome,
            totalQuarterlyIncome: dividendResults.totalQuarterlyIncome,
            portfolioYield: dividendResults.portfolioYield,
            dividendPayingStocks: dividendResults.dividendPayingStocks.length,
            totalPositions: dividendResults.stats.totalPositions,
            symbolsMatched: dividendResults.stats.symbolsMatched,
            coveragePercentage: dividendResults.stats.coveragePercentage,
            databaseSize: dividendResults.stats.databaseSize
          });
        }
      }
    } catch (error) {
      console.error("Error fetching dividend overview:", error);
      setError('Failed to fetch dividend data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDividendOverview();
  }, [user, selectedPortfolio]);

  const databaseStats = getDividendDatabaseStats();

  if (loading) {
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

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (!stats) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No dividend data available. Please select a Trading212 portfolio.
        </AlertDescription>
      </Alert>
    );
  }

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
            <div className="text-2xl font-bold">${stats.totalAnnualIncome.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              ${(stats.totalAnnualIncome / 12).toFixed(2)} per month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Yield</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.portfolioYield.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">
              Annual dividend yield
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dividend Stocks</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.dividendPayingStocks}</div>
            <p className="text-xs text-muted-foreground">
              of {stats.totalPositions} total positions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database Coverage</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.coveragePercentage.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.symbolsMatched} of {stats.totalPositions} matched
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
              Coverage Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Symbol Recognition</span>
                <span>{stats.symbolsMatched}/{stats.totalPositions}</span>
              </div>
              <Progress value={stats.coveragePercentage} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Dividend Paying Stocks</span>
                <span>{stats.dividendPayingStocks}/{stats.symbolsMatched}</span>
              </div>
              <Progress 
                value={stats.symbolsMatched > 0 ? (stats.dividendPayingStocks / stats.symbolsMatched) * 100 : 0} 
                className="h-2" 
              />
            </div>

            <div className="pt-2 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Positions Analyzed:</span>
                <Badge variant="outline">{stats.totalPositions}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Symbols Matched:</span>
                <Badge variant="outline">{stats.symbolsMatched}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Dividend Stocks:</span>
                <Badge variant="outline">{stats.dividendPayingStocks}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Non-Dividend:</span>
                <Badge variant="outline">{stats.symbolsMatched - stats.dividendPayingStocks}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{databaseStats.totalStocks}</div>
                <p className="text-xs text-muted-foreground">Total Stocks</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{databaseStats.dividendPayingStocks}</div>
                <p className="text-xs text-muted-foreground">Dividend Paying</p>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Dividend Coverage</span>
                <span>{databaseStats.coverageRate}%</span>
              </div>
              <Progress value={databaseStats.coverageRate} className="h-2" />
            </div>

            <div className="pt-2 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Dividend Stocks:</span>
                <Badge className="bg-green-100 text-green-800">{databaseStats.dividendPayingStocks}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Non-Dividend:</span>
                <Badge className="bg-gray-100 text-gray-800">{databaseStats.nonDividendStocks}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Database Version:</span>
                <Badge variant="outline">Enhanced 500+</Badge>
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
              <div className="text-xl font-bold text-green-600">${stats.totalAnnualIncome.toFixed(2)}</div>
              <p className="text-sm text-muted-foreground">Annual Total</p>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-blue-600">${stats.totalQuarterlyIncome.toFixed(2)}</div>
              <p className="text-sm text-muted-foreground">Quarterly</p>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-purple-600">${(stats.totalAnnualIncome / 12).toFixed(2)}</div>
              <p className="text-sm text-muted-foreground">Monthly Average</p>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-orange-600">${(stats.totalAnnualIncome / 52).toFixed(2)}</div>
              <p className="text-sm text-muted-foreground">Weekly Average</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export { DividendOverviewEnhanced };
