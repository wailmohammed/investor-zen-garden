
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

  useEffect(() => {
    const fetchAllocation = async () => {
      if (!user || !selectedPortfolio) {
        setAllocationData([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Check if this is a Trading212 connected portfolio
        const trading212PortfolioId = localStorage.getItem('trading212_portfolio_id');
        
        if (selectedPortfolio === trading212PortfolioId) {
          console.log('Fetching real Trading212 allocation data');
          
          const { data, error } = await supabase.functions.invoke('trading212-sync', {
            body: { portfolioId: selectedPortfolio }
          });

          if (error) {
            console.error('Error fetching Trading212 allocation:', error);
            setAllocationData([]);
          } else if (data?.success && data.data.positions) {
            const positions = data.data.positions;
            const totalValue = positions.reduce((sum: number, pos: any) => sum + pos.marketValue, 0);
            
            if (totalValue > 0) {
              const allocation = positions.map((position: any) => ({
                name: position.symbol,
                value: position.marketValue,
                percentage: (position.marketValue / totalValue) * 100
              })).sort((a: any, b: any) => b.value - a.value);
              
              setAllocationData(allocation);
            } else {
              setAllocationData([]);
            }
          }
        } else {
          setAllocationData([]);
        }
      } catch (error) {
        console.error('Error fetching allocation:', error);
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
        {allocationData.length === 0 ? (
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
