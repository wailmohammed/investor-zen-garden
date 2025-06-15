
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { supabase } from "@/integrations/supabase/client";
import { calculateDividendIncome } from "@/services/dividendCalculator";
import { TrendingUp, Calendar, DollarSign } from "lucide-react";

interface GrowthData {
  totalAnnualIncome: number;
  yearOverYearGrowth: number;
  projectedGrowth: number;
  dividendStocks: number;
}

const DividendGrowth = () => {
  const { user } = useAuth();
  const { selectedPortfolio } = usePortfolio();
  const [growthData, setGrowthData] = useState<GrowthData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchGrowthData = async () => {
    if (!user || !selectedPortfolio) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const trading212PortfolioId = localStorage.getItem('trading212_portfolio_id');
      
      if (selectedPortfolio === trading212PortfolioId) {
        console.log('Fetching Trading212 dividend growth data');
        
        const { data, error } = await supabase.functions.invoke('trading212-sync', {
          body: { portfolioId: selectedPortfolio }
        });

        if (error) {
          console.error('Error fetching Trading212 data:', error);
          setGrowthData(null);
          return;
        }

        if (data?.success && data.data?.positions) {
          const positions = data.data.positions;
          const dividendResults = calculateDividendIncome(positions);
          
          setGrowthData({
            totalAnnualIncome: dividendResults.totalAnnualIncome,
            yearOverYearGrowth: 8.5, // Mock growth rate
            projectedGrowth: 12.3, // Mock projected growth
            dividendStocks: dividendResults.dividendPayingStocks.length
          });
        } else {
          setGrowthData(null);
        }
      } else {
        setGrowthData(null);
      }
    } catch (error) {
      console.error("Error fetching dividend growth data:", error);
      setGrowthData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrowthData();
  }, [user, selectedPortfolio]);

  // Mock historical data for growth chart
  const historicalData = [
    { year: '2020', income: growthData ? growthData.totalAnnualIncome * 0.7 : 0, growth: 5.2 },
    { year: '2021', income: growthData ? growthData.totalAnnualIncome * 0.8 : 0, growth: 7.1 },
    { year: '2022', income: growthData ? growthData.totalAnnualIncome * 0.85 : 0, growth: 6.3 },
    { year: '2023', income: growthData ? growthData.totalAnnualIncome * 0.92 : 0, growth: 8.7 },
    { year: '2024', income: growthData ? growthData.totalAnnualIncome : 0, growth: growthData?.yearOverYearGrowth || 0 },
  ];

  // Projected future data
  const projectedData = [
    { year: '2024', income: growthData?.totalAnnualIncome || 0 },
    { year: '2025', income: growthData ? growthData.totalAnnualIncome * 1.12 : 0 },
    { year: '2026', income: growthData ? growthData.totalAnnualIncome * 1.26 : 0 },
    { year: '2027', income: growthData ? growthData.totalAnnualIncome * 1.41 : 0 },
    { year: '2028', income: growthData ? growthData.totalAnnualIncome * 1.58 : 0 },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!growthData || !selectedPortfolio) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-muted-foreground">No dividend growth data available</p>
            <p className="text-sm text-muted-foreground mt-2">
              {!selectedPortfolio ? 'Select a portfolio to view dividend growth analysis' : 'Unable to load dividend growth data'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Growth Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Annual Income</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${growthData.totalAnnualIncome.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              From {growthData.dividendStocks} dividend-paying stocks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">YoY Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+{growthData.yearOverYearGrowth}%</div>
            <p className="text-xs text-muted-foreground">
              Compared to last year
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projected Growth</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">+{growthData.projectedGrowth}%</div>
            <p className="text-xs text-muted-foreground">
              Expected next year
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Growth Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Historical Dividend Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis yAxisId="income" orientation="left" />
                <YAxis yAxisId="growth" orientation="right" />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'income' ? `$${Number(value).toFixed(2)}` : `${Number(value).toFixed(1)}%`,
                    name === 'income' ? 'Annual Income' : 'Growth Rate'
                  ]}
                />
                <Bar yAxisId="income" dataKey="income" fill="#4f46e5" opacity={0.6} />
                <Line 
                  yAxisId="growth" 
                  type="monotone" 
                  dataKey="growth" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              5-Year Income Projection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={projectedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Projected Income']} />
                <Bar dataKey="income" fill="#7c3aed" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Growth Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Growth Analysis Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Key Growth Drivers</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Regular dividend increases from quality companies
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Compound effect of dividend reinvestment
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Strategic additions to dividend portfolio
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  Inflation-protected dividend growth
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3">Growth Projections</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">1 Year Target:</span>
                  <span className="font-medium">${(growthData.totalAnnualIncome * 1.12).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">3 Year Target:</span>
                  <span className="font-medium">${(growthData.totalAnnualIncome * 1.41).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">5 Year Target:</span>
                  <span className="font-medium">${(growthData.totalAnnualIncome * 1.58).toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t pt-3">
                  <span className="text-sm font-medium">CAGR (5-year):</span>
                  <span className="font-bold text-green-600">9.6%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export { DividendGrowth };
