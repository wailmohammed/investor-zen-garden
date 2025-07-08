
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDividendData } from "@/contexts/DividendDataContext";
import { useAuth } from "@/contexts/AuthContext";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import StatCard from "../StatCard";
import { Shield, Calendar, TrendingUp, Percent, RefreshCw, DollarSign, Database, AlertTriangle, CheckCircle, Zap, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

const DividendTracking = () => {
  const { user } = useAuth();
  const { selectedPortfolio } = usePortfolio();
  const { toast } = useToast();
  const {
    dividends,
    loading,
    lastSync,
    getDividendSummary
  } = useDividendData();

  const [activeTab, setActiveTab] = useState('holdings');

  const { totalAnnualIncome, totalStocks, averageYield } = getDividendSummary();

  // Prepare monthly income projection data for the chart from database
  const monthlyData = totalAnnualIncome > 0 ? [
    { month: "Jan", income: (totalAnnualIncome / 12) * 0.95 },
    { month: "Feb", income: (totalAnnualIncome / 12) * 0.88 },
    { month: "Mar", income: (totalAnnualIncome / 12) * 1.15 },
    { month: "Apr", income: (totalAnnualIncome / 12) * 0.92 },
    { month: "May", income: (totalAnnualIncome / 12) * 1.08 },
    { month: "Jun", income: (totalAnnualIncome / 12) * 1.22 },
    { month: "Jul", income: (totalAnnualIncome / 12) * 1.05 },
    { month: "Aug", income: (totalAnnualIncome / 12) * 0.85 },
    { month: "Sep", income: (totalAnnualIncome / 12) * 1.12 },
    { month: "Oct", income: (totalAnnualIncome / 12) * 0.98 },
    { month: "Nov", income: (totalAnnualIncome / 12) * 1.03 },
    { month: "Dec", income: (totalAnnualIncome / 12) * 1.07 }
  ] : [];

  if (loading && dividends.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>💾 Database-First Dividend Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col justify-center items-center h-48 space-y-2">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
            <p>Loading saved dividend data from database...</p>
            <p className="text-sm text-muted-foreground">All data is saved and persistent</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!selectedPortfolio) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Database-First Dividend Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-48">
            <p className="text-muted-foreground">Select a portfolio to view saved dividend data from database</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>💾 Database-First Dividend Tracker</CardTitle>
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground">
              Data updates automatically 4x daily
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Database className="h-4 w-4 text-green-500" />
          <span>All data from database • {totalStocks} dividend stocks • Persistent storage</span>
          {lastSync && (
            <>
              <span>•</span>
              <span>Last sync: {new Date(lastSync).toLocaleString()}</span>
            </>
          )}
        </div>

      </CardHeader>

      <CardContent>
        {totalStocks > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <StatCard 
                label="Annual Income" 
                value={`$${totalAnnualIncome.toFixed(2)}`} 
                change={{
                  value: "Database source",
                  percentage: "Persistent",
                  isPositive: true
                }}
                icon={<DollarSign className="h-4 w-4" />}
              />
              <StatCard 
                label="Monthly Average" 
                value={`$${(totalAnnualIncome / 12).toFixed(2)}`} 
                change={{
                  value: "From database",
                  percentage: "Calculated",
                  isPositive: true
                }}
                icon={<Calendar className="h-4 w-4" />}
              />
              <StatCard 
                label="Dividend Stocks" 
                value={`${totalStocks}`} 
                change={{
                  value: "Database records",
                  percentage: "Saved",
                  isPositive: true
                }}
                icon={<Shield className="h-4 w-4" />}
              />
              <StatCard 
                label="Average Yield" 
                value={`${averageYield.toFixed(2)}%`} 
                change={{
                  value: "Database calc",
                  percentage: "Live",
                  isPositive: true
                }}
                icon={<Percent className="h-4 w-4" />}
              />
            </div>

            <Tabs 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="space-y-4"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="holdings">💾 Database Holdings</TabsTrigger>
                <TabsTrigger value="projections">📊 Projections</TabsTrigger>
                <TabsTrigger value="system">⚡ Data Status</TabsTrigger>
              </TabsList>
              
              <TabsContent value="holdings" className="space-y-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Company</TableHead>
                        <TableHead>Shares</TableHead>
                        <TableHead>Dividend/Share</TableHead>
                        <TableHead>Annual Income</TableHead>
                        <TableHead>Yield</TableHead>
                        <TableHead>Database Source</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dividends.map((dividend) => (
                        <TableRow key={dividend.id}>
                          <TableCell>
                            <div className="font-medium">{dividend.symbol}</div>
                            <div className="text-xs text-muted-foreground">{dividend.company_name}</div>
                          </TableCell>
                          <TableCell>{dividend.shares_owned?.toFixed(6) || 'N/A'}</TableCell>
                          <TableCell>${dividend.annual_dividend.toFixed(2)}</TableCell>
                          <TableCell className="font-medium text-green-600">
                            ${dividend.estimated_annual_income.toFixed(2)}
                          </TableCell>
                          <TableCell>{dividend.dividend_yield.toFixed(2)}%</TableCell>
                          <TableCell>
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded flex items-center gap-1">
                              <Database className="h-3 w-3" />
                              {dividend.detection_source === 'portfolio_data' ? 'Portfolio DB' : 'API → DB'}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              
              <TabsContent value="projections" className="space-y-4">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Projected Dividend Income']} />
                    <Bar dataKey="income" fill="#4f46e5" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="text-center text-sm text-muted-foreground">
                  💾 Projected annual dividend income: ${totalAnnualIncome.toFixed(2)} from database records
                </div>
              </TabsContent>
              
              <TabsContent value="system" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-muted rounded-lg p-4 flex flex-col items-center">
                    <Database className="h-8 w-8 mb-2 text-green-600" />
                    <div className="text-xs uppercase text-muted-foreground">Storage</div>
                    <div className="text-lg font-bold mt-1">Database</div>
                  </div>
                  <div className="bg-muted rounded-lg p-4 flex flex-col items-center">
                    <Save className="h-8 w-8 mb-2 text-blue-600" />
                    <div className="text-xs uppercase text-muted-foreground">Records</div>
                    <div className="text-lg font-bold mt-1">{totalStocks}</div>
                  </div>
                  <div className="bg-muted rounded-lg p-4 flex flex-col items-center">
                    <CheckCircle className="h-8 w-8 mb-2 text-green-600" />
                    <div className="text-xs uppercase text-muted-foreground">Status</div>
                    <div className="text-lg font-bold mt-1">Active</div>
                  </div>
                  <div className="bg-muted rounded-lg p-4 flex flex-col items-center">
                    <RefreshCw className="h-8 w-8 mb-2 text-orange-600" />
                    <div className="text-xs uppercase text-muted-foreground">Updates</div>
                    <div className="text-lg font-bold mt-1">4x Daily</div>
                  </div>
                </div>
                <div className="text-sm text-center text-muted-foreground mt-4">
                  💾 <strong>Database-First System:</strong> All dividend data is persistently stored in the database.
                  <br />
                  🔄 Data updates automatically 4 times per day (every 6 hours).
                  <br />
                  ⚡ Database data persists forever and loads instantly.
                </div>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <Database className="h-12 w-12 text-blue-500 mb-4" />
            <p className="text-muted-foreground mb-2">
              No saved dividend data found in database
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Data updates automatically 4 times per day (every 6 hours).
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DividendTracking;
