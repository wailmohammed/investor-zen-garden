
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Database } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { supabase } from "@/integrations/supabase/client";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

interface AllocationData {
  name: string;
  value: number;
  percentage: number;
}

const AssetAllocation = () => {
  const { user } = useAuth();
  const { selectedPortfolio } = usePortfolio();
  const [allocationData, setAllocationData] = useState<AllocationData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllocationData = async () => {
      if (!user?.id || !selectedPortfolio) {
        setLoading(false);
        return;
      }

      try {
        console.log('Loading asset allocation from database');
        setLoading(true);

        const { data, error } = await supabase
          .from('portfolio_positions')
          .select('symbol, market_value')
          .eq('user_id', user.id)
          .eq('portfolio_id', selectedPortfolio)
          .gt('market_value', 0);

        if (error) {
          console.error('Error fetching allocation data:', error);
          setAllocationData([]);
        } else if (data && data.length > 0) {
          const totalValue = data.reduce((sum, item) => sum + item.market_value, 0);
          
          // Group by first letter or sector (simplified)
          const groupedData = data.reduce((acc: { [key: string]: number }, item) => {
            const group = item.symbol.charAt(0); // Simple grouping by first letter
            acc[group] = (acc[group] || 0) + item.market_value;
            return acc;
          }, {});

          const allocation = Object.entries(groupedData)
            .map(([name, value]) => ({
              name: `Group ${name}`,
              value,
              percentage: (value / totalValue) * 100
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5); // Top 5 groups

          setAllocationData(allocation);
          console.log(`Calculated allocation for ${data.length} positions`);
        } else {
          setAllocationData([]);
        }

      } catch (error) {
        console.error('Error loading allocation data:', error);
        setAllocationData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllocationData();
  }, [user?.id, selectedPortfolio]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Asset Allocation
            <Badge variant="secondary">Loading...</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] animate-pulse bg-muted rounded"></div>
        </CardContent>
      </Card>
    );
  }

  if (!selectedPortfolio) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Asset Allocation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Select a portfolio to view allocation</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Asset Allocation
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <Database className="h-3 w-3 mr-1" />
            Database
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {allocationData.length > 0 ? (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {allocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [
                    `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                    'Value'
                  ]}
                />
                <Legend 
                  formatter={(value, entry: any) => 
                    `${value}: ${entry.payload.percentage.toFixed(1)}%`
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-8">
            <Database className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">No allocation data in database</p>
            <p className="text-sm text-muted-foreground mt-1">
              Sync your portfolio data to see asset allocation
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AssetAllocation;
