
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getUpcomingDividends, getDividendPortfolio } from "@/services/dividendService";
import { useAuth } from "@/contexts/AuthContext";
import { Dividend, DividendPortfolio } from "@/models/dividend";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import StatCard from "../StatCard";
import { Shield, Calendar, TrendingUp, Percent } from "lucide-react";

const DividendTracking = () => {
  const { user } = useAuth();
  const [upcomingDividends, setUpcomingDividends] = useState<Dividend[]>([]);
  const [portfolio, setPortfolio] = useState<DividendPortfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      setLoading(true);
      try {
        const [dividends, portfolioData] = await Promise.all([
          getUpcomingDividends(user.id),
          getDividendPortfolio(user.id)
        ]);

        setUpcomingDividends(dividends);
        setPortfolio(portfolioData);
      } catch (error) {
        console.error("Error fetching dividend data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Prepare monthly income data for the chart
  const monthlyData = [
    { month: "Jan", income: 262.41 },
    { month: "Feb", income: 218.76 },
    { month: "Mar", income: 304.25 },
    { month: "Apr", income: 245.32 },
    { month: "May", income: 295.14 },
    { month: "Jun", income: 324.53 },
    { month: "Jul", income: 274.82 },
    { month: "Aug", income: 231.45 },
    { month: "Sep", income: 291.67 },
    { month: "Oct", income: 259.38 },
    { month: "Nov", income: 268.21 },
    { month: "Dec", income: 273.92 }
  ];

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dividend Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-48">
            <p>Loading dividend data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle>Dividend Tracking</CardTitle>
      </CardHeader>
      <CardContent>
        {portfolio && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {portfolio.metrics.map((metric, index) => (
                <StatCard 
                  key={index}
                  label={metric.name} 
                  value={metric.value.toString()} 
                  change={{
                    value: metric.changeValue?.toString() || "",
                    percentage: metric.changePercent?.toString() + "%" || "",
                    isPositive: metric.isPositive || false
                  }}
                />
              ))}
            </div>

            <Tabs 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="space-y-4"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="monthly">Monthly Income</TabsTrigger>
                <TabsTrigger value="safety">Dividend Safety</TabsTrigger>
              </TabsList>
              
              <TabsContent value="upcoming" className="space-y-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Company</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Ex-Date</TableHead>
                        <TableHead>Payment Date</TableHead>
                        <TableHead>Yield</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {upcomingDividends.map((dividend) => (
                        <TableRow key={dividend.id}>
                          <TableCell>
                            <div className="font-medium">{dividend.symbol}</div>
                            <div className="text-xs text-muted-foreground">{dividend.company}</div>
                          </TableCell>
                          <TableCell>${dividend.amount.toFixed(4)}</TableCell>
                          <TableCell>{new Date(dividend.exDate).toLocaleDateString()}</TableCell>
                          <TableCell>{new Date(dividend.paymentDate).toLocaleDateString()}</TableCell>
                          <TableCell>{dividend.yield.toFixed(2)}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              
              <TabsContent value="monthly" className="space-y-4">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, 'Dividend Income']} />
                    <Bar dataKey="income" fill="#4f46e5" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="text-center text-sm text-muted-foreground">
                  Projected annual dividend income: ${portfolio.annualIncome.toFixed(2)}
                </div>
              </TabsContent>
              
              <TabsContent value="safety" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-muted rounded-lg p-4 flex flex-col items-center">
                    <Shield className="h-8 w-8 mb-2 text-finance-blue" />
                    <div className="text-xs uppercase text-muted-foreground">Safety Score</div>
                    <div className="text-2xl font-bold mt-1">92%</div>
                  </div>
                  <div className="bg-muted rounded-lg p-4 flex flex-col items-center">
                    <Calendar className="h-8 w-8 mb-2 text-finance-blue" />
                    <div className="text-xs uppercase text-muted-foreground">Consecutive Raises</div>
                    <div className="text-2xl font-bold mt-1">14 yrs</div>
                  </div>
                  <div className="bg-muted rounded-lg p-4 flex flex-col items-center">
                    <TrendingUp className="h-8 w-8 mb-2 text-finance-blue" />
                    <div className="text-xs uppercase text-muted-foreground">5yr CAGR</div>
                    <div className="text-2xl font-bold mt-1">7.2%</div>
                  </div>
                  <div className="bg-muted rounded-lg p-4 flex flex-col items-center">
                    <Percent className="h-8 w-8 mb-2 text-finance-blue" />
                    <div className="text-xs uppercase text-muted-foreground">Payout Ratio</div>
                    <div className="text-2xl font-bold mt-1">42.5%</div>
                  </div>
                </div>
                <div className="text-sm text-center text-muted-foreground mt-4">
                  Your dividend portfolio has an average safety score of 92/100, indicating reliable income streams.
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
        {!portfolio && (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <p className="text-muted-foreground mb-4">No dividend data available</p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
              Import Dividend Data
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DividendTracking;
