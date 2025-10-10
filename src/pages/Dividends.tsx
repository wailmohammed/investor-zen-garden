import React, { useState } from 'react';
import DashboardLayout from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { PortfolioProvider, usePortfolio } from "@/contexts/PortfolioContext";
import { DividendDataProvider } from "@/contexts/DividendDataContext";
import DividendManager from "@/components/Portfolio/DividendManager";
import { PortfolioSelector } from "@/components/ui/portfolio-selector";
import { useQuery } from "@tanstack/react-query";
import { getSavedDividendData } from "@/services/dividendService";
import StatCard from "@/components/StatCard";
import { BarChart3, DollarSign, TrendingUp, Shield, Calendar, PieChart, Target, Database } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DividendOverviewEnhanced } from "@/components/Dividends/DividendOverviewEnhanced";
import { DividendPerformanceTable } from "@/components/Dividends/DividendPerformanceTable";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw } from "lucide-react";

interface HoldingData {
  symbol: string;
  company: string;
  shares: number;
  avgCost: number;
  yield: number;
  annualIncome: number;
  safety: string;
}

interface DividendCalendarEvent {
  id: string;
  symbol: string;
  company: string;
  exDate: string;
  paymentDate: string;
  amount: number;
  estimatedIncome: number;
  status: 'upcoming' | 'confirmed' | 'paid';
}

