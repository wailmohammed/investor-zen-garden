
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, TrendingUp, DollarSign } from "lucide-react";

interface Stock {
  symbol: string;
  company: string;
  price: number;
  dividendYield: number;
  payoutRatio: number;
  peRatio: number;
  marketCap: number;
  sector: string;
  dividendGrowth: number;
  safetyScore: number;
}

const StockScreener = () => {
  const [filters, setFilters] = useState({
    minYield: [0],
    maxPayoutRatio: [100],
    minMarketCap: [0],
    sector: '',
    minSafetyScore: [0],
    minDividendGrowth: [0],
  });

  const [results, setResults] = useState<Stock[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Mock stock data
  const mockStocks: Stock[] = [
    {
      symbol: 'AAPL',
      company: 'Apple Inc.',
      price: 175.43,
      dividendYield: 0.47,
      payoutRatio: 15.2,
      peRatio: 28.5,
      marketCap: 2800000,
      sector: 'Technology',
      dividendGrowth: 8.5,
      safetyScore: 92
    },
    {
      symbol: 'MSFT',
      company: 'Microsoft Corp.',
      price: 378.85,
      dividendYield: 0.72,
      payoutRatio: 25.1,
      peRatio: 32.1,
      marketCap: 2810000,
      sector: 'Technology',
      dividendGrowth: 11.2,
      safetyScore: 89
    },
    {
      symbol: 'JNJ',
      company: 'Johnson & Johnson',
      price: 160.25,
      dividendYield: 2.95,
      payoutRatio: 45.3,
      peRatio: 15.8,
      marketCap: 428000,
      sector: 'Healthcare',
      dividendGrowth: 5.8,
      safetyScore: 88
    },
    {
      symbol: 'KO',
      company: 'Coca-Cola Co.',
      price: 61.15,
      dividendYield: 3.12,
      payoutRatio: 75.3,
      peRatio: 25.2,
      marketCap: 264000,
      sector: 'Consumer Staples',
      dividendGrowth: 3.2,
      safetyScore: 85
    },
    {
      symbol: 'VZ',
      company: 'Verizon Communications',
      price: 40.85,
      dividendYield: 6.24,
      payoutRatio: 85.6,
      peRatio: 9.1,
      marketCap: 168000,
      sector: 'Telecommunications',
      dividendGrowth: 2.1,
      safetyScore: 72
    }
  ];

  const handleSearch = () => {
    setIsSearching(true);
    
    // Simulate API call
    setTimeout(() => {
      const filtered = mockStocks.filter(stock => {
        return (
          stock.dividendYield >= filters.minYield[0] &&
          stock.payoutRatio <= filters.maxPayoutRatio[0] &&
          stock.marketCap >= filters.minMarketCap[0] * 1000 &&
          (filters.sector === '' || stock.sector === filters.sector) &&
          stock.safetyScore >= filters.minSafetyScore[0] &&
          stock.dividendGrowth >= filters.minDividendGrowth[0]
        );
      });
      
      setResults(filtered);
      setIsSearching(false);
    }, 1000);
  };

  const resetFilters = () => {
    setFilters({
      minYield: [0],
      maxPayoutRatio: [100],
      minMarketCap: [0],
      sector: '',
      minSafetyScore: [0],
      minDividendGrowth: [0],
    });
    setResults([]);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Dividend Stock Screener</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Dividend Yield */}
            <div className="space-y-2">
              <Label>Minimum Dividend Yield (%)</Label>
              <Slider
                value={filters.minYield}
                onValueChange={(value) => setFilters(prev => ({ ...prev, minYield: value }))}
                max={10}
                step={0.1}
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">{filters.minYield[0]}%</p>
            </div>

            {/* Payout Ratio */}
            <div className="space-y-2">
              <Label>Maximum Payout Ratio (%)</Label>
              <Slider
                value={filters.maxPayoutRatio}
                onValueChange={(value) => setFilters(prev => ({ ...prev, maxPayoutRatio: value }))}
                max={100}
                step={1}
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">{filters.maxPayoutRatio[0]}%</p>
            </div>

            {/* Market Cap */}
            <div className="space-y-2">
              <Label>Minimum Market Cap (Billions)</Label>
              <Slider
                value={filters.minMarketCap}
                onValueChange={(value) => setFilters(prev => ({ ...prev, minMarketCap: value }))}
                max={1000}
                step={10}
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">${filters.minMarketCap[0]}B</p>
            </div>

            {/* Sector */}
            <div className="space-y-2">
              <Label>Sector</Label>
              <Select value={filters.sector} onValueChange={(value) => setFilters(prev => ({ ...prev, sector: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All sectors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All sectors</SelectItem>
                  <SelectItem value="Technology">Technology</SelectItem>
                  <SelectItem value="Healthcare">Healthcare</SelectItem>
                  <SelectItem value="Consumer Staples">Consumer Staples</SelectItem>
                  <SelectItem value="Telecommunications">Telecommunications</SelectItem>
                  <SelectItem value="Financials">Financials</SelectItem>
                  <SelectItem value="Utilities">Utilities</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Safety Score */}
            <div className="space-y-2">
              <Label>Minimum Safety Score</Label>
              <Slider
                value={filters.minSafetyScore}
                onValueChange={(value) => setFilters(prev => ({ ...prev, minSafetyScore: value }))}
                max={100}
                step={1}
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">{filters.minSafetyScore[0]}</p>
            </div>

            {/* Dividend Growth */}
            <div className="space-y-2">
              <Label>Minimum Dividend Growth (%)</Label>
              <Slider
                value={filters.minDividendGrowth}
                onValueChange={(value) => setFilters(prev => ({ ...prev, minDividendGrowth: value }))}
                max={20}
                step={0.1}
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">{filters.minDividendGrowth[0]}%</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? 'Searching...' : 'Search Stocks'}
            </Button>
            <Button variant="outline" onClick={resetFilters}>
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Search Results ({results.length} stocks found)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map(stock => (
                <div key={stock.symbol} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{stock.symbol}</h3>
                      <p className="text-sm text-muted-foreground">{stock.company}</p>
                      <Badge variant="outline">{stock.sector}</Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">${stock.price}</p>
                      <p className="text-sm text-green-600">Yield: {stock.dividendYield}%</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Market Cap</p>
                      <p className="font-medium">${(stock.marketCap / 1000).toFixed(1)}B</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">P/E Ratio</p>
                      <p className="font-medium">{stock.peRatio}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Payout Ratio</p>
                      <p className="font-medium">{stock.payoutRatio}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Div Growth</p>
                      <p className="font-medium text-green-600">{stock.dividendGrowth}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Safety Score</p>
                      <p className="font-medium">{stock.safetyScore}/100</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StockScreener;
