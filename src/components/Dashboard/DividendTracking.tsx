
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDividendData } from "@/contexts/DividendDataContext";
import { useAuth } from "@/contexts/AuthContext";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import StatCard from "../StatCard";
import { Shield, Calendar, TrendingUp, Percent, RefreshCw, DollarSign, Database, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const DividendTracking = () => {
  const { user } = useAuth();
  const { selectedPortfolio } = usePortfolio();
  const { toast } = useToast();
  const {
    dividends,
    loading,
    lastSync,
    apiCallsToday,
    maxApiCallsPerDay,
    canMakeApiCall,
    autoSyncEnabled,
    refreshDividendData,
    forceSyncData,
    toggleAutoSync,
    getDividendSummary
  } = useDividendData();

  const [activeTab, setActiveTab] = useState('holdings');
  const isAdmin = user?.email?.includes('admin');

  const { totalAnnualIncome, totalStocks, averageYield } = getDividendSummary();

  // Prepare monthly income projection data for the chart
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
          <CardTitle>🚀 Enhanced Dividend Tracker with Auto-Save</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col justify-center items-center h-48 space-y-2">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
            <p>Loading saved dividend data...</p>
            <p className="text-sm text-muted-foreground">Using comprehensive API detection with smart limits...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!selectedPortfolio) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Enhanced Dividend Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-48">
            <p className="text-muted-foreground">Select a portfolio to view dividend data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>🌟 Enhanced Dividend Tracker with Smart API Limits</CardTitle>
          <div className="flex items-center gap-4">
            {/* Auto-Save Toggle */}
            <div className="flex items-center space-x-2">
              <Switch
                id="auto-save"
                checked={autoSyncEnabled}
                onCheckedChange={toggleAutoSync}
              />
              <Label htmlFor="auto-save" className="text-sm">
                Auto-Sync
              </Label>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={refreshDividendData}
                disabled={loading || !canMakeApiCall}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Syncing...' : `Sync (${maxApiCallsPerDay - apiCallsToday} left)`}
              </Button>

              {isAdmin && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={forceSyncData}
                  disabled={loading}
                  className="border-orange-300 text-orange-600 hover:bg-orange-50"
                >
                  <Database className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Admin Force Sync
                </Button>
              )}
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Saved Data: {totalStocks} dividend stocks • API Limit: {apiCallsToday}/{maxApiCallsPerDay} calls today
          {lastSync && ` • Last sync: ${new Date(lastSync).toLocaleString()}`}
        </p>

        {/* API Limit Warning */}
        {!canMakeApiCall && (
          <Alert className="mt-2">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Daily API limit reached ({apiCallsToday}/{maxApiCallsPerDay}). Showing saved data. Limit resets at midnight.
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>

      <CardContent>
        {totalStocks > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <StatCard 
                label="Annual Income" 
                value={`$${totalAnnualIncome.toFixed(2)}`} 
                change={{
                  value: "+7.2%",
                  percentage: "+7.2%",
                  isPositive: true
                }}
                icon={<DollarSign className="h-4 w-4" />}
              />
              <StatCard 
                label="Monthly Average" 
                value={`$${(totalAnnualIncome / 12).toFixed(2)}`} 
                change={{
                  value: "+7.2%",
                  percentage: "+7.2%",
                  isPositive: true
                }}
                icon={<Calendar className="h-4 w-4" />}
              />
              <StatCard 
                label="Dividend Stocks" 
                value={`${totalStocks}`} 
                change={{
                  value: "Saved",
                  percentage: "Database",
                  isPositive: true
                }}
                icon={<Shield className="h-4 w-4" />}
              />
              <StatCard 
                label="Average Yield" 
                value={`${averageYield.toFixed(2)}%`} 
                change={{
                  value: "+0.3%",
                  percentage: "+0.3%",
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
                <TabsTrigger value="holdings">Saved Holdings</TabsTrigger>
                <TabsTrigger value="projections">Monthly Projections</TabsTrigger>
                <TabsTrigger value="analysis">API Management</TabsTrigger>
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
                        <TableHead>Source</TableHead>
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
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              {dividend.detection_source}
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
                  Projected annual dividend income: ${totalAnnualIncome.toFixed(2)} from saved data
                </div>
              </TabsContent>
              
              <TabsContent value="analysis" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-muted rounded-lg p-4 flex flex-col items-center">
                    <Database className="h-8 w-8 mb-2 text-finance-blue" />
                    <div className="text-xs uppercase text-muted-foreground">API Calls Today</div>
                    <div className="text-2xl font-bold mt-1">{apiCallsToday}/{maxApiCallsPerDay}</div>
                  </div>
                  <div className="bg-muted rounded-lg p-4 flex flex-col items-center">
                    <TrendingUp className="h-8 w-8 mb-2 text-finance-blue" />
                    <div className="text-xs uppercase text-muted-foreground">Saved Stocks</div>
                    <div className="text-2xl font-bold mt-1">{totalStocks}</div>
                  </div>
                  <div className="bg-muted rounded-lg p-4 flex flex-col items-center">
                    <Shield className="h-8 w-8 mb-2 text-finance-blue" />
                    <div className="text-xs uppercase text-muted-foreground">Auto-sync</div>
                    <div className="text-2xl font-bold mt-1">{autoSyncEnabled ? 'ON' : 'OFF'}</div>
                  </div>
                  <div className="bg-muted rounded-lg p-4 flex flex-col items-center">
                    <Percent className="h-8 w-8 mb-2 text-finance-blue" />
                    <div className="text-xs uppercase text-muted-foreground">Avg Yield</div>
                    <div className="text-2xl font-bold mt-1">{averageYield.toFixed(1)}%</div>
                  </div>
                </div>
                <div className="text-sm text-center text-muted-foreground mt-4">
                  🌟 Smart API management with 4 calls per day limit. Data is automatically saved and persisted across sessions.
                  <br />
                  {isAdmin && 'Admin users can force sync without limits using the Force Sync button.'}
                </div>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <Database className="h-12 w-12 text-blue-500 mb-4" />
            <p className="text-muted-foreground mb-2">
              No saved dividend data found
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Click "Sync" to detect and save dividend data from your portfolio
            </p>
            <Button 
              onClick={refreshDividendData}
              disabled={loading || !canMakeApiCall}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Detecting...' : 'Detect & Save Dividends'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DividendTracking;
