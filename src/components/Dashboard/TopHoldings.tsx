
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import StockCard from "../StockCard";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const mockHoldings = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    price: "$187.53",
    change: {
      value: "+$1.25",
      percentage: "+0.67%",
      isPositive: true,
    },
    shares: 25,
    totalValue: "$4,688.25"
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    price: "$404.87",
    change: {
      value: "+$2.14",
      percentage: "+0.53%",
      isPositive: true,
    },
    shares: 12,
    totalValue: "$4,858.44"
  },
  {
    symbol: "AMZN",
    name: "Amazon.com Inc.",
    price: "$176.53",
    change: {
      value: "+$0.78",
      percentage: "+0.44%",
      isPositive: true,
    },
    shares: 8,
    totalValue: "$1,412.24"
  },
  {
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    price: "$864.13",
    change: {
      value: "-$12.37",
      percentage: "-1.41%",
      isPositive: false,
    },
    shares: 5,
    totalValue: "$4,320.65"
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    price: "$142.56",
    change: {
      value: "+$0.89",
      percentage: "+0.63%",
      isPositive: true,
    },
    shares: 15,
    totalValue: "$2,138.40"
  },
  {
    symbol: "TSLA",
    name: "Tesla Inc.",
    price: "$248.42",
    change: {
      value: "-$3.21",
      percentage: "-1.28%",
      isPositive: false,
    },
    shares: 10,
    totalValue: "$2,484.20"
  }
];

const TopHoldings = () => {
  const { selectedPortfolio } = usePortfolio();
  const { toast } = useToast();
  const [holdings, setHoldings] = useState(mockHoldings);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchHoldings();
  }, [selectedPortfolio]);

  const fetchHoldings = async () => {
    if (!selectedPortfolio) {
      setHoldings([]);
      return;
    }

    try {
      setIsLoading(true);
      
      // Check if this is a Trading212 connected portfolio
      const trading212PortfolioId = localStorage.getItem('trading212_portfolio_id');
      
      if (selectedPortfolio === trading212PortfolioId) {
        console.log('Fetching real Trading212 holdings data');
        
        // Call the Trading212 sync function to get real data
        const { data, error } = await supabase.functions.invoke('trading212-sync', {
          body: { portfolioId: selectedPortfolio }
        });

        if (error) {
          console.error('Error fetching Trading212 holdings:', error);
          toast({
            title: "Error",
            description: "Failed to fetch Trading212 holdings. Using cached data.",
            variant: "destructive",
          });
          setHoldings(mockHoldings.slice(0, 4));
        } else if (data?.success && data.data.positions) {
          // Convert Trading212 positions to our format
          const realHoldings = data.data.positions.map((position, index) => ({
            symbol: position.symbol,
            name: position.symbol, // Trading212 API doesn't provide company names
            price: `$${position.currentPrice.toFixed(2)}`,
            change: {
              value: `${position.unrealizedPnL >= 0 ? '+' : ''}$${Math.abs(position.unrealizedPnL).toFixed(2)}`,
              percentage: `${position.unrealizedPnL >= 0 ? '+' : ''}${((position.unrealizedPnL / (position.averagePrice * position.quantity)) * 100).toFixed(2)}%`,
              isPositive: position.unrealizedPnL >= 0
            },
            shares: position.quantity,
            totalValue: `$${position.marketValue.toFixed(2)}`
          }));
          
          setHoldings(realHoldings);
          console.log('Real Trading212 holdings loaded:', realHoldings);
        }
      } else {
        // Use mock data for other portfolios
        setHoldings(mockHoldings);
      }
    } catch (error) {
      console.error('Error fetching holdings:', error);
      toast({
        title: "Error",
        description: "Failed to load holdings data",
        variant: "destructive",
      });
      setHoldings(mockHoldings.slice(0, 4));
    } finally {
      setIsLoading(false);
    }
  };

  const topHoldings = holdings.slice(0, 4);

  if (isLoading) {
    return (
      <Card className="col-span-3">
        <CardHeader className="pb-2">
          <CardTitle>Top Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-3">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle>Top Holdings</CardTitle>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" className="text-sm text-finance-blue hover:underline">
              View All
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>All Holdings</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-4">
              {holdings.length > 0 ? (
                holdings.map((holding) => (
                  <StockCard key={holding.symbol} {...holding} />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No holdings found for this portfolio.</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topHoldings.length > 0 ? (
            topHoldings.map((holding) => (
              <StockCard key={holding.symbol} {...holding} />
            ))
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <p>No holdings found.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TopHoldings;