const DividendContent = () => {
  const { user } = useAuth();
  const { portfolios, selectedPortfolio, setSelectedPortfolio } = usePortfolio();
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);

  // Sync Trading212 data
  const handleSyncNow = async () => {
    if (!selectedPortfolio || !user?.id) {
      toast({
        title: "Error",
        description: "Please select a portfolio first",
        variant: "destructive",
      });
      return;
    }

    setIsSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('trading212-sync', {
        body: { portfolioId: selectedPortfolio }
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Sync Complete",
          description: `Successfully synced ${data.data?.positions?.length || 0} positions from Trading212`,
        });
        // Refetch dividends after sync
        refetch();
      } else {
        throw new Error(data?.message || 'Sync failed');
      }
    } catch (error: any) {
      console.error('Sync error:', error);
      
      const isAuthError = error.message?.includes('401') || error.message?.includes('unauthorized');
      
      toast({
        title: "Sync Failed",
        description: isAuthError 
          ? "Trading212 API key is invalid or expired. Please update it in Broker Integration." 
          : error.message || "Failed to sync with Trading212.",
        variant: "destructive",
        action: isAuthError ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = '/broker-integration'}
          >
            Update API Key
          </Button>
        ) : undefined,
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Fetch dividends from database for selected portfolio
  const { data: dividends = [], isLoading, refetch } = useQuery({
    queryKey: ['saved-dividends', user?.id, selectedPortfolio],
    queryFn: async () => {
      if (!user?.id || !selectedPortfolio) return [];
      
      console.log('Fetching saved dividend data for portfolio:', selectedPortfolio);
      const data = await getSavedDividendData(user.id, selectedPortfolio);
      console.log('Fetched dividend data:', data?.length || 0, 'records');
      return data || [];
    },
    enabled: !!user?.id && !!selectedPortfolio,
  });

  // Calculate dividend statistics from database data
  const stats = React.useMemo(() => {
    if (!dividends.length) {
      return {
        annualIncome: 0,
        monthlyAverage: 0,
        portfolioYield: 0,
        safetyScore: 0,
        totalStocks: 0
      };
    }

    const annualIncome = dividends.reduce((sum, d) => sum + (d.estimated_annual_income || 0), 0);
    const monthlyAverage = annualIncome / 12;
    const averageYield = dividends.reduce((sum, d) => sum + (d.dividend_yield || 0), 0) / dividends.length;
    
    return {
      annualIncome,
      monthlyAverage,
      portfolioYield: averageYield,
      safetyScore: 92, // Default safety score
      totalStocks: dividends.length
    };
  }, [dividends]);

  // Group dividends by stock for holdings view
  const holdingsData: HoldingData[] = React.useMemo(() => {
    return dividends.map(dividend => ({
      symbol: dividend.symbol,
      company: dividend.company_name || dividend.symbol,
      shares: dividend.shares_owned || 0,
      avgCost: 0, // Not available in current data
      yield: dividend.dividend_yield || 0,
      annualIncome: dividend.estimated_annual_income || 0,
      safety: 'High' // Default safety rating
    }));
  }, [dividends]);

  // Mock calendar data for demonstration
  const calendarEvents: DividendCalendarEvent[] = [
    {
      id: "1",
      symbol: "AAPL",
      company: "Apple Inc.",
      exDate: "2025-05-09",
      paymentDate: "2025-05-16",
      amount: 0.24,
      estimatedIncome: 12.00,
      status: "upcoming"
    },
    {
      id: "2",
      symbol: "MSFT",
      company: "Microsoft Corporation",
      exDate: "2025-05-15",
      paymentDate: "2025-06-13",
      amount: 0.75,
      estimatedIncome: 37.50,
      status: "upcoming"
    },
    {
      id: "3",
      symbol: "JNJ",
      company: "Johnson & Johnson",
      exDate: "2025-05-22",
      paymentDate: "2025-06-10",
      amount: 1.19,
      estimatedIncome: 59.50,
      status: "confirmed"
    }
  ];

  if (!selectedPortfolio && portfolios.length > 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">💰 Database Dividend Tracker</h1>
            <p className="text-muted-foreground">Track, analyze and forecast your dividend income from saved database data</p>
          </div>
        </div>
        
        <Card className="border-dashed border-2 border-blue-200">
          <CardContent className="flex flex-col items-center justify-center h-48 space-y-4">
            <div className="text-6xl">📊</div>
            <p className="text-lg font-medium">Select a portfolio to view dividend data</p>
            <p className="text-sm text-muted-foreground">Choose from your connected portfolios below</p>
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
          <h1 className="text-3xl font-bold flex items-center gap-2">
            💾 Database Dividend Tracker
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Database className="h-3 w-3 mr-1" />
              Database-Powered
            </Badge>
          </h1>
          <p className="text-muted-foreground">Track, analyze and forecast your dividend income from persistent database storage</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="default" 
            className="flex items-center gap-2"
            onClick={handleSyncNow}
            disabled={isSyncing || !selectedPortfolio}
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Export Report
          </Button>
        </div>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Annual Income"
          value={`$${stats.annualIncome.toFixed(0)}`}
          change={{
            value: stats.annualIncome > 0 ? "+Database" : "No data",
            percentage: stats.totalStocks > 0 ? `${stats.totalStocks} stocks` : "0 stocks",
            isPositive: stats.annualIncome > 0
          }}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatCard
          label="Monthly Average"
          value={`$${stats.monthlyAverage.toFixed(0)}`}
          change={{
            value: "From database",
            percentage: "Calculated",
            isPositive: stats.monthlyAverage > 0
          }}
          icon={<BarChart3 className="h-5 w-5" />}
        />
        <StatCard
          label="Portfolio Yield"
          value={`${stats.portfolioYield.toFixed(1)}%`}
          change={{
            value: "Database avg",
            percentage: "Live calc",
            isPositive: stats.portfolioYield > 0
          }}
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatCard
          label="Database Records"
          value={`${stats.totalStocks}`}
          change={{
            value: "Saved stocks",
            percentage: "Persistent",
            isPositive: stats.totalStocks > 0
          }}
          icon={<Database className="h-5 w-5" />}
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">📊 Overview</TabsTrigger>
          <TabsTrigger value="holdings">💼 Holdings</TabsTrigger>
          <TabsTrigger value="analysis">📈 Analysis</TabsTrigger>
          <TabsTrigger value="calendar">📅 Calendar</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <DividendOverviewEnhanced />
        </TabsContent>
        
        <TabsContent value="holdings" className="space-y-4">
          <DividendPerformanceTable />
        </TabsContent>
        
        <TabsContent value="analysis" className="space-y-4">
          <div className="grid gap-6">
            {/* Dividend Growth Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Dividend Growth Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Growth Metrics</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">5-Year CAGR</span>
                        <span className="font-medium text-green-600">+8.2%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">3-Year CAGR</span>
                        <span className="font-medium text-green-600">+12.1%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">1-Year Growth</span>
                        <span className="font-medium text-green-600">+15.3%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Dividend Consistency</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Dividend Aristocrats</span>
                          <span>3 stocks</span>
                        </div>
                        <Progress value={25} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Consistent Growers</span>
                          <span>8 stocks</span>
                        </div>
                        <Progress value={67} className="h-2" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Risk Assessment</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Low Risk</span>
                          <span>70%</span>
                        </div>
                        <Progress value={70} className="h-2 bg-green-100" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Medium Risk</span>
                          <span>25%</span>
                        </div>
                        <Progress value={25} className="h-2 bg-yellow-100" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>High Risk</span>
                          <span>5%</span>
                        </div>
                        <Progress value={5} className="h-2 bg-red-100" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sector Allocation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Dividend by Sector
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { sector: "Technology", percentage: 35, income: "$997.68", color: "bg-blue-500" },
                    { sector: "Healthcare", percentage: 22, income: "$626.88", color: "bg-green-500" },
                    { sector: "Financial", percentage: 18, income: "$512.58", color: "bg-yellow-500" },
                    { sector: "Consumer", percentage: 25, income: "$710.51", color: "bg-purple-500" }
                  ].map((item) => (
                    <div key={item.sector} className="text-center space-y-2">
                      <div className={`w-16 h-16 ${item.color} rounded-full mx-auto flex items-center justify-center text-white font-bold`}>
                        {item.percentage}%
                      </div>
                      <div>
                        <p className="font-medium">{item.sector}</p>
                        <p className="text-sm text-muted-foreground">{item.income}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Dividend Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Calendar Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-blue-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">7</div>
                    <p className="text-sm text-muted-foreground">This Month</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">$234.56</div>
                    <p className="text-sm text-muted-foreground">Expected Income</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">12</div>
                    <p className="text-sm text-muted-foreground">Next Month</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">$387.92</div>
                    <p className="text-sm text-muted-foreground">Next Month Income</p>
                  </div>
                </div>

                {/* Calendar Events Table */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Company</TableHead>
                        <TableHead>Ex-Date</TableHead>
                        <TableHead>Pay Date</TableHead>
                        <TableHead>Amount/Share</TableHead>
                        <TableHead>Est. Income</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {calendarEvents.map((event) => (
                        <TableRow key={event.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{event.symbol}</div>
                              <div className="text-sm text-muted-foreground">{event.company}</div>
                            </div>
                          </TableCell>
                          <TableCell>{new Date(event.exDate).toLocaleDateString()}</TableCell>
                          <TableCell>{new Date(event.paymentDate).toLocaleDateString()}</TableCell>
                          <TableCell>${event.amount.toFixed(2)}</TableCell>
                          <TableCell className="font-medium text-green-600">
                            ${event.estimatedIncome.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={event.status === 'paid' ? 'default' : 
                                      event.status === 'confirmed' ? 'secondary' : 'outline'}
                              className={
                                event.status === 'paid' ? 'bg-green-100 text-green-800' :
                                event.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                                'bg-yellow-100 text-yellow-800'
                              }
                            >
                              {event.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
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
      <DividendDataProvider>
        <DashboardLayout>
          <DividendContent />
        </DashboardLayout>
      </DividendDataProvider>
    </PortfolioProvider>
  );
};

export default Dividends;
