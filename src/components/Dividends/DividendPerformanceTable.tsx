
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUp, ArrowDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

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

const mockHoldings: HoldingData[] = [
  {
    id: "1",
    symbol: "AAPL",
    name: "Apple Inc.",
    costBasis: 135.76,
    currentValue: 142.35,
    dividendsReceived: 2.45,
    capitalGain: 6.59,
    capitalGainPercent: 4.85,
    realizedPL: 0.00,
    totalProfit: 9.04,
    totalProfitPercent: 6.66,
    dailyChange: 0.74,
    dailyChangePercent: 0.52,
    irr: 8.74
  },
  {
    id: "2",
    symbol: "MSFT",
    name: "Microsoft Corporation",
    costBasis: 220.45,
    currentValue: 245.23,
    dividendsReceived: 4.12,
    capitalGain: 24.78,
    capitalGainPercent: 11.24,
    realizedPL: 0.00,
    totalProfit: 28.90,
    totalProfitPercent: 13.11,
    dailyChange: 1.32,
    dailyChangePercent: 0.54,
    irr: 16.22
  },
  {
    id: "3",
    symbol: "JNJ",
    name: "Johnson & Johnson",
    costBasis: 152.34,
    currentValue: 157.89,
    dividendsReceived: 5.86,
    capitalGain: 5.55,
    capitalGainPercent: 3.64,
    realizedPL: 0.00,
    totalProfit: 11.41,
    totalProfitPercent: 7.49,
    dailyChange: -0.43,
    dailyChangePercent: -0.27,
    irr: 7.12
  },
  {
    id: "4",
    symbol: "VZ",
    name: "Verizon Communications Inc.",
    costBasis: 54.78,
    currentValue: 48.32,
    dividendsReceived: 3.24,
    capitalGain: -6.46,
    capitalGainPercent: -11.79,
    realizedPL: 0.00,
    totalProfit: -3.22,
    totalProfitPercent: -5.88,
    dailyChange: 0.12,
    dailyChangePercent: 0.25,
    irr: -3.45
  },
  {
    id: "5",
    symbol: "KO",
    name: "Coca-Cola Co",
    costBasis: 45.32,
    currentValue: 47.65,
    dividendsReceived: 2.12,
    capitalGain: 2.33,
    capitalGainPercent: 5.14,
    realizedPL: 0.00,
    totalProfit: 4.45,
    totalProfitPercent: 9.82,
    dailyChange: 0.23,
    dailyChangePercent: 0.48,
    irr: 7.23
  },
  {
    id: "6",
    symbol: "PG",
    name: "Procter & Gamble Co",
    costBasis: 132.65,
    currentValue: 138.42,
    dividendsReceived: 4.83,
    capitalGain: 5.77,
    capitalGainPercent: 4.35,
    realizedPL: 0.00,
    totalProfit: 10.60,
    totalProfitPercent: 7.99,
    dailyChange: 0.36,
    dailyChangePercent: 0.26,
    irr: 8.56
  },
  {
    id: "7",
    symbol: "SBUX",
    name: "Starbucks Corporation",
    costBasis: 87.23,
    currentValue: 83.56,
    dividendsReceived: 1.98,
    capitalGain: -3.67,
    capitalGainPercent: -4.21,
    realizedPL: 0.00,
    totalProfit: -1.69,
    totalProfitPercent: -1.94,
    dailyChange: -0.58,
    dailyChangePercent: -0.69,
    irr: -1.53
  },
  {
    id: "8",
    symbol: "O",
    name: "Realty Income Corporation",
    costBasis: 68.45,
    currentValue: 70.32,
    dividendsReceived: 4.86,
    capitalGain: 1.87,
    capitalGainPercent: 2.73,
    realizedPL: 0.00,
    totalProfit: 6.73,
    totalProfitPercent: 9.83,
    dailyChange: 0.24,
    dailyChangePercent: 0.34,
    irr: 9.42
  }
];

// Sort types
type SortField = 'symbol' | 'costBasis' | 'currentValue' | 'dividendsReceived' | 
  'capitalGain' | 'realizedPL' | 'totalProfit' | 'dailyChange' | 'irr';
type SortDirection = 'asc' | 'desc';

export function DividendPerformanceTable() {
  const [holdings, setHoldings] = useState<HoldingData[]>(mockHoldings);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('symbol');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [showSold, setShowSold] = useState(false);
  
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

  const totalCapitalGainPercent = (totals.capitalGain / totals.costBasis) * 100;
  const totalProfitPercent = (totals.totalProfit / totals.costBasis) * 100;
  const totalDailyChangePercent = (totals.dailyChange / totals.currentValue) * 100;
  const averageIRR = holdings.reduce((sum, holding) => sum + holding.irr, 0) / holdings.length;

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
          </TableBody>
        </Table>
      </div>
      
      <div className="flex justify-between text-sm text-muted-foreground">
        <div>Showing {filteredHoldings.length} of {holdings.length} holdings</div>
        <div>Data as of May 14, 2025</div>
      </div>
    </div>
  );
}
