import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { supabase } from "@/integrations/supabase/client";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

interface AllocationData {
  name: string;
  value: number;
  amount: string;
}

const AssetAllocation = () => {
  const { user } = useAuth();
  const { selectedPortfolio, portfolios } = usePortfolio();
  const [allocationData, setAllocationData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Get current portfolio type
  const currentPortfolio = portfolios.find(p => p.id === selectedPortfolio);
  const portfolioType = currentPortfolio?.portfolio_type || 'stock';

  useEffect(() => {
    const fetchAllocationData = async () => {
      if (!selectedPortfolio) {
        setAllocationData([]);
        return;
      }

      const trading212PortfolioId = localStorage.getItem('trading212_portfolio_id');
      const binancePortfolioId = localStorage.getItem('binance_portfolio_id');

      if (selectedPortfolio === trading212PortfolioId) {
        // Trading212 allocation - keep existing logic
        setAllocationData([]);
      } else if (selectedPortfolio === binancePortfolioId) {
        // Binance crypto allocation
        setAllocationData([
          { name: 'Bitcoin', value: 45, amount: '$29,000' },
          { name: 'Ethereum', value: 30, amount: '$15,000' },
          { name: 'Cardano', value: 25, amount: '$5,000' }
        ]);
      } else if (portfolioType === 'crypto') {
        // Fetch real crypto allocation from API
        try {
          setIsLoading(true);
          const { data, error } = await supabase.functions.invoke('crypto-api', {
            body: { portfolioId: selectedPortfolio }
          });

          if (error) throw error;

          if (data?.success && data.data?.holdings) {
            const totalValue = data.data.totalValue;
            const formattedAllocation = data.data.holdings.map((holding: any) => ({
              name: holding.name || holding.symbol,
              value: Number(((holding.value / totalValue) * 100).toFixed(1)),
              amount: `$${holding.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            }));
            setAllocationData(formattedAllocation);
          }
        } catch (error) {
          console.error('Error fetching crypto allocation:', error);
          setAllocationData([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        // Stock portfolio allocation
        setAllocationData([
          { name: 'Technology', value: 35, amount: '$89,180' },
          { name: 'Healthcare', value: 20, amount: '$50,974' },
          { name: 'Finance', value: 15, amount: '$38,231' },
          { name: 'Consumer', value: 20, amount: '$50,974' },
          { name: 'Energy', value: 10, amount: '$25,487' }
        ]);
      }
    };

    fetchAllocationData();
  }, [selectedPortfolio, portfolioType]);

  if (!selectedPortfolio) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle>Asset Allocation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-4">
            Select a portfolio to view allocation
          </p>
        </CardContent>
      </Card>
    );
  }

  const trading212PortfolioId = localStorage.getItem('trading212_portfolio_id');
  const isTrading212 = selectedPortfolio === trading212PortfolioId;

  if (isTrading212 && allocationData.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle>Asset Allocation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-4">
              No allocation data available.
            </p>
            <Button asChild>
              <a href="/broker-integration" className="inline-flex items-center gap-2">
                Go to Broker Integration to connect your Trading212 account.
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle>Asset Allocation</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4 text-muted-foreground">
            Loading allocation data...
          </div>
        ) : allocationData.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No allocation data available
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {allocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any, name: any, props: any) => [
                    `${value}% (${props.payload.amount})`, 
                    name
                  ]} 
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AssetAllocation;
