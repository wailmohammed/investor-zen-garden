
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { useDividendData } from "@/contexts/DividendDataContext";
import { getSavedDividendData } from "@/services/dividendService";
import { Database, TrendingUp, TrendingDown, RefreshCw, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DividendStock {
  id: string;
  symbol: string;
  company_name: string;
  annual_dividend: number;
  dividend_yield: number;
  frequency: string;
  shares_owned: number;
  estimated_annual_income: number;
  detection_source: string;
  is_active: boolean;
}

const DividendPerformanceTable = () => {
  const { user } = useAuth();
  const { selectedPortfolio } = usePortfolio();
  const [dividendStocks, setDividendStocks] = useState<DividendStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Try to use context first, fallback to direct database call
  let dividendContext;
  try {
    dividendContext = useDividendData();
  } catch (error) {
    console.log('DividendDataContext not available, using direct database access');
  }

  const loadDividendData = async () => {
    if (!user?.id || !selectedPortfolio) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('Loading dividend performance data from database');
      const data = await getSavedDividendData(user.id, selectedPortfolio);
      
      if (data && data.length > 0) {
        setDividendStocks(data);
        console.log(`Loaded ${data.length} dividend stocks from database`);
      } else {
        setDividendStocks([]);
        console.log('No dividend data found in database');
      }
    } catch (error) {
      console.error('Error loading dividend data:', error);
      setError('Failed to load dividend data from database');
      setDividendStocks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Use context data if available
    if (dividendContext) {
      setDividendStocks(dividendContext.dividends || []);
      setLoading(dividendContext.loading);
      setError(dividendContext.error);
    } else {
      // Fallback to direct database call
      loadDividendData();
    }
  }, [user?.id, selectedPortfolio, dividendContext?.dividends]);

  const handleRefresh = async () => {
    if (dividendContext) {
      await dividendContext.refreshDividendData();
    } else {
      await loadDividendData();
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Dividend Performance
            <Badge variant="secondary">Loading...</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Dividend Performance
            <Badge variant="destructive">Error</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={handleRefresh} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!selectedPortfolio) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Dividend Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please select a portfolio to view dividend performance data.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (dividendStocks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Dividend Performance
            <Badge className="bg-yellow-100 text-yellow-800">No Data</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Database className="h-12 w-12 mx-auto mb-4 text-blue-500" />
            <h3 className="text-lg font-medium mb-2">No Dividend Data Found</h3>
            <p className="text-muted-foreground mb-4">
              No dividend stocks found in the database for this portfolio.
              You may need to sync your portfolio data or add dividend stocks manually.
            </p>
            <Button onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Dividend Performance
            <Badge className="bg-green-100 text-green-800">
              Database ({dividendStocks.length} stocks)
            </Badge>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Stock</TableHead>
                <TableHead>Shares</TableHead>
                <TableHead>Annual Dividend</TableHead>
                <TableHead>Yield</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Annual Income</TableHead>
                <TableHead>Source</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dividendStocks.map((stock) => (
                <TableRow key={stock.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{stock.symbol}</div>
                      <div className="text-sm text-muted-foreground">
                        {stock.company_name || stock.symbol}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {stock.shares_owned ? stock.shares_owned.toFixed(6) : 'N/A'}
                  </TableCell>
                  <TableCell>${stock.annual_dividend.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className={`flex items-center gap-1 ${
                      stock.dividend_yield >= 4 ? 'text-green-600' : 
                      stock.dividend_yield >= 2 ? 'text-blue-600' : 'text-gray-600'
                    }`}>
                      {stock.dividend_yield >= 4 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {stock.dividend_yield.toFixed(2)}%
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {stock.frequency || 'Quarterly'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium text-green-600">
                    ${stock.estimated_annual_income.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="secondary" 
                      className="bg-green-100 text-green-800 text-xs"
                    >
                      <Database className="h-3 w-3 mr-1" />
                      {stock.detection_source === 'portfolio_data' ? 'Portfolio DB' : 'API → DB'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        <div className="mt-4 text-center text-sm text-muted-foreground">
          💾 All data loaded from persistent database storage
        </div>
      </CardContent>
    </Card>
  );
};

export { DividendPerformanceTable };
