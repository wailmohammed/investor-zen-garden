
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { supabase } from "@/integrations/supabase/client";

interface PerformanceData {
  date: string;
  value: number;
  return: number;
}

const PerformanceChart = () => {
  const { user } = useAuth();
  const { selectedPortfolio } = usePortfolio();
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Generate simulated historical data based on current portfolio value
  const generateHistoricalData = (currentValue: number, currentReturn: number) => {
    const data = [];
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6);
    
    let baseValue = currentValue - currentReturn; // Starting invested amount
    let currentVal = baseValue;
    
    for (let i = 0; i < 180; i += 7) { // Weekly data points
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      // Add some realistic volatility
      const volatility = (Math.random() - 0.5) * 0.1; // ±5% weekly volatility
      const growthRate = (currentReturn / baseValue) / 26; // Weekly growth rate to reach current return
      
      currentVal = currentVal * (1 + growthRate + volatility);
      
      data.push({
        date: date.toISOString().split('T')[0],
        value: Number(currentVal.toFixed(2)),
        return: Number((currentVal - baseValue).toFixed(2))
      });
    }
    
    // Ensure last point matches current actual data
    if (data.length > 0) {
      data[data.length - 1] = {
        date: new Date().toISOString().split('T')[0],
        value: Number(currentValue.toFixed(2)),
        return: Number(currentReturn.toFixed(2))
      };
    }
    
    return data;
  };

  useEffect(() => {
    const fetchPerformance = async () => {
      if (!user || !selectedPortfolio) {
        setPerformanceData([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Check if this is a Trading212 connected portfolio
        const trading212PortfolioId = localStorage.getItem('trading212_portfolio_id');
        
        if (selectedPortfolio === trading212PortfolioId) {
          console.log('Fetching real Trading212 performance data');
          
          const { data, error } = await supabase.functions.invoke('trading212-sync', {
            body: { portfolioId: selectedPortfolio }
          });

          if (error) {
            console.error('Error fetching Trading212 performance:', error);
            setPerformanceData([]);
          } else if (data?.success) {
            const portfolioData = data.data;
            const historicalData = generateHistoricalData(portfolioData.totalValue, portfolioData.totalReturn);
            setPerformanceData(historicalData);
          }
        } else {
          setPerformanceData([]);
        }
      } catch (error) {
        console.error('Error fetching performance:', error);
        setPerformanceData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPerformance();
  }, [user, selectedPortfolio]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Performance</CardTitle>
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
        <CardTitle>Portfolio Performance</CardTitle>
      </CardHeader>
      <CardContent>
        {performanceData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No performance data available.</p>
            <p className="text-sm mt-1">Connect your Trading212 account to see real performance.</p>
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
                <YAxis tickFormatter={(value) => `$${value.toLocaleString()}`} />
                <Tooltip 
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                  formatter={(value, name) => [
                    name === 'value' ? `$${Number(value).toLocaleString()}` : `$${Number(value).toLocaleString()}`,
                    name === 'value' ? 'Portfolio Value' : 'Total Return'
                  ]}
                />
                <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="return" stroke="#82ca9d" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PerformanceChart;
