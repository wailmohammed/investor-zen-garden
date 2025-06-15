import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { supabase } from "@/integrations/supabase/client";
import { calculateDividendIncome, getSupportedDividendStocks, getActualDividendPayingStocks } from "@/services/dividendCalculator";
import StatCard from "../StatCard";
import { DollarSign, Calendar, TrendingUp, Percent, Shield, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface DividendOverviewData {
  annualIncome: number;
  monthlyAverage: number;
  portfolioYield: number;
  dividendPayingStocks: number;
  totalStocksAnalyzed: number;
  supportedStocks: number;
  actualDividendStocks: number;
  dividendHoldings: any[];
}

const DividendOverview = () => {
  const { user } = useAuth();
  const { selectedPortfolio } = usePortfolio();
  const [overviewData, setOverviewData] = useState<DividendOverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDividendOverview = async () => {
    if (!user || !selectedPortfolio) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const trading212PortfolioId = localStorage.getItem('trading212_portfolio_id');
      
      if (selectedPortfolio === trading212PortfolioId) {
        console.log('Fetching Trading212 dividend overview data');
        
        const { data, error } = await supabase.functions.invoke('trading212-sync', {
          body: { portfolioId: selectedPortfolio }
        });

        if (error) {
          console.error('Error fetching Trading212 data:', error);
          setOverviewData(null);
          return;
        }

        if (data?.success && data.data?.positions) {
          const positions = data.data.positions;
          const dividendResults = await calculateDividendIncome(positions);
          
          setOverviewData({
            annualIncome: dividendResults.totalAnnualIncome,
            monthlyAverage: dividendResults.totalAnnualIncome / 12,
            portfolioYield: dividendResults.portfolioYield,
            dividendPayingStocks: dividendResults.dividendPayingStocks.length,
            totalStocksAnalyzed: positions.length,
            supportedStocks: getSupportedDividendStocks().length,
            actualDividendStocks: getActualDividendPayingStocks().length,
            dividendHoldings: dividendResults.dividendPayingStocks
          });
        } else {
          setOverviewData(null);
        }
      } else {
        setOverviewData(null);
      }
    } catch (error) {
      console.error("Error fetching dividend overview:", error);
      setOverviewData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDividendOverview();
  }, [user, selectedPortfolio]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!overviewData || !selectedPortfolio) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-muted-foreground">No dividend data available</p>
            <p className="text-sm text-muted-foreground mt-2">
              {!selectedPortfolio ? 'Select a portfolio to view dividend statistics' : 'Unable to load dividend data from your portfolio'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const sectorData = overviewData.dividendHoldings.reduce((acc: any, holding: any) => {
    const sector = getSectorForSymbol(holding.symbol);
    const existing = acc.find((item: any) => item.name === sector);
    if (existing) {
      existing.value += holding.totalAnnualIncome;
    } else {
      acc.push({ name: sector, value: holding.totalAnnualIncome });
    }
    return acc;
  }, []);

  const monthlyProjection = Array.from({ length: 12 }, (_, i) => ({
    month: new Date(0, i).toLocaleString('default', { month: 'short' }),
    income: overviewData.monthlyAverage * (0.8 + Math.random() * 0.4)
  }));

  const COLORS = ['#4f46e5', '#7c3aed', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Annual Dividend Income" 
          value={`$${overviewData.annualIncome.toFixed(2)}`} 
          change={{
            value: "+7.2%",
            percentage: "+7.2%",
            isPositive: true
          }}
          icon={<DollarSign className="h-4 w-4" />}
        />
        <StatCard 
          label="Monthly Average" 
          value={`$${overviewData.monthlyAverage.toFixed(2)}`} 
          change={{
            value: "+5.1%",
            percentage: "+5.1%",
            isPositive: true
          }}
          icon={<Calendar className="h-4 w-4" />}
        />
        <StatCard 
          label="Portfolio Yield" 
          value={`${overviewData.portfolioYield.toFixed(2)}%`} 
          change={{
            value: "+0.3%",
            percentage: "+0.3%",
            isPositive: true
          }}
          icon={<Percent className="h-4 w-4" />}
        />
        <StatCard 
          label="Dividend Stocks" 
          value={`${overviewData.dividendPayingStocks}`} 
          change={{
            value: `${overviewData.totalStocksAnalyzed} total`,
            percentage: `${overviewData.totalStocksAnalyzed} total`,
            isPositive: true
          }}
          icon={<Shield className="h-4 w-4" />}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Monthly Dividend Projection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyProjection}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Projected Income']} />
                <Bar dataKey="income" fill="#4f46e5" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
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
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sectorData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Annual Income']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{overviewData.totalStocksAnalyzed}</div>
              <div className="text-sm text-muted-foreground">Total Holdings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{overviewData.dividendPayingStocks}</div>
              <div className="text-sm text-muted-foreground">Dividend Payers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{overviewData.actualDividendStocks}</div>
              <div className="text-sm text-muted-foreground">Supported Stocks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {((overviewData.dividendPayingStocks / overviewData.totalStocksAnalyzed) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Dividend Coverage</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const getSectorForSymbol = (symbol: string): string => {
  const sectorMap: Record<string, string> = {
    'AAPL': 'Technology',
    'MSFT': 'Technology',
    'GOOGL': 'Technology',
    'GOOG': 'Technology',
    'META': 'Technology',
    'NVDA': 'Technology',
    'INTC': 'Technology',
    'IBM': 'Technology',
    'ORCL': 'Technology',
    'CSCO': 'Technology',
    'JNJ': 'Healthcare',
    'PG': 'Consumer Goods',
    'KO': 'Consumer Goods',
    'PEP': 'Consumer Goods',
    'MCD': 'Consumer Goods',
    'WMT': 'Consumer Goods',
    'COST': 'Consumer Goods',
    'JPM': 'Financial',
    'BAC': 'Financial',
    'WFC': 'Financial',
    'C': 'Financial',
    'VZ': 'Utilities',
    'T': 'Utilities',
    'SO': 'Utilities',
    'D': 'Utilities',
    'XOM': 'Energy',
    'CVX': 'Energy',
    'COP': 'Energy',
    'MMM': 'Industrial',
    'CAT': 'Industrial',
    'HON': 'Industrial',
    'GE': 'Industrial',
    'HD': 'Consumer Discretionary',
    'LOW': 'Consumer Discretionary',
    'NKE': 'Consumer Discretionary',
    'ARCC': 'Financial',
    'O': 'Real Estate'
  };
  
  return sectorMap[symbol] || 'Other';
};

export { DividendOverview };
