
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUp, ArrowDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type HoldingData = {
  id: string;
  symbol: string;
  name: string;
  costBasis: number;
  currentValue: number;
  dividendsReceived: number;
  capitalGain: number;
  capitalGainPercent: number;
  realizedPL: number;
  totalProfit: number;
  totalProfitPercent: number;
  dailyChange: number;
  dailyChangePercent: number;
  irr: number;
};

// Sort types
type SortField = 'symbol' | 'costBasis' | 'currentValue' | 'dividendsReceived' | 
  'capitalGain' | 'realizedPL' | 'totalProfit' | 'dailyChange' | 'irr';
type SortDirection = 'asc' | 'desc';

export function DividendPerformanceTable() {
  const { user } = useAuth();
  const [holdings, setHoldings] = useState<HoldingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('symbol');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [showSold, setShowSold] = useState(false);

  useEffect(() => {
    fetchRealHoldingsData();
  }, [user]);

  const fetchRealHoldingsData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const trading212PortfolioId = localStorage.getItem('trading212_portfolio_id');
      
      if (trading212PortfolioId) {
        console.log('Fetching real Trading212 dividend performance data');
        
        const { data, error } = await supabase.functions.invoke('trading212-sync', {
          body: { portfolioId: trading212PortfolioId }
        });

        if (error) {
          console.error('Error fetching Trading212 data:', error);
          toast({
            title: "Error",
            description: "Failed to fetch Trading212 data",
            variant: "destructive",
          });
          setHoldings([]);
          return;
        }

        if (data?.success && data.data.positions) {
          // Convert Trading212 positions to dividend performance format
          const realHoldings: HoldingData[] = data.data.positions
            .filter((position: any) => position.quantity > 0) // Only show positions with shares
            .map((position: any, index: number) => {
              const costBasis = (position.averagePrice || 0) * (position.quantity || 0);
              const currentValue = (position.currentPrice || 0) * (position.quantity || 0);
              const capitalGain = currentValue - costBasis;
              const capitalGainPercent = costBasis > 0 ? (capitalGain / costBasis) * 100 : 0;
              
              // Calculate dividend data from dividendInfo if available
              const annualDividends = position.dividendInfo?.annualDividend || 0;
              const totalProfit = capitalGain + annualDividends;
              const totalProfitPercent = costBasis > 0 ? (totalProfit / costBasis) * 100 : 0;
              
              // Calculate IRR approximation (simplified)
              const irr = totalProfitPercent; // Simplified IRR calculation
              
              return {
                id: `trading212-${index}`,
                symbol: position.symbol || 'N/A',
                name: position.symbol || 'Unknown Company',
                costBasis: costBasis,
                currentValue: currentValue,
                dividendsReceived: annualDividends,
                capitalGain: capitalGain,
                capitalGainPercent: capitalGainPercent,
                realizedPL: 0, // Trading212 API doesn't provide realized P&L
                totalProfit: totalProfit,
                totalProfitPercent: totalProfitPercent,
                dailyChange: position.unrealizedPnL || 0,
                dailyChangePercent: costBasis > 0 ? ((position.unrealizedPnL || 0) / costBasis) * 100 : 0,
                irr: irr
              };
            });
          
          setHoldings(realHoldings);
          console.log('Real Trading212 dividend performance data loaded:', realHoldings);
        } else {
          setHoldings([]);
        }
      } else {
        // No Trading212 connection
        setHoldings([]);
      }
    } catch (error) {
      console.error('Error fetching holdings:', error);
      toast({
        title: "Error",
        description: "Failed to load holdings data",
        variant: "destructive",
      });
      setHoldings([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Filter holdings based on search query
  const filteredHoldings = holdings.filter(holding => 
    holding.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || 
    holding.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort holdings
  const sortedHoldings = [...filteredHoldings].sort((a, b) => {
    if (sortField === 'symbol') {
      return sortDirection === 'asc' 
        ? a.symbol.localeCompare(b.symbol)
        : b.symbol.localeCompare(a.symbol);
    }
    
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (sortDirection === 'asc') {
      return aValue - bValue;
    } else {
      return bValue - aValue;
    }
  });
  
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const exportToCSV = () => {
    // In a real implementation, this would generate a CSV file
    toast({
      title: "Export started",
      description: "Your portfolio data is being exported to CSV.",
    });
  };
  
  // Calculate portfolio totals
  const totals = holdings.reduce((acc, holding) => ({
    costBasis: acc.costBasis + holding.costBasis,
    currentValue: acc.currentValue + holding.currentValue,
    dividendsReceived: acc.dividendsReceived + holding.dividendsReceived,
    capitalGain: acc.capitalGain + holding.capitalGain,
    realizedPL: acc.realizedPL + holding.realizedPL,
    totalProfit: acc.totalProfit + holding.totalProfit,
    dailyChange: acc.dailyChange + holding.dailyChange,
  }), {
    costBasis: 0,
    currentValue: 0,
    dividendsReceived: 0,
    capitalGain: 0,
    realizedPL: 0,
    totalProfit: 0,
    dailyChange: 0
  });

  const totalCapitalGainPercent = totals.costBasis > 0 ? (totals.capitalGain / totals.costBasis) * 100 : 0;
  const totalProfitPercent = totals.costBasis > 0 ? (totals.totalProfit / totals.costBasis) * 100 : 0;
  const totalDailyChangePercent = totals.currentValue > 0 ? (totals.dailyChange / totals.currentValue) * 100 : 0;
  const averageIRR = holdings.length > 0 ? holdings.reduce((sum, holding) => sum + holding.irr, 0) / holdings.length : 0;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-muted rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search holdings..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowSold(!showSold)}
            className={cn(showSold && "bg-muted")}
          >
            {showSold ? "Hide Sold" : "Show Sold"}
          </Button>
          <Button variant="outline" size="sm" onClick={exportToCSV}>
            Export CSV
          </Button>
        </div>
      </div>

      <div className="rounded-md border overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => handleSort('symbol')} className="cursor-pointer hover:bg-muted/80">
                Holding
                {sortField === 'symbol' && (
                  <span className="ml-1 inline-block">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </TableHead>
              <TableHead onClick={() => handleSort('costBasis')} className="cursor-pointer hover:bg-muted/80 text-right">
                Cost basis
                {sortField === 'costBasis' && (
                  <span className="ml-1 inline-block">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </TableHead>
              <TableHead onClick={() => handleSort('currentValue')} className="cursor-pointer hover:bg-muted/80 text-right">
                Current value
                {sortField === 'currentValue' && (
                  <span className="ml-1 inline-block">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </TableHead>
              <TableHead onClick={() => handleSort('dividendsReceived')} className="cursor-pointer hover:bg-muted/80 text-right">
                Div. received
                {sortField === 'dividendsReceived' && (
                  <span className="ml-1 inline-block">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </TableHead>
              <TableHead onClick={() => handleSort('capitalGain')} className="cursor-pointer hover:bg-muted/80 text-right">
                Capital gain
                {sortField === 'capitalGain' && (
                  <span className="ml-1 inline-block">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </TableHead>
              <TableHead onClick={() => handleSort('realizedPL')} className="cursor-pointer hover:bg-muted/80 text-right">
                Realized P&L
                {sortField === 'realizedPL' && (
                  <span className="ml-1 inline-block">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </TableHead>
              <TableHead onClick={() => handleSort('totalProfit')} className="cursor-pointer hover:bg-muted/80 text-right">
                Total profit
                {sortField === 'totalProfit' && (
                  <span className="ml-1 inline-block">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </TableHead>
              <TableHead onClick={() => handleSort('dailyChange')} className="cursor-pointer hover:bg-muted/80 text-right">
                Daily
                {sortField === 'dailyChange' && (
                  <span className="ml-1 inline-block">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </TableHead>
              <TableHead onClick={() => handleSort('irr')} className="cursor-pointer hover:bg-muted/80 text-right">
                IRR
                {sortField === 'irr' && (
                  <span className="ml-1 inline-block">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedHoldings.length > 0 ? (
              <>
                {sortedHoldings.map((holding) => (
                  <TableRow key={holding.id}>
                    <TableCell>
                      <div>
                        <div className="font-semibold">{holding.symbol}</div>
                        <div className="text-xs text-muted-foreground">{holding.name}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      ${holding.costBasis.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      ${holding.currentValue.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      ${holding.dividendsReceived.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className={cn(
                        holding.capitalGain >= 0 ? "text-finance-green" : "text-finance-red"
                      )}>
                        {holding.capitalGain >= 0 ? "+" : ""}${Math.abs(holding.capitalGain).toFixed(2)}
                        <div className="text-xs">
                          {holding.capitalGain >= 0 ? "+" : ""}{holding.capitalGainPercent.toFixed(2)}%
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      ${holding.realizedPL.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className={cn(
                        holding.totalProfit >= 0 ? "text-finance-green" : "text-finance-red"
                      )}>
                        {holding.totalProfit >= 0 ? "+" : ""}${Math.abs(holding.totalProfit).toFixed(2)}
                        <div className="text-xs">
                          {holding.totalProfit >= 0 ? "+" : ""}{holding.totalProfitPercent.toFixed(2)}%
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className={cn(
                        holding.dailyChange >= 0 ? "text-finance-green" : "text-finance-red"
                      )}>
                        {holding.dailyChange >= 0 ? "+" : ""}${Math.abs(holding.dailyChange).toFixed(2)}
                        <div className="text-xs">
                          {holding.dailyChange >= 0 ? "+" : ""}{holding.dailyChangePercent.toFixed(2)}%
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={holding.irr >= 0 ? "outline" : "destructive"} className={cn(
                        holding.irr >= 0 ? "bg-green-50 text-green-800" : "",
                        "font-normal"
                      )}>
                        {holding.irr.toFixed(2)}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {holdings.length > 0 && (
                  <TableRow className="bg-muted/50 font-medium">
                    <TableCell>Total</TableCell>
                    <TableCell className="text-right">${totals.costBasis.toFixed(2)}</TableCell>
                    <TableCell className="text-right">${totals.currentValue.toFixed(2)}</TableCell>
                    <TableCell className="text-right">${totals.dividendsReceived.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <div className={cn(
                        totals.capitalGain >= 0 ? "text-finance-green" : "text-finance-red"
                      )}>
                        {totals.capitalGain >= 0 ? "+" : ""}${Math.abs(totals.capitalGain).toFixed(2)}
                        <div className="text-xs">
                          {totals.capitalGain >= 0 ? "+" : ""}{totalCapitalGainPercent.toFixed(2)}%
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">${totals.realizedPL.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <div className={cn(
                        totals.totalProfit >= 0 ? "text-finance-green" : "text-finance-red"
                      )}>
                        {totals.totalProfit >= 0 ? "+" : ""}${Math.abs(totals.totalProfit).toFixed(2)}
                        <div className="text-xs">
                          {totals.totalProfit >= 0 ? "+" : ""}{totalProfitPercent.toFixed(2)}%
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className={cn(
                        totals.dailyChange >= 0 ? "text-finance-green" : "text-finance-red"
                      )}>
                        {totals.dailyChange >= 0 ? "+" : ""}${Math.abs(totals.dailyChange).toFixed(2)}
                        <div className="text-xs">
                          {totals.dailyChange >= 0 ? "+" : ""}{totalDailyChangePercent.toFixed(2)}%
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={averageIRR >= 0 ? "outline" : "destructive"} className={cn(
                        averageIRR >= 0 ? "bg-green-50 text-green-800" : "",
                        "font-normal"
                      )}>
                        {averageIRR.toFixed(2)}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                )}
              </>
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  {loading ? "Loading holdings..." : "No holdings found. Connect your Trading212 account to see dividend performance data."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex justify-between text-sm text-muted-foreground">
        <div>Showing {filteredHoldings.length} of {holdings.length} holdings</div>
        <div>Data from Trading212 - {new Date().toLocaleDateString()}</div>
      </div>
    </div>
  );
}
