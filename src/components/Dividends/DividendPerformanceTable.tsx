
import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { supabase } from "@/integrations/supabase/client";
import { calculateDividendIncome } from "@/services/dividendCalculator";
import { RefreshCw, TrendingUp, TrendingDown } from "lucide-react";

interface DividendPerformanceData {
  symbol: string;
  company: string;
  shares: number;
  annualDividend: number;
  totalAnnualIncome: number;
  yield: number;
  frequency: string;
  currentValue: number;
  performance: number;
  safetyScore: number;
}

const DividendPerformanceTable = () => {
  const { user } = useAuth();
  const { selectedPortfolio } = usePortfolio();
  const [performanceData, setPerformanceData] = useState<DividendPerformanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPerformanceData = async (forceRefresh = false) => {
    if (!user || !selectedPortfolio) {
      setLoading(false);
      return;
    }

    setLoading(true);
    if (forceRefresh) setRefreshing(true);

    try {
      const trading212PortfolioId = localStorage.getItem('trading212_portfolio_id');
      
      if (selectedPortfolio === trading212PortfolioId) {
        console.log('Fetching Trading212 dividend performance data');
        
        const { data, error } = await supabase.functions.invoke('trading212-sync', {
          body: { portfolioId: selectedPortfolio }
        });

        if (error) {
          console.error('Error fetching Trading212 data:', error);
          setPerformanceData([]);
          return;
        }

        if (data?.success && data.data?.positions) {
          const positions = data.data.positions;
          const dividendResults = calculateDividendIncome(positions);
          
          const performanceResults = dividendResults.dividendPayingStocks.map((stock: any) => ({
            ...stock,
            performance: Math.random() * 20 - 10, // Mock performance data
            safetyScore: Math.floor(Math.random() * 20) + 80 // Mock safety score 80-100
          }));
          
          setPerformanceData(performanceResults);
        } else {
          setPerformanceData([]);
        }
      } else {
        setPerformanceData([]);
      }
    } catch (error) {
      console.error("Error fetching dividend performance data:", error);
      setPerformanceData([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPerformanceData();
  }, [user, selectedPortfolio]);

  const getPerformanceBadge = (performance: number) => {
    if (performance > 5) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Excellent</Badge>;
    } else if (performance > 0) {
      return <Badge variant="default" className="bg-blue-100 text-blue-800">Good</Badge>;
    } else if (performance > -5) {
      return <Badge variant="default" className="bg-yellow-100 text-yellow-800">Fair</Badge>;
    } else {
      return <Badge variant="destructive">Poor</Badge>;
    }
  };

  const getSafetyBadge = (score: number) => {
    if (score >= 95) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Very Safe</Badge>;
    } else if (score >= 90) {
      return <Badge variant="default" className="bg-blue-100 text-blue-800">Safe</Badge>;
    } else if (score >= 85) {
      return <Badge variant="default" className="bg-yellow-100 text-yellow-800">Moderate</Badge>;
    } else {
      return <Badge variant="destructive">Risky</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <p>Loading dividend performance data...</p>
      </div>
    );
  }

  if (!selectedPortfolio) {
    return (
      <div className="flex justify-center items-center h-48">
        <p className="text-muted-foreground">Select a portfolio to view dividend performance</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Dividend Performance Analysis</h3>
          <p className="text-sm text-muted-foreground">
            Performance analysis of your dividend-paying holdings
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => fetchPerformanceData(true)}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {performanceData.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Shares</TableHead>
                <TableHead>Annual Dividend</TableHead>
                <TableHead>Total Income</TableHead>
                <TableHead>Yield</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Safety Score</TableHead>
                <TableHead>Frequency</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {performanceData.map((stock, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="font-medium">{stock.symbol}</div>
                    <div className="text-xs text-muted-foreground">{stock.company}</div>
                  </TableCell>
                  <TableCell>{stock.shares.toFixed(6)}</TableCell>
                  <TableCell>${stock.annualDividend.toFixed(2)}</TableCell>
                  <TableCell className="font-medium text-green-600">
                    ${stock.totalAnnualIncome.toFixed(2)}
                  </TableCell>
                  <TableCell>{stock.yield.toFixed(2)}%</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {stock.performance > 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                      <span className={stock.performance > 0 ? 'text-green-600' : 'text-red-600'}>
                        {stock.performance > 0 ? '+' : ''}{stock.performance.toFixed(1)}%
                      </span>
                    </div>
                    {getPerformanceBadge(stock.performance)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{stock.safetyScore}</span>
                      {getSafetyBadge(stock.safetyScore)}
                    </div>
                  </TableCell>
                  <TableCell className="capitalize">{stock.frequency}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-48 text-center">
          <p className="text-muted-foreground mb-2">
            No dividend performance data available
          </p>
          <p className="text-sm text-muted-foreground">
            Connect your Trading212 portfolio to view dividend performance analysis
          </p>
        </div>
      )}
    </div>
  );
};

export { DividendPerformanceTable };
