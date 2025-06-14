
import React, { useState } from 'react';
import DashboardLayout from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { PortfolioProvider, usePortfolio } from "@/contexts/PortfolioContext";
import DividendManager from "@/components/Portfolio/DividendManager";
import { PortfolioSelector } from "@/components/ui/portfolio-selector";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import StatCard from "@/components/StatCard";
import { BarChart3, DollarSign, TrendingUp, Shield } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const DividendContent = () => {
  const { user } = useAuth();
  const { portfolios, selectedPortfolio, setSelectedPortfolio } = usePortfolio();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch dividends for selected portfolio
  const { data: dividends = [], isLoading } = useQuery({
    queryKey: ['dividends', user?.id, selectedPortfolio],
    queryFn: async () => {
      if (!user?.id || !selectedPortfolio) return [];
      
      const { data, error } = await supabase
        .from('dividends')
        .select('*')
        .eq('user_id', user.id)
        .eq('portfolio_id', selectedPortfolio)
        .order('payment_date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id && !!selectedPortfolio,
  });

  // Calculate dividend statistics
  const stats = React.useMemo(() => {
    if (!dividends.length) {
      return {
        annualIncome: 0,
        monthlyAverage: 0,
        portfolioYield: 0,
        safetyScore: 0
      };
    }

    const currentYear = new Date().getFullYear();
    const currentYearDividends = dividends.filter(d => 
      new Date(d.payment_date).getFullYear() === currentYear
    );
    
    const annualIncome = currentYearDividends.reduce((sum, d) => sum + d.total_received, 0);
    const monthlyAverage = annualIncome / 12;
    
    return {
      annualIncome,
      monthlyAverage,
      portfolioYield: 3.1, // This would be calculated based on portfolio value
      safetyScore: 92 // This would be calculated based on dividend safety metrics
    };
  }, [dividends]);

  // Group dividends by stock for holdings view
  const holdingsData = React.useMemo(() => {
    const grouped = dividends.reduce((acc, dividend) => {
      const key = dividend.symbol;
      if (!acc[key]) {
        acc[key] = {
          symbol: dividend.symbol,
          company: dividend.company_name || dividend.symbol,
          shares: dividend.shares_owned || 0,
          avgCost: 0, // Would need to be calculated from holdings data
          yield: 0, // Would need to be calculated
          annualIncome: 0,
          safety: 'High'
        };
      }
      
      // Sum up annual income for this stock
      const currentYear = new Date().getFullYear();
      if (new Date(dividend.payment_date).getFullYear() === currentYear) {
        acc[key].annualIncome += dividend.total_received;
      }
      
      return acc;
    }, {} as Record<string, any>);
    
    return Object.values(grouped);
  }, [dividends]);

  if (!selectedPortfolio && portfolios.length > 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Dividend Tracker</h1>
            <p className="text-muted-foreground">Track, analyze and forecast your dividend income</p>
          </div>
        </div>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-48">
            <p className="text-muted-foreground mb-4">Select a portfolio to view dividend data</p>
            <PortfolioSelector
              portfolios={portfolios}
              value=""
              onValueChange={setSelectedPortfolio}
              label=""
              placeholder="Choose a portfolio"
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dividend Tracker</h1>
          <p className="text-muted-foreground">Track, analyze and forecast your dividend income</p>
        </div>
        <Button variant="outline">
          Dividend Stats
        </Button>
      </div>

      {/* Portfolio Selection */}
      <div className="max-w-md">
        <PortfolioSelector
          portfolios={portfolios}
          value={selectedPortfolio}
          onValueChange={setSelectedPortfolio}
          label="Portfolio"
          placeholder="Select portfolio"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Annual Income"
          value={`$${stats.annualIncome.toFixed(0)}`}
          change={{
            value: "+7.2%",
            percentage: "+7.2%",
            isPositive: true
          }}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatCard
          label="Monthly Average"
          value={`$${stats.monthlyAverage.toFixed(0)}`}
          change={{
            value: "+7.2%",
            percentage: "+7.2%",
            isPositive: true
          }}
          icon={<BarChart3 className="h-5 w-5" />}
        />
        <StatCard
          label="Portfolio Yield"
          value={`${stats.portfolioYield.toFixed(1)}%`}
          change={{
            value: "+0.3%",
            percentage: "+0.3%",
            isPositive: true
          }}
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatCard
          label="Safety Score"
          value={`${stats.safetyScore}`}
          change={{
            value: "+2",
            percentage: "+2",
            isPositive: true
          }}
          icon={<Shield className="h-5 w-5" />}
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="holdings">Holdings</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <DividendManager />
        </TabsContent>
        
        <TabsContent value="holdings" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Dividend Holdings</CardTitle>
              <Button variant="outline">Import Holdings</Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading holdings...</div>
              ) : holdingsData.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Stock</TableHead>
                        <TableHead>Shares</TableHead>
                        <TableHead>Avg Cost</TableHead>
                        <TableHead>Yield</TableHead>
                        <TableHead>Annual Income</TableHead>
                        <TableHead>Safety</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {holdingsData.map((holding) => (
                        <TableRow key={holding.symbol}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{holding.symbol}</div>
                              <div className="text-sm text-muted-foreground">{holding.company}</div>
                            </div>
                          </TableCell>
                          <TableCell>{holding.shares.toFixed(2)}</TableCell>
                          <TableCell>${holding.avgCost.toFixed(2)}</TableCell>
                          <TableCell>{holding.yield.toFixed(2)}%</TableCell>
                          <TableCell>${holding.annualIncome.toFixed(2)}</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {holding.safety}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No dividend holdings found. Add some dividend-paying stocks to your portfolio.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dividend Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Dividend analysis charts and insights will be displayed here.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dividend Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Upcoming dividend payment calendar will be displayed here.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const Dividends = () => {
  return (
    <PortfolioProvider>
      <DashboardLayout>
        <DividendContent />
      </DashboardLayout>
    </PortfolioProvider>
  );
};

export default Dividends;
