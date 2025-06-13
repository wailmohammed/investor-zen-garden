
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatCard from "../StatCard";
import { PortfolioSelector } from "@/components/ui/portfolio-selector";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Portfolio {
  id: string;
  name: string;
  description?: string;
  is_default: boolean;
}

const PortfolioSummary = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<string>('');
  const [portfolioData, setPortfolioData] = useState({
    totalValue: "$0.00",
    todayChange: "$0.00",
    todayPercentage: "0%",
    totalReturn: "$0.00",
    totalReturnPercentage: "0%"
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user's portfolios
  useEffect(() => {
    const fetchPortfolios = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from('portfolios')
          .select('*')
          .eq('user_id', user.id)
          .order('is_default', { ascending: false });

        if (error) throw error;

        setPortfolios(data || []);
        
        // Set default portfolio if available
        const defaultPortfolio = data?.find(p => p.is_default);
        if (defaultPortfolio) {
          setSelectedPortfolio(defaultPortfolio.id);
        } else if (data && data.length > 0) {
          setSelectedPortfolio(data[0].id);
        }
      } catch (error: any) {
        console.error('Error fetching portfolios:', error);
        toast({
          title: "Error",
          description: "Failed to load portfolios.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPortfolios();
  }, [user?.id, toast]);

  // Simulate portfolio data based on selected portfolio
  useEffect(() => {
    if (selectedPortfolio) {
      // In a real app, this would fetch actual portfolio holdings and calculate values
      setPortfolioData({
        totalValue: "$254,872.65",
        todayChange: "$1,243.32",
        todayPercentage: "+0.49%",
        totalReturn: "$45,631.28",
        totalReturnPercentage: "+21.8%"
      });
    }
  }, [selectedPortfolio]);

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
        ) : (
          <div className="grid grid-cols-1 gap-4">
            <StatCard 
              label="Total Value" 
              value={portfolioData.totalValue}
              change={{ 
                value: portfolioData.todayChange, 
                percentage: portfolioData.todayPercentage, 
                isPositive: true 
              }} 
            />
            <StatCard 
              label="Today's Change" 
              value={portfolioData.todayChange}
              change={{ 
                value: portfolioData.todayChange, 
                percentage: portfolioData.todayPercentage, 
                isPositive: true 
              }} 
            />
            <StatCard 
              label="Total Return" 
              value={portfolioData.totalReturn}
              change={{ 
                value: portfolioData.totalReturn, 
                percentage: portfolioData.totalReturnPercentage, 
                isPositive: true 
              }} 
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PortfolioSummary;
