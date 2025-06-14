
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MarketData {
  index: string;
  value: string;
  change: string;
  changePercent: string;
  isPositive: boolean;
}

const MarketOverview = () => {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate real-time market data
    const generateMarketData = (): MarketData[] => {
      const baseData = [
        { index: 'S&P 500', baseValue: 4200, volatility: 50 },
        { index: 'NASDAQ', baseValue: 13000, volatility: 200 },
        { index: 'DOW', baseValue: 33000, volatility: 300 },
        { index: 'Russell 2000', baseValue: 1900, volatility: 30 }
      ];

      return baseData.map(item => {
        const change = (Math.random() - 0.5) * item.volatility;
        const value = item.baseValue + change;
        const changePercent = (change / item.baseValue) * 100;
        
        return {
          index: item.index,
          value: value.toLocaleString('en-US', { maximumFractionDigits: 2 }),
          change: `${change >= 0 ? '+' : ''}${change.toFixed(2)}`,
          changePercent: `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`,
          isPositive: change >= 0
        };
      });
    };

    const updateMarketData = () => {
      setMarketData(generateMarketData());
      setIsLoading(false);
    };

    // Initial load
    updateMarketData();

    // Update every 30 seconds to simulate real-time data
    const interval = setInterval(updateMarketData, 30000);

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Market Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Market Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {marketData.map((item) => (
            <div key={item.index} className="flex items-center justify-between">
              <div>
                <div className="font-medium">{item.index}</div>
                <div className="text-sm text-muted-foreground">{item.value}</div>
              </div>
              <div className={`text-right ${item.isPositive ? 'text-finance-green' : 'text-finance-red'}`}>
                <div className="font-medium">{item.change}</div>
                <div className="text-sm">{item.changePercent}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-xs text-muted-foreground">
          Data updates every 30 seconds • Market data is simulated
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketOverview;
