
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatCard from "../StatCard";
import { PortfolioSelector } from "@/components/ui/portfolio-selector";
import { useState, useEffect } from "react";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const PortfolioSummary = () => {
  const { toast } = useToast();
  const { portfolios, selectedPortfolio, setSelectedPortfolio, isLoading } = usePortfolio();
  const [portfolioData, setPortfolioData] = useState({
    totalValue: "$0.00",
    todayChange: "$0.00",
    todayPercentage: "0%",
    totalReturn: "$0.00",
    totalReturnPercentage: "0%",
    holdingsCount: 0
  });

  // Fetch portfolio-specific data
  useEffect(() => {
    const fetchPortfolioData = async () => {
      if (!selectedPortfolio) {
        console.log('No portfolio selected, resetting data');
        setPortfolioData({
          totalValue: "$0.00",
          todayChange: "$0.00",
          todayPercentage: "0%",
          totalReturn: "$0.00",
          totalReturnPercentage: "0%",
          holdingsCount: 0
        });
        return;
      }

      try {
        console.log('Fetching data for portfolio:', selectedPortfolio);
        
        // Check if this is a Trading212 connected portfolio
        const trading212PortfolioId = localStorage.getItem('trading212_portfolio_id');
        const binancePortfolioId = localStorage.getItem('binance_portfolio_id');
        
        if (selectedPortfolio === trading212PortfolioId) {
          console.log('Loading Trading212 portfolio data');
          setPortfolioData({
            totalValue: "$3,200.00",
            todayChange: "+$45.32",
            todayPercentage: "+1.44%",
            totalReturn: "+$450.00",
            totalReturnPercentage: "+16.36%",
            holdingsCount: 3
          });
        } else if (selectedPortfolio === binancePortfolioId) {
          console.log('Loading Binance portfolio data');
          setPortfolioData({
            totalValue: "$29,000.00",
            todayChange: "+$1,250.00",
            todayPercentage: "+4.50%",
            totalReturn: "+$8,500.00",
            totalReturnPercentage: "+41.46%",
            holdingsCount: 3
          });
        } else {
          console.log('Loading default portfolio data');
          // Default mock data for other portfolios
          setPortfolioData({
            totalValue: "$254,872.65",
            todayChange: "+$1,243.32",
            todayPercentage: "+0.49%",
            totalReturn: "+$45,631.28",
            totalReturnPercentage: "+21.8%",
            holdingsCount: 15
          });
        }
      } catch (error) {
        console.error('Error fetching portfolio data:', error);
        toast({
          title: "Error",
          description: "Failed to load portfolio data",
          variant: "destructive",
        });
      }
    };

    fetchPortfolioData();
  }, [selectedPortfolio, toast]);

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-8 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle>Portfolio Summary</CardTitle>
        {portfolios.length > 0 && (
          <div className="mt-2">
            <PortfolioSelector
              portfolios={portfolios}
              value={selectedPortfolio}
              onValueChange={setSelectedPortfolio}
              placeholder="Select portfolio"
            />
          </div>
        )}
      </CardHeader>
      <CardContent>
        {portfolios.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <p>No portfolios found.</p>
            <p className="text-sm mt-1">Create your first portfolio to get started.</p>
          </div>
        ) : selectedPortfolio ? (
          <div className="grid grid-cols-1 gap-4">
            <StatCard 
              label="Total Value" 
              value={portfolioData.totalValue}
              change={{ 
                value: portfolioData.todayChange, 
                percentage: portfolioData.todayPercentage, 
                isPositive: portfolioData.todayChange.includes('+')
              }} 
            />
            <StatCard 
              label="Today's Change" 
              value={portfolioData.todayChange}
              change={{ 
                value: portfolioData.todayChange, 
                percentage: portfolioData.todayPercentage, 
                isPositive: portfolioData.todayChange.includes('+')
              }} 
            />
            <StatCard 
              label="Total Return" 
              value={portfolioData.totalReturn}
              change={{ 
                value: portfolioData.totalReturn, 
                percentage: portfolioData.totalReturnPercentage, 
                isPositive: portfolioData.totalReturn.includes('+')
              }} 
            />
            <div className="text-sm text-muted-foreground mt-2">
              {portfolioData.holdingsCount} holdings
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            <p>Select a portfolio to view data</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PortfolioSummary;
