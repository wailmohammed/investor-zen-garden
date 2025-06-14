
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { supabase } from "@/integrations/supabase/client";

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0'];

interface AllocationData {
  name: string;
  value: number;
  percentage: number;
}

const AssetAllocation = () => {
  const { user } = useAuth();
  const { selectedPortfolio } = usePortfolio();
  const [allocationData, setAllocationData] = useState<AllocationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllocation = async () => {
      if (!user || !selectedPortfolio) {
        setAllocationData([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        // Check if this is a Trading212 connected portfolio
        const trading212PortfolioId = localStorage.getItem('trading212_portfolio_id');
        
        if (selectedPortfolio === trading212PortfolioId) {
          console.log('Fetching real Trading212 allocation data');
          
          const { data, error } = await supabase.functions.invoke('trading212-sync', {
            body: { portfolioId: selectedPortfolio }
          });

          if (error) {
            console.error('Error fetching Trading212 allocation:', error);
            setError('Failed to fetch allocation data');
            setAllocationData([]);
          } else if (!data?.success) {
            console.error('Trading212 API error:', data?.error);
            setError(data?.message || 'No allocation data available');
            setAllocationData([]);
          } else if (data.data.positions && data.data.positions.length > 0) {
            const positions = data.data.positions;
            
            // Calculate total value from positions
            const totalValue = positions.reduce((sum: number, pos: any) => {
              const marketValue = pos.marketValue || (pos.quantity * pos.currentPrice);
              return sum + marketValue;
            }, 0);
            
            if (totalValue > 0) {
              const allocation = positions
                .map((position: any) => {
                  const marketValue = position.marketValue || (position.quantity * position.currentPrice);
                  return {
                    name: position.symbol,
                    value: marketValue,
                    percentage: (marketValue / totalValue) * 100
                  };
                })
                .filter((item: any) => item.value > 0)
                .sort((a: any, b: any) => b.value - a.value)
                .slice(0, 8); // Show top 8 holdings
              
              setAllocationData(allocation);
            } else {
              setError('No allocation data available');
              setAllocationData([]);
            }
          } else {
            setError('No positions found in your Trading212 account');
            setAllocationData([]);
          }
        } else {
          setError('Connect your Trading212 account to see real allocation');
          setAllocationData([]);
        }
      } catch (error) {
        console.error('Error fetching allocation:', error);
        setError('Failed to fetch allocation data');
        setAllocationData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllocation();
  }, [user, selectedPortfolio]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Asset Allocation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-64 bg-muted rounded-lg"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Asset Allocation</CardTitle>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>{error}</p>
            <p className="text-sm mt-1">Go to Broker Integration to connect your Trading212 account.</p>
          </div>
        ) : allocationData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No allocation data available.</p>
            <p className="text-sm mt-1">Connect your Trading212 account to see real allocation.</p>
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocationData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percentage }) => `${name} ${percentage.toFixed(1)}%`}
                >
                  {allocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Value']} />
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
